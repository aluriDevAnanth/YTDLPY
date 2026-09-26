from pathlib import Path
from typing import Any, Dict, Optional
from .stages import (
    STAGE_BUNDLE_PACKING_END,
    STAGE_BUNDLE_PACKING_START,
    STAGE_COMPLETED,
    STAGE_DOWNLOAD_PROGRESS,
    STAGE_ERROR,
    STAGE_FFMPEG_SPRITES_END,
    STAGE_FFMPEG_SPRITES_PROGRESS,
    STAGE_FFMPEG_SPRITES_START,
    STAGE_INITIALIZATION_START,
    STAGE_MEDIA_DOWNLOAD_END,
    STAGE_MEDIA_DOWNLOAD_START,
    STAGE_VTT_GENERATION,
    STAGE_YT_DLP_METADATA_END,
    STAGE_YT_DLP_METADATA_START,
)
from .timestamp import get_iso8601_utc_timestamp
from .writer import write_ndjson_entry


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
        write_ndjson_entry(self.log_file_path, entry)
        return entry

    def log_initialization_start(
        self,
        video_id: str = "",
        user_id: str = "",
        url: str = "",
        format_setting: str = "",
        auth_storage_mode: str = "",
        cookies_source: str = "",
        **kwargs,
    ):
        details = {
            "video_id": video_id,
            "user_id": user_id,
            "url": url,
            "format_setting": format_setting,
            "auth_storage_mode": auth_storage_mode,
            "cookies_source": cookies_source,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_INITIALIZATION_START,
            message="Initializing video download task environment",
            details=details,
        )

    def log_initialization(self, *args, **kwargs):
        return self.log_initialization_start(*args, **kwargs)

    def log_metadata_start(self, url: str = "", **kwargs):
        details = {"url": url}
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_YT_DLP_METADATA_START,
            message=f"Extracting video metadata & format parameters via yt-dlp: {url}",
            details=details,
        )

    def log_metadata_end(self, meta_info: Optional[Dict[str, Any]] = None, **kwargs):
        meta = meta_info or kwargs
        return self.log_entry(
            stage=STAGE_YT_DLP_METADATA_END,
            message=f"Extracted metadata: '{meta.get('fulltitle') or meta.get('title')}' ({meta.get('duration')}s)",
            details={
                "title": meta.get("fulltitle") or meta.get("title"),
                "uploader": meta.get("uploader"),
                "duration": meta.get("duration"),
                "view_count": meta.get("view_count"),
                "upload_date": meta.get("upload_date"),
                "extractor": meta.get("extractor"),
                "format_id": meta.get("format_id"),
                "vcodec": meta.get("vcodec"),
                "acodec": meta.get("acodec"),
                "ext": meta.get("ext"),
            },
        )

    def log_metadata(self, meta_info: Optional[Dict[str, Any]] = None, **kwargs):
        return self.log_metadata_end(meta_info, **kwargs)

    def log_download_start(self, format_spec: str = "", out_template: str = "", **kwargs):
        details = {
            "format_spec": format_spec,
            "out_template": out_template,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_MEDIA_DOWNLOAD_START,
            message=f"Starting media stream download with format specification '{format_spec}'",
            details=details,
        )

    def log_progress(
        self, percent: float = 0.0, speed: str = "", eta: str = "", downloaded_bytes: int = 0, **kwargs
    ):
        details = {
            "percent": percent,
            "speed": speed,
            "eta": eta,
            "downloaded_bytes": downloaded_bytes,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_DOWNLOAD_PROGRESS,
            message=f"Media stream progress: {percent:.1f}% ({speed})",
            details=details,
        )

    def log_download_end(self, media_filepath: str = "", filesize: int = 0, **kwargs):
        details = {
            "media_filepath": media_filepath,
            "filesize": filesize,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_MEDIA_DOWNLOAD_END,
            message=f"Media stream download complete ({filesize} bytes)",
            details=details,
        )

    def log_ffmpeg_sprites_start(
        self,
        duration_sec: float = 0.0,
        num_threads: int = 1,
        interval: float = 10.0,
        **kwargs,
    ):
        details = {
            "duration_sec": duration_sec,
            "num_threads": num_threads,
            "interval_sec": interval,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_FFMPEG_SPRITES_START,
            message=f"Starting parallel FFmpeg thumbnail sprite generation ({num_threads} worker threads, interval {interval}s)",
            details=details,
        )

    def log_ffmpeg_sprites(self, *args, **kwargs):
        return self.log_ffmpeg_sprites_start(*args, **kwargs)

    def log_ffmpeg_sprites_progress(
        self,
        completed_thumbnails: int = 0,
        total_thumbnails: int = 0,
        percent: float = 0.0,
        **kwargs,
    ):
        details = {
            "completed": completed_thumbnails,
            "total": total_thumbnails,
            "percent": percent,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_FFMPEG_SPRITES_PROGRESS,
            message=f"FFmpeg thumbnail sprites: {completed_thumbnails}/{total_thumbnails} ({percent:.1f}%)",
            details=details,
        )

    def log_ffmpeg_sprites_end(
        self,
        total_thumbnails: int = 0,
        sprite_filepath: str = "",
        grid_cols: int = 0,
        grid_rows: int = 0,
        **kwargs,
    ):
        details = {
            "total_thumbnails": total_thumbnails,
            "sprite_filepath": sprite_filepath,
            "grid_cols": grid_cols,
            "grid_rows": grid_rows,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_FFMPEG_SPRITES_END,
            message=f"FFmpeg thumbnail sprites assembled into grid {grid_cols}x{grid_rows} ({total_thumbnails} frames)",
            details=details,
        )

    def log_vtt_generation(
        self, vtt_filepath: str = "", total_cues: int = 0, interval_sec: float = 10.0, **kwargs
    ):
        details = {
            "vtt_filepath": vtt_filepath,
            "total_cues": total_cues,
            "interval_sec": interval_sec,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_VTT_GENERATION,
            message=f"Generated WebVTT storyboard file with {total_cues} cue points ({interval_sec}s interval)",
            details=details,
        )

    def log_bundle_packing_start(
        self, total_assets: int = 0, asset_keys: Optional[list] = None, bundle_filename: str = "", asset_count: int = 0, **kwargs
    ):
        count = asset_count or total_assets
        details = {
            "total_assets": count,
            "asset_keys": asset_keys or [],
            "bundle_filename": bundle_filename,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_BUNDLE_PACKING_START,
            message=f"Packing {count} encrypted media assets into .adaumc container",
            details=details,
        )

    def log_bundle_packing_end(
        self, bundle_filepath: str = "", bundle_size_bytes: int = 0, **kwargs
    ):
        details = {
            "bundle_filepath": bundle_filepath,
            "bundle_size_bytes": bundle_size_bytes,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_BUNDLE_PACKING_END,
            message=f"Container bundle creation complete ({bundle_size_bytes} bytes)",
            details=details,
        )

    def log_completed(self, video_id: str = "", elapsed_seconds: float = 0.0, **kwargs):
        details = {
            "video_id": video_id,
            "elapsed_seconds": elapsed_seconds,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_COMPLETED,
            message=f"Video download and asset bundling completed successfully in {elapsed_seconds:.2f}s",
            details=details,
        )

    def log_completion(self, *args, **kwargs):
        return self.log_completed(*args, **kwargs)

    def log_error(
        self,
        stage: str = "",
        error_message: str = "",
        traceback_str: Optional[str] = None,
        **kwargs,
    ):
        details = {
            "failed_stage": stage,
            "error": error_message,
            "traceback": traceback_str,
        }
        details.update(kwargs)
        return self.log_entry(
            stage=STAGE_ERROR,
            level="ERROR",
            message=f"Failed during stage '{stage}': {error_message}",
            details=details,
        )
