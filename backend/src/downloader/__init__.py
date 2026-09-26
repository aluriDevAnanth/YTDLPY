"""Downloader module exporting registry, engine and resumption functions."""

from src.downloader.engine import process_video_download
from src.downloader.registry import (
    ActiveDownloadRegistry,
    download_registry,
    get_optimal_thread_count,
)
from src.downloader.resumption import resume_uncompleted_downloads
from src.downloader.sprite_generator import generate_vtt_sprites_parallel
from src.downloader.ytdlp_runner import (
    build_ytdlp_options,
    run_ytdlp_with_fallback,
)
from src.utils.formatters import format_size

__all__ = [
    "ActiveDownloadRegistry",
    "download_registry",
    "get_optimal_thread_count",
    "generate_vtt_sprites_parallel",
    "build_ytdlp_options",
    "run_ytdlp_with_fallback",
    "process_video_download",
    "resume_uncompleted_downloads",
    "format_size",
]
