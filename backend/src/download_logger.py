import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional


def get_iso8601_utc_timestamp() -> str:
    """Returns ISO 8601 UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ format."""
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class DownloadLogger:
    def __init__(self, temp_dir: Path, filename: str = "download.ndjson"):
        self.log_file_path = temp_dir / filename
        self.filename = filename
        temp_dir.mkdir(parents=True, exist_ok=True)

    def log_entry(
        self,
        stage: str,
        message: str,
        level: str = "INFO",
        details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Appends a Newline-Delimited JSON (NDJSON) entry to download.ndjson."""
        entry = {
            "timestamp": get_iso8601_utc_timestamp(),
            "stage": stage.upper(),
            "level": level.upper(),
            "message": message,
            "details": details or {},
        }

        try:
            line = json.dumps(entry, ensure_ascii=False) + "\n"
            with open(self.log_file_path, "a", encoding="utf-8") as f:
                f.write(line)
        except Exception as e:
            print(f"[DownloadLogger Error] Failed to write log entry: {e}")

        return entry

    # --- 1. INITIALIZATION STAGE ---
    def log_initialization_start(
        self,
        video_id: str,
        user_id: str,
        url: str,
        format_setting: str,
        auth_storage_mode: str,
        cookies_source: str,
    ):
        return self.log_entry(
            stage="INITIALIZATION_START",
            message="Initializing video download task environment",
            details={
                "video_id": video_id,
                "user_id": user_id,
                "url": url,
                "format_setting": format_setting,
                "auth_storage_mode": auth_storage_mode,
                "cookies_source": cookies_source,
            },
        )

    # Legacy alias
    def log_initialization(self, *args, **kwargs):
        return self.log_initialization_start(*args, **kwargs)

    # --- 2. YT-DLP METADATA EXTRACTION STAGE ---
    def log_metadata_start(self, url: str):
        return self.log_entry(
            stage="YT_DLP_METADATA_START",
            message=f"Extracting video metadata & format parameters via yt-dlp: {url}",
            details={"url": url},
        )

    def log_metadata_end(self, meta_info: Dict[str, Any]):
        return self.log_entry(
            stage="YT_DLP_METADATA_END",
            message=f"Extracted metadata: '{meta_info.get('fulltitle') or meta_info.get('title')}' ({meta_info.get('duration')}s)",
            details={
                "title": meta_info.get("fulltitle") or meta_info.get("title"),
                "uploader": meta_info.get("uploader"),
                "duration": meta_info.get("duration"),
                "view_count": meta_info.get("view_count"),
                "upload_date": meta_info.get("upload_date"),
                "extractor": meta_info.get("extractor"),
                "format_id": meta_info.get("format_id"),
                "vcodec": meta_info.get("vcodec"),
                "acodec": meta_info.get("acodec"),
                "ext": meta_info.get("ext"),
            },
        )

    # Legacy alias
    def log_metadata(self, meta_info: Dict[str, Any]):
        return self.log_metadata_end(meta_info)

    # --- 3. MEDIA DOWNLOAD STAGE ---
    def log_download_start(self, format_spec: str, out_template: str):
        return self.log_entry(
            stage="MEDIA_DOWNLOAD_START",
            message=f"Starting media stream download with format specification '{format_spec}'",
            details={
                "format_spec": format_spec,
                "out_template": out_template,
            },
        )

    def log_progress(self, percent: float, speed: str, eta: str, downloaded_bytes: int):
        return self.log_entry(
            stage="DOWNLOAD_PROGRESS",
            message=f"Media stream progress: {percent:.1f}% ({speed})",
            details={
                "percent": percent,
                "speed": speed,
                "eta": eta,
                "downloaded_bytes": downloaded_bytes,
            },
        )

    def log_download_end(self, media_filepath: str, filesize: int):
        return self.log_entry(
            stage="MEDIA_DOWNLOAD_END",
            message=f"Media stream download complete ({filesize} bytes)",
            details={
                "media_filepath": media_filepath,
                "filesize": filesize,
            },
        )

    # --- 4. FFMPEG SPRITES STAGE ---
    def log_ffmpeg_sprites_start(
        self,
        duration_sec: float,
        num_threads: int,
        interval: float,
    ):
        return self.log_entry(
            stage="FFMPEG_SPRITES_START",
            message=f"Starting parallel FFmpeg thumbnail sprite generation ({num_threads} worker threads, interval {interval}s)",
            details={
                "duration_sec": duration_sec,
                "num_threads": num_threads,
                "interval_sec": interval,
            },
        )

    def log_ffmpeg_sprites_progress(
        self,
        duration_sec: float,
        num_threads: int,
        interval: float,
        total_chunks: int,
        completed_chunks: int,
    ):
        return self.log_entry(
            stage="FFMPEG_SPRITES_PROGRESS",
            message=f"VTT Thumbnail sprite progress: {completed_chunks}/{total_chunks} chunk segments completed",
            details={
                "duration_sec": duration_sec,
                "num_threads": num_threads,
                "interval_sec": interval,
                "total_chunks": total_chunks,
                "completed_chunks": completed_chunks,
            },
        )

    # Legacy alias
    def log_ffmpeg_sprites(self, *args, **kwargs):
        return self.log_ffmpeg_sprites_progress(*args, **kwargs)

    def log_ffmpeg_sprites_end(
        self,
        total_sprite_sheets: int,
        total_vtt_cues: int,
    ):
        return self.log_entry(
            stage="FFMPEG_SPRITES_END",
            message=f"FFmpeg thumbnail sprite generation finished ({total_sprite_sheets} sheets, {total_vtt_cues} cues)",
            details={
                "total_sprite_sheets": total_sprite_sheets,
                "total_vtt_cues": total_vtt_cues,
            },
        )

    # --- 5. BUNDLE PACKING STAGE ---
    def log_bundle_packing_start(self, bundle_filename: str, asset_count: int):
        return self.log_entry(
            stage="BUNDLE_PACKING_START",
            message=f"Starting asset packaging into .adaumc bundle file ({asset_count} assets)",
            details={
                "bundle_filename": bundle_filename,
                "asset_count": asset_count,
            },
        )

    def log_bundle_packing_end(
        self,
        bundle_path_name: str,
        asset_files: Dict[str, str],
        total_bytes: int,
    ):
        return self.log_entry(
            stage="BUNDLE_PACKING_END",
            message=f"Successfully packed assets into .adaumc bundle: {bundle_path_name} ({total_bytes} bytes)",
            details={
                "bundle_filename": bundle_path_name,
                "asset_files": asset_files,
                "total_bytes": total_bytes,
            },
        )

    # Legacy alias
    def log_bundle_packing(self, *args, **kwargs):
        return self.log_bundle_packing_end(*args, **kwargs)

    # --- 6. COMPLETION & ERROR STAGES ---
    def log_completion(self, video_id: str, total_time_sec: float):
        return self.log_entry(
            stage="COMPLETED",
            message=f"Video download lifecycle completed successfully in {total_time_sec:.2f} seconds",
            details={
                "video_id": video_id,
                "total_time_sec": round(total_time_sec, 2),
            },
        )

    def log_error(self, stage: str, error_msg: str, traceback_str: str = ""):
        return self.log_entry(
            stage=stage,
            level="ERROR",
            message=f"Task failed during {stage}: {error_msg}",
            details={
                "error": error_msg,
                "traceback": traceback_str,
            },
        )
