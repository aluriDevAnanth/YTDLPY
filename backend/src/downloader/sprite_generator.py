"""Parallel FFmpeg seeking sprite and WebVTT timeline preview generation."""

import asyncio
import math
import subprocess
from pathlib import Path
from typing import Dict

from src.downloader.registry import (
    GLOBAL_SPRITE_SEMAPHORE,
    download_registry,
    get_optimal_thread_count,
)
from src.download_logger import DownloadLogger
from src.ffmpeg_manager import get_ffmpeg_path
from src.logger import log_warning
from src.sio import send_status_update
from src.utils.file_ops import safe_copy_file, safe_os_replace
from src.utils.formatters import format_vtt_timestamp


async def generate_vtt_sprites_parallel(
    video_id: str,
    final_media_path: Path,
    video_temp_dir: Path,
    duration_sec: float,
    user_id: str,
    d_logger: DownloadLogger,
    asset_files: Dict[str, str],
    final_thumb_name: str,
    vtt_filename: str = "preview.vtt",
):
    """Extracts video seeking sprites in parallel using FFmpeg and compiles a WebVTT storyboard."""
    ffmpeg_bin = get_ffmpeg_path()
    vtt_path = video_temp_dir / vtt_filename
    dur = duration_sec if (duration_sec and duration_sec > 0) else 300
    duration_mins = dur / 60.0
    num_threads = get_optimal_thread_count(duration_mins)

    if dur <= 300:
        interval = 2.0
    elif dur <= 900:
        interval = 3.0
    elif dur <= 1800:
        interval = 5.0
    elif dur <= 3600:
        interval = 10.0
    elif dur <= 7200:
        interval = 15.0
    else:
        interval = 20.0

    grid_dim = 10
    capacity_per_sheet = grid_dim * grid_dim
    tile_w, tile_h = 160, 90

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
            if download_registry.is_paused(video_id):
                was_active = await asyncio.to_thread(
                    download_registry.wait_if_paused, video_id
                )
                if not was_active:
                    return

            c_start = chunk_idx * chunk_duration
            c_duration = min(dur - c_start, chunk_duration)
            out_pattern = str(video_temp_dir / f"chunk_{chunk_idx}_sprite_%d.jpg")
            cmd = [
                ffmpeg_bin,
                "-y",
                "-ss",
                f"{c_start:.2f}",
                "-t",
                f"{c_duration:.2f}",
                "-skip_frame",
                "nokey",
                "-i",
                str(final_media_path),
                "-vf",
                f"fps=1/{interval:.4f},scale={tile_w}:{tile_h}:flags=fast_bilinear,tile={grid_dim}x{grid_dim}",
                "-q:v",
                "3",
                out_pattern,
            ]

            def _exec():
                try:
                    res = subprocess.run(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        timeout=60,
                    )
                    if res.returncode != 0:
                        cmd_fallback = [
                            ffmpeg_bin,
                            "-y",
                            "-ss",
                            f"{c_start:.2f}",
                            "-t",
                            f"{c_duration:.2f}",
                            "-i",
                            str(final_media_path),
                            "-vf",
                            f"fps=1/{interval:.4f},scale={tile_w}:{tile_h}:flags=fast_bilinear,tile={grid_dim}x{grid_dim}",
                            "-q:v",
                            "3",
                            out_pattern,
                        ]
                        subprocess.run(
                            cmd_fallback,
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                            timeout=45,
                        )
                except Exception as exc:
                    log_warning(
                        f"FFmpeg chunk {chunk_idx} sprite extraction failed: {exc}"
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
    global_sheet_counter = 0
    cue_counter = 0

    for c_idx in range(num_threads):
        c_start = c_idx * chunk_duration
        c_end = min(dur, (c_idx + 1) * chunk_duration)
        chunk_sprites = sorted(
            list(video_temp_dir.glob(f"chunk_{c_idx}_sprite_*.jpg"))
        )

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
                frame_start_sec = (
                    c_start + (start_tile_in_chunk + tile_idx) * interval
                )
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
        thumb_source = video_temp_dir / final_thumb_name
        if thumb_source.exists() and thumb_source.stat().st_size > 0:
            safe_copy_file(thumb_source, dummy_sprite)
        elif not dummy_sprite.exists():
            dummy_sprite.write_bytes(b"")
        asset_files["vtt_sprite_1"] = dummy_sprite.name
        asset_files["vtt_sprite"] = dummy_sprite.name
        dur_val = duration_sec if duration_sec and duration_sec > 0 else 300
        vtt_lines.append(
            f"1\n00:00:00.000 --> {format_vtt_timestamp(dur_val)}\n{video_id}_vtt_sprite_1.jpg#xywh=0,0,{tile_w},{tile_h}\n\n"
        )

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
