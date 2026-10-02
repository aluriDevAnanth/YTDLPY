"""Video router facade exporting submodules for backward compatibility."""

from src.downloader import process_video_download
from src.routes.video import router

__all__ = ["router", "process_video_download"]

