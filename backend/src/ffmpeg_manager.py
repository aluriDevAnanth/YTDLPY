# Re-export ffmpeg manager functions from modular ffmpeg package for 100% backward compatibility
from src.ffmpeg import (
    FFMPEG_WIN_URL,
    ensure_ffmpeg_installed,
    format_eta,
    format_size,
    get_ffmpeg_path,
    get_ffprobe_path,
)

__all__ = [
    "FFMPEG_WIN_URL",
    "get_ffmpeg_path",
    "get_ffprobe_path",
    "format_size",
    "format_eta",
    "ensure_ffmpeg_installed",
]
