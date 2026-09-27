"""Core video download processing pipeline orchestrating metadata, extraction, sprite generation and bundle packaging."""

import asyncio
import hashlib
import time
import traceback
from pathlib import Path
from typing import Dict

from sqlmodel import select
from src import config, db
from src.browser_cookie_manager import resolve_effective_cookies
from src.bundle_manager import BundleManager
from src.downloader.registry import download_registry
from src.downloader.sprite_generator import generate_vtt_sprites_parallel
from src.downloader.ytdlp_runner import (
    build_ytdlp_options,
    run_ytdlp_with_fallback,
)
from src.download_logger import DownloadLogger
from src.logger import log_error, log_success, log_warning
from src.models import UserSettings, Video
from src.sio import (
    send_admin_event,
    send_notify,
    send_remove_video,
    send_status_update,
    send_video_message,
)
from src.utils.file_ops import safe_copy_file, safe_move_file, safe_rmtree
from src.utils.formatters import format_duration, format_eta, format_size


async def process_video_download(video_id: str, loop: asyncio.AbstractEventLoop):
    """Background task processing video download, seeking sprite generation, and bundle creation."""
    download_registry.register(video_id)
    video_temp_dir = config.TEMP_DIR / video_id
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
        effective_cookies = await resolve_effective_cookies(user_settings, session)

    d_logger = DownloadLogger(video_temp_dir, filename="download.ndjson")
    start_time_ts = time.time()
    d_logger.log_initialization_start(
        video_id=video_id,
        user_id=user_id,
        url=url,
        format_setting=req_format,
        auth_storage_mode=getattr(user_settings, "auth_storage_mode", "local")
        if user_settings
        else "local",
        cookies_source=effective_cookies.get("source", "none"),
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

            if d.get("status") == "downloading":
                total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                downloaded = d.get("downloaded_bytes") or 0
                percent = (downloaded / total * 100) if total > 0 else 0

                if download_registry.is_paused(video_id):
                    paused_payload = {
                        "id": video_id,
                        "videoId": video_id,
                        "downloadStatus": "paused",
                        "eta": "Paused",
                        "percent": round(percent, 1),
                        "speed": "Paused",
                        "downloadedSize": format_size(downloaded),
                        "totalSize": format_size(total),
                    }
                    asyncio.run_coroutine_threadsafe(
                        send_status_update(paused_payload, user_id), loop
                    )
                    was_active = download_registry.wait_if_paused(video_id)
                    if not was_active:
                        raise Exception("Download cancelled by user")
            elif download_registry.is_paused(video_id):
                was_active = download_registry.wait_if_paused(video_id)
                if not was_active:
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

        ydl_opts, format_spec, out_template = build_ytdlp_options(
            req_format, video_temp_dir, progress_hook, effective_cookies
        )

        d_logger.log_metadata_start(url=url)
        d_logger.log_download_start(format_spec=format_spec, out_template=out_template)

        def run_ytdlp():
            run_ytdlp_with_fallback(url, ydl_opts, effective_cookies)

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

        asset_files: Dict[str, str] = {"thumbnail": final_thumb_name}
        vtt_filename = "preview.vtt"

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

            try:
                await generate_vtt_sprites_parallel(
                    video_id=video_id,
                    final_media_path=final_media_path,
                    video_temp_dir=video_temp_dir,
                    duration_sec=duration_sec,
                    user_id=user_id,
                    d_logger=d_logger,
                    asset_files=asset_files,
                    final_thumb_name=final_thumb_name,
                    vtt_filename=vtt_filename,
                )
            except Exception as sprite_err:
                log_warning(
                    f"Error during parallel sprite generation for {video_id}: {sprite_err}. Using thumbnail fallback."
                )
                dummy_sprite = video_temp_dir / "sprite_1.jpg"
                thumb_source = video_temp_dir / final_thumb_name
                if thumb_source.exists() and thumb_source.stat().st_size > 0:
                    safe_copy_file(thumb_source, dummy_sprite)
                elif not dummy_sprite.exists():
                    dummy_sprite.write_bytes(b"")
                asset_files["vtt_sprite_1"] = dummy_sprite.name
                asset_files["vtt_sprite"] = dummy_sprite.name
                dur_val = duration_sec if duration_sec and duration_sec > 0 else 300
                vtt_path = video_temp_dir / vtt_filename
                vtt_path.write_text(
                    f"WEBVTT\n\n1\n00:00:00.000 --> {format_duration(dur_val)}.000\n{video_id}_vtt_sprite_1.jpg#xywh=0,0,160,90\n",
                    encoding="utf-8",
                )

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
        try:
            d_logger.log_error(
                stage="DOWNLOAD_TASK",
                error_msg=str(e),
                traceback_str=traceback.format_exc(),
            )
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
                if "cancelled" in str(e).lower():
                    await session.delete(vid_record)
                    await session.commit()
                    await send_remove_video(video_id, user_id)
                else:
                    vid_record.downloadStatus = "failed"
                    vid_record.downloaded = False
                    session.add(vid_record)
                    await session.commit()
                    await session.refresh(vid_record)
                    await send_video_message(vid_record.dict(), user_id)
        await send_notify(
            "error", "Download Failed", f"Failed to download video: {str(e)}", user_id
        )
    finally:
        download_registry.unregister(video_id)
