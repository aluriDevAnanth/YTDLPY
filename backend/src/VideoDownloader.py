"""Video downloader facade exporting downloader submodules for backward compatibility."""

from src.downloader import (
    ActiveDownloadRegistry,
    build_ytdlp_options,
    download_registry,
    generate_vtt_sprites_parallel,
    get_optimal_thread_count,
    process_video_download,
    resume_uncompleted_downloads,
    run_ytdlp_with_fallback,
)
from src.utils.file_ops import (
    safe_copy_file,
    safe_move_file,
    safe_os_rename,
    safe_os_replace,
    safe_rmtree,
)
from src.config import BUNDLES_DIR, STORAGE_DIR, TEMP_DIR
from src.utils.formatters import (
    format_duration,
    format_eta,
    format_size,
    format_vtt_timestamp,
)

__all__ = [
    "ActiveDownloadRegistry",
    "download_registry",
    "get_optimal_thread_count",
    "generate_vtt_sprites_parallel",
    "build_ytdlp_options",
    "run_ytdlp_with_fallback",
    "process_video_download",
    "resume_uncompleted_downloads",
    "safe_os_replace",
    "safe_os_rename",
    "safe_move_file",
    "safe_copy_file",
    "safe_rmtree",
    "format_size",
    "format_duration",
    "format_vtt_timestamp",
    "format_eta",
]
