import asyncio
import hashlib
import math
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Optional

import yt_dlp
from sqlmodel import select
from src import db
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR, STORAGE_DIR, TEMP_DIR
from src.download_logger import DownloadLogger
from src.ffmpeg_manager import get_ffmpeg_path
from src.logger import log_error, log_info, log_success
from src.models import UserSettings, Video
from src.sio import (
    send_admin_event,
    send_notify,
    send_remove_video,
    send_status_update,
    send_video_message,
)


class ActiveDownloadRegistry:
    def __init__(self):
        self._active: Dict[str, bool] = {}

    def register(self, video_id: str):
        self._active[video_id] = True

    def cancel(self, video_id: str):
        self._active[video_id] = False

    def is_active(self, video_id: str) -> bool:
        return self._active.get(video_id, False)

    def unregister(self, video_id: str):
        if video_id in self._active:
            del self._active[video_id]


download_registry = ActiveDownloadRegistry()
CPU_COUNT = os.cpu_count() or 4
GLOBAL_SEMAPHORE_LIMIT = CPU_COUNT * 2
GLOBAL_SPRITE_SEMAPHORE = asyncio.Semaphore(GLOBAL_SEMAPHORE_LIMIT)


def get_optimal_thread_count(duration_mins: float) -> int:
    if duration_mins < 30:
        return 1
    needed = max(2, int(math.floor(duration_mins / 30)))
    max_cap = min(8, CPU_COUNT)
    return min(max_cap, needed)


import time

_orig_os_replace = os.replace
_orig_os_rename = os.rename


def safe_os_replace(src, dst, retries: int = 10, delay: float = 0.3):
    """Safely replace a file, retrying if Windows holds a transient file lock ([WinError 32])."""
    for i in range(retries):
        try:
            return _orig_os_replace(src, dst)
        except (PermissionError, OSError) as err:
            if (
                getattr(err, "winerror", None) == 32
                or getattr(err, "errno", None) == 13
            ):
                if i < retries - 1:
                    time.sleep(delay)
                    continue
            raise


def safe_os_rename(src, dst, retries: int = 10, delay: float = 0.3):
    """Safely rename a file, retrying if Windows holds a transient file lock ([WinError 32])."""
    for i in range(retries):
        try:
            return _orig_os_rename(src, dst)
        except (PermissionError, OSError) as err:
            if (
                getattr(err, "winerror", None) == 32
                or getattr(err, "errno", None) == 13
            ):
                if i < retries - 1:
                    time.sleep(delay)
                    continue
            raise


os.replace = safe_os_replace
os.rename = safe_os_rename


def safe_move_file(src: Path, dst: Path, retries: int = 5, delay: float = 0.5):
    """Safely move a file on Windows, retrying if the file is temporarily locked by background processes."""
    if src == dst:
        return
    for i in range(retries):
        try:
            if dst.exists():
                dst.unlink()
            shutil.move(str(src), str(dst))
            return
        except (PermissionError, OSError):
            if i == retries - 1:
                raise
            time.sleep(delay)


def safe_copy_file(src: Path, dst: Path, retries: int = 5, delay: float = 0.5):
    """Safely copy a file on Windows, retrying if the file is temporarily locked by background processes."""
    if src == dst:
        return
    for i in range(retries):
        try:
            shutil.copy(str(src), str(dst))
            return
        except (PermissionError, OSError):
            if i == retries - 1:
                raise
            time.sleep(delay)


def safe_rmtree(path: Path, retries: int = 10, delay: float = 0.2):
    """Safely delete directory on Windows, retrying if files are temporarily locked."""
    if not path.exists():
        return
    import gc

    def remove_readonly(func, p, exc_info):
        try:
            os.chmod(p, 0o777)
            func(p)
        except Exception as ex:
            print(f"FAILED TO DELETE {p}: {ex}")

    for i in range(retries):
        gc.collect()
        try:
            shutil.rmtree(path, onerror=remove_readonly)
        except (PermissionError, OSError):
            pass
        if not path.exists():
            return
        time.sleep(delay)


def format_size(bytes_val: float) -> str:
    if not bytes_val or bytes_val <= 0:
        return "0 MiB"
    if bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KiB"
    elif bytes_val < 1024 * 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.1f} MiB"
    else:
        return f"{bytes_val / (1024 * 1024 * 1024):.1f} GiB"


def format_duration(seconds: float) -> str:
    if not seconds or seconds <= 0:
        return "00:00"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def format_vtt_timestamp(seconds: float) -> str:
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    sec_int = int(s)
    ms = int((s - sec_int) * 1000)
    return f"{int(h):02d}:{int(m):02d}:{sec_int:02d}.{ms:03d}"


def format_eta(eta_sec: float) -> str:
    if not eta_sec or eta_sec <= 0:
        return "0s"
    if eta_sec < 60:
        return f"{int(eta_sec)}s"
    m, s = divmod(int(eta_sec), 60)
    return f"{m}m {s}s"


async def process_video_download(video_id: str, loop: asyncio.AbstractEventLoop):
    """Background task processing video download and seeking sprite generation."""
    download_registry.register(video_id)
    video_temp_dir = TEMP_DIR / video_id
    video_temp_dir.mkdir(parents=True, exist_ok=True)
    async with db.async_session_maker() as session:
        result = await session.exec(select(Video).where(Video.id == video_id))
        video = result.first()
        if not video:
            safe_rmtree(video_temp_dir)
            return
        user_id = video.userId
        url = video.url
        req_format = video.format
        req_type = video.type
        settings_result = await session.exec(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        user_settings = settings_result.first()
    d_logger = DownloadLogger(video_temp_dir, filename="download.ndjson")
    start_time_ts = time.time()
    d_logger.log_initialization_start(
        video_id=video_id,
        user_id=user_id,
        url=url,
        format_setting=req_format,
        auth_storage_mode=getattr(user_settings, "auth_storage_mode", "local") if user_settings else "local",
        cookies_source=getattr(user_settings, "cookies_source", "none") if user_settings else "none",
    )
    has_sent_initial_metadata = False
    title = ""
    duration_sec = 0
    filesize = 0
    resolution = ""
    try:

        def progress_hook(d):
            nonlocal has_sent_initial_metadata, title, duration_sec, filesize, resolution
            if not download_registry.is_active(video_id):
                raise Exception("Download cancelled by user")
            info = d.get("info_dict") or {}
            if not has_sent_initial_metadata and info and info.get("title"):
                has_sent_initial_metadata = True
                title = info.get("title", "Video")
                duration_sec = info.get("duration") or 0
                height = info.get("height")
                resolution = f"{height}p" if height else "HD"
                filesize = (
                    info.get("filesize")
                    or info.get("filesize_approx")
                    or d.get("total_bytes")
                    or d.get("total_bytes_estimate")
                    or 0
                )
                d_logger.log_metadata_end(info)

                async def update_initial_db():
                    async with db.async_session_maker() as session:
                        res = await session.exec(
                            select(Video).where(Video.id == video_id)
                        )
                        vid_rec = res.first()
                        if vid_rec:
                            vid_rec.fullTitle = title
                            vid_rec.durationString = format_duration(duration_sec)
                            vid_rec.resolution = resolution
                            vid_rec.size = format_size(filesize)
                            vid_rec.downloadStatus = "downloading"
                            session.add(vid_rec)
                            await session.commit()
                            await session.refresh(vid_rec)
                            await send_video_message(vid_rec.dict(), user_id)

                asyncio.run_coroutine_threadsafe(update_initial_db(), loop)
            if d["status"] == "downloading":
                total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                downloaded = d.get("downloaded_bytes") or 0
                speed = d.get("speed") or 0
                eta = d.get("eta") or 0
                percent = (downloaded / total * 100) if total > 0 else 0
                progress_payload = {
                    "id": video_id,
                    "videoId": video_id,
                    "eta": format_eta(eta),
                    "percent": round(percent, 1),
                    "speed": f"{format_size(speed)}/s",
                    "downloadedSize": format_size(downloaded),
                    "totalSize": format_size(total),
                }
                asyncio.run_coroutine_threadsafe(
                    send_status_update(progress_payload, user_id), loop
                )

        format_spec = "bestvideo+bestaudio/best"
        if req_format == "BESTAUDIO":
            format_spec = "bestaudio/best"
        elif req_format == "WORST":
            format_spec = "worst"
        out_template = str(video_temp_dir / "video.%(ext)s")
        ydl_opts = {
            "format": format_spec,
            "outtmpl": out_template,
            "writethumbnail": True,
            "progress_hooks": [progress_hook],
            "merge_output_format": "mp4",
            "ffmpeg_location": get_ffmpeg_path(),
            "nopart": True,
            "continue_dl": True,
            "updatetime": False,
            "quiet": True,
            "no_warnings": True,
        }
        if user_settings:
            if (
                user_settings.cookies_source == "browser"
                and user_settings.cookies_browser
            ):
                ydl_opts["cookiesfrombrowser"] = (user_settings.cookies_browser,)
            elif user_settings.cookies_source == "custom" and user_settings.cookies_txt:
                cookies_file = video_temp_dir / "cookies.txt"
                cookies_file.write_text(user_settings.cookies_txt, encoding="utf-8")
                ydl_opts["cookiefile"] = str(cookies_file)
            elif (
                user_settings.cookies_source == "storage_file"
                or (STORAGE_DIR / "cookies.txt").exists()
            ):
                storage_cookies = STORAGE_DIR / "cookies.txt"
                if storage_cookies.exists():
                    ydl_opts["cookiefile"] = str(storage_cookies)

        d_logger.log_metadata_start(url=url)
        d_logger.log_download_start(format_spec=format_spec, out_template=out_template)

        def run_ytdlp():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

        await asyncio.to_thread(run_ytdlp)
        if not download_registry.is_active(video_id):
            raise Exception("Download cancelled by user")
        media_file = None
        thumb_file = None
        for f in video_temp_dir.iterdir():
            if f.name in ["thumbnail.jpg", "preview.vtt", "sprite.jpg"]:
                continue
            if f.suffix.lower() in [
                ".mp4",
                ".mkv",
                ".webm",
                ".m4a",
                ".mp3",
                ".flv",
                ".avi",
            ]:
                if not f.name.endswith(".temp.mp4") and not f.name.endswith(".part"):
                    media_file = f
            elif f.suffix.lower() in [".webp", ".jpg", ".png"]:
                thumb_file = f
        final_thumb_name = "thumbnail.jpg"
        final_thumb_path = video_temp_dir / final_thumb_name
        if thumb_file and thumb_file.exists() and thumb_file != final_thumb_path:
            safe_move_file(thumb_file, final_thumb_path)
        elif not final_thumb_path.exists():
            with open(final_thumb_path, "wb") as f:
                f.write(b"")
        asset_files = {"thumbnail": final_thumb_name}
        vtt_filename = "preview.vtt"
        sprite_filename = "sprite.jpg"
        if req_type == "download" and media_file and media_file.exists():
            d_logger.log_download_end(
                media_filepath=str(media_file),
                filesize=media_file.stat().st_size,
            )
            final_media_name = "video.mp4"
            final_media_path = video_temp_dir / final_media_name
            if media_file != final_media_path:
                safe_move_file(media_file, final_media_path)
            asset_files["video"] = final_media_name
            async with db.async_session_maker() as session:
                res = await session.exec(select(Video).where(Video.id == video_id))
                vid_rec = res.first()
                if vid_rec:
                    vid_rec.downloadStatus = "generating_sprites"
                    session.add(vid_rec)
                    await session.commit()
                    await session.refresh(vid_rec)
                    await send_video_message(vid_rec.dict(), user_id)
            if not download_registry.is_active(video_id):
                raise Exception("Download cancelled by user")

            async def generate_vtt_sprites_parallel():
                ffmpeg_bin = get_ffmpeg_path()
                vtt_path = video_temp_dir / vtt_filename
                dur = duration_sec if (duration_sec and duration_sec > 0) else 300
                duration_mins = dur / 60.0
                num_threads = get_optimal_thread_count(duration_mins)

                if dur <= 600:
                    interval = 1.0
                elif dur <= 1800:
                    interval = 2.0
                elif dur <= 3600:
                    interval = 3.0
                elif dur <= 7200:
                    interval = 4.0
                else:
                    interval = 5.0

                needed_tiles = max(12, int(math.ceil(dur / interval)))
                grid_dim = 19
                capacity_per_sheet = grid_dim * grid_dim

                await send_status_update(
                    {
                        "id": video_id,
                        "videoId": video_id,
                        "percent": 0.0,
                        "speed": "FFmpeg Parallel",
                        "eta": "Finalizing...",
                        "downloadedSize": "Sprite",
                        "totalSize": f"{num_threads} Threads",
                    },
                    user_id,
                )

                chunk_duration = dur / num_threads
                completed_chunks = 0

                async def process_chunk(chunk_idx: int):
                    nonlocal completed_chunks
                    async with GLOBAL_SPRITE_SEMAPHORE:
                        if not download_registry.is_active(video_id):
                            return
                        c_start = chunk_idx * chunk_duration
                        c_end = min(dur, (chunk_idx + 1) * chunk_duration)
                        out_pattern = str(video_temp_dir / f"chunk_{chunk_idx}_sprite_%d.jpg")
                        cmd = [
                            ffmpeg_bin,
                            "-y",
                            "-ss", f"{c_start:.2f}",
                            "-to", f"{c_end:.2f}",
                            "-i", str(final_media_path),
                            "-vf", f"fps=1/{interval:.4f},scale=240:135,tile={grid_dim}x{grid_dim}",
                            "-q:v", "3",
                            out_pattern,
                        ]
                        def _exec():
                            subprocess.run(
                                cmd,
                                stdout=subprocess.DEVNULL,
                                stderr=subprocess.DEVNULL,
                                check=True,
                            )
                        await asyncio.to_thread(_exec)
                        completed_chunks += 1
                        pct = min(99.0, round((completed_chunks / num_threads) * 100.0, 1))
                        d_logger.log_ffmpeg_sprites(
                            duration_sec=dur,
                            num_threads=num_threads,
                            interval=interval,
                            total_chunks=num_threads,
                            completed_chunks=completed_chunks,
                        )
                        await send_status_update(
                            {
                                "id": video_id,
                                "videoId": video_id,
                                "eta": "Generating preview...",
                                "percent": pct,
                                "speed": "FFmpeg Parallel",
                                "downloadedSize": "Sprite",
                                "totalSize": f"{num_threads} Threads",
                            },
                            user_id,
                        )

                d_logger.log_ffmpeg_sprites_start(
                    duration_sec=dur,
                    num_threads=num_threads,
                    interval=interval,
                )
                tasks = [process_chunk(i) for i in range(num_threads)]
                await asyncio.gather(*tasks)

                vtt_lines = ["WEBVTT\n\n"]
                tile_w, tile_h = 240, 135
                global_sheet_counter = 0
                cue_counter = 0

                for c_idx in range(num_threads):
                    c_start = c_idx * chunk_duration
                    c_end = min(dur, (c_idx + 1) * chunk_duration)
                    chunk_sprites = sorted(list(video_temp_dir.glob(f"chunk_{c_idx}_sprite_*.jpg")))

                    if not chunk_sprites:
                        continue

                    chunk_duration_actual = max(0.1, c_end - c_start)
                    chunk_frame_count = int(math.ceil(chunk_duration_actual / interval))

                    for s_idx, raw_file in enumerate(chunk_sprites, start=1):
                        global_sheet_counter += 1
                        target_name = video_temp_dir / f"sprite_{global_sheet_counter}.jpg"
                        if raw_file != target_name:
                            safe_os_replace(raw_file, target_name)

                        asset_files[f"vtt_sprite_{global_sheet_counter}"] = target_name.name
                        if global_sheet_counter == 1:
                            asset_files["vtt_sprite"] = target_name.name

                        start_tile_in_chunk = (s_idx - 1) * capacity_per_sheet
                        tiles_in_this_sheet = min(
                            capacity_per_sheet,
                            max(1, chunk_frame_count - start_tile_in_chunk),
                        )

                        for tile_idx in range(tiles_in_this_sheet):
                            frame_start_sec = c_start + (start_tile_in_chunk + tile_idx) * interval
                            if frame_start_sec >= dur:
                                break
                            frame_end_sec = min(dur, frame_start_sec + interval)

                            row = tile_idx // grid_dim
                            col = tile_idx % grid_dim
                            x = col * tile_w
                            y = row * tile_h

                            cue_counter += 1
                            s_str = format_vtt_timestamp(frame_start_sec)
                            e_str = format_vtt_timestamp(frame_end_sec)
                            vtt_lines.append(
                                f"{cue_counter}\n{s_str} --> {e_str}\n{video_id}_vtt_sprite_{global_sheet_counter}.jpg#xywh={x},{y},{tile_w},{tile_h}\n\n"
                            )

                if global_sheet_counter == 0:
                    dummy_sprite = video_temp_dir / "sprite_1.jpg"
                    if not dummy_sprite.exists():
                        dummy_sprite.write_bytes(b"")
                    asset_files["vtt_sprite_1"] = dummy_sprite.name
                    asset_files["vtt_sprite"] = dummy_sprite.name

                with open(vtt_path, "w", encoding="utf-8") as f_vtt:
                    f_vtt.writelines(vtt_lines)

                d_logger.log_ffmpeg_sprites_end(
                    total_sprite_sheets=global_sheet_counter,
                    total_vtt_cues=cue_counter,
                )

                await send_status_update(
                    {
                        "id": video_id,
                        "videoId": video_id,
                        "percent": 100.0,
                        "speed": "FFmpeg Parallel",
                        "eta": "0s",
                        "downloadedSize": "Sprite",
                        "totalSize": "Generation",
                    },
                    user_id,
                )

            await generate_vtt_sprites_parallel()
            if not download_registry.is_active(video_id):
                raise Exception("Download cancelled by user")
            asset_files["vtt"] = vtt_filename
        async with db.async_session_maker() as session:
            res = await session.exec(select(Video).where(Video.id == video_id))
            v_rec = res.first()
            if v_rec:
                v_rec.downloadStatus = "packing_bundle"
                session.add(v_rec)
                await session.commit()
                await session.refresh(v_rec)
                await send_video_message(v_rec.dict(), user_id)

        def on_bundle_progress(written: int, total: int):
            pct = min(99.9, round((written / total) * 100.0, 1))
            progress_payload = {
                "id": video_id,
                "videoId": video_id,
                "eta": "Packing...",
                "percent": pct,
                "speed": "Bundling",
                "downloadedSize": format_size(written),
                "totalSize": format_size(total),
            }
            asyncio.run_coroutine_threadsafe(
                send_status_update(progress_payload, user_id), loop
            )

        async with db.async_session_maker() as session:
            prim_res = await session.exec(select(Video).where(Video.id == video_id))
            primary_rec = prim_res.first()
            target_url = primary_rec.url if primary_rec else ""
            target_format = primary_rec.format if primary_rec else req_format
            shared_bundle_id = (
                primary_rec.bundleId
                if (primary_rec and primary_rec.bundleId)
                else hashlib.sha256(
                    f"{target_url}_{target_format}".encode()
                ).hexdigest()[:16]
            )

        log_file = video_temp_dir / "download.ndjson"
        if log_file.exists():
            asset_files["log"] = log_file.name

        d_logger.log_bundle_packing_start(
            bundle_filename=f"{shared_bundle_id}.adaumc",
            asset_count=len(asset_files),
        )

        def build_bundle():
            return BundleManager.create_bundle(
                shared_bundle_id,
                video_temp_dir,
                asset_files,
                progress_callback=on_bundle_progress,
            )

        await asyncio.to_thread(build_bundle)
        d_logger.log_bundle_packing_end(
            bundle_path_name=f"{shared_bundle_id}.adaumc",
            asset_files=asset_files,
            total_bytes=sum(
                (video_temp_dir / fn).stat().st_size
                for fn in asset_files.values()
                if (video_temp_dir / fn).exists()
            ),
        )
        d_logger.log_completion(video_id, time.time() - start_time_ts)
        safe_rmtree(video_temp_dir)
        async with db.async_session_maker() as session:
            all_res = await session.exec(
                select(Video)
                .where(Video.url == target_url)
                .where(Video.format == target_format)
            )
            matching_records = all_res.all()
            if primary_rec and primary_rec not in matching_records:
                matching_records.append(primary_rec)
            for rec in matching_records:
                rec.bundleId = shared_bundle_id
                rec.downloadStatus = "completed" if req_type == "download" else "queued"
                rec.downloaded = req_type == "download"
                if title:
                    rec.fullTitle = title
                if duration_sec:
                    rec.durationString = format_duration(duration_sec)
                if filesize:
                    rec.size = format_size(filesize)
                if resolution:
                    rec.resolution = resolution
                session.add(rec)
                await send_video_message(rec.dict(), rec.userId)
                await send_notify(
                    "success",
                    "Video Download Completed",
                    f"Downloaded '{rec.fullTitle or title}' successfully",
                    rec.userId,
                )
            await session.commit()
            await send_admin_event("admin_stats_update")
            log_success(
                f"Video '{title}' processed successfully into single bundle '{shared_bundle_id}' for {len(matching_records)} user(s)."
            )
    except Exception as e:
        import traceback
        try:
            d_logger.log_error(stage="DOWNLOAD_TASK", error_msg=str(e), traceback_str=traceback.format_exc())
        except Exception:
            pass
        log_error(f"Error downloading video {video_id}", e)
        safe_rmtree(video_temp_dir)
        bundle_file = BundleManager.get_bundle_path(video_id)
        if bundle_file.exists():
            bundle_file.unlink()
        async with db.async_session_maker() as session:
            result = await session.exec(select(Video).where(Video.id == video_id))
            vid_record = result.first()
            if vid_record:
                await session.delete(vid_record)
                await session.commit()
        await send_remove_video(video_id, user_id)
        await send_notify(
            "error", "Download Failed", f"Failed to download video: {str(e)}", user_id
        )
    finally:
        download_registry.unregister(video_id)


async def resume_uncompleted_downloads():
    """Scans DB on backend startup for any interrupted downloads and automatically resumes them."""
    loop = asyncio.get_running_loop()
    async with db.async_session_maker() as session:
        result = await session.exec(
            select(Video).where(Video.downloaded == False, Video.type == "download")
        )
        uncompleted_videos = result.all()
        if uncompleted_videos:
            log_info(
                f"🔄 Resuming {len(uncompleted_videos)} uncompleted download(s) after backend start..."
            )
            for vid in uncompleted_videos:
                vid.downloadStatus = "queued"
                session.add(vid)
                await session.commit()
                asyncio.create_task(process_video_download(vid.id, loop))
