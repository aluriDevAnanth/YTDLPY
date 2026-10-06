"""
Mock generator for yt-dlp downloader and metadata extractor.
"""
from typing import Any, Callable, Dict, Optional
from unittest.mock import MagicMock
from tests.fixtures.data_factories import YTDLP_METADATA_DATASETS


class MockYoutubeDL:
    def __init__(self, params: Optional[Dict[str, Any]] = None, dataset_index: int = 0):
        self.params = params or {}
        self.dataset_index = dataset_index % len(YTDLP_METADATA_DATASETS)
        self._meta = YTDLP_METADATA_DATASETS[self.dataset_index]

    def extract_info(self, url: str, download: bool = False, **kwargs) -> Dict[str, Any]:
        info = self._meta.copy()
        info["webpage_url"] = url
        return info

    def download(self, urls: list[str]) -> int:
        hook = self.params.get("progress_hooks", [])
        for h in hook:
            # Simulate progress steps
            h({"status": "downloading", "downloaded_bytes": 1024 * 1024, "total_bytes": 10 * 1024 * 1024, "speed": 1024 * 512, "eta": 18})
            h({"status": "finished", "filename": "downloaded_video.mp4", "total_bytes": 10 * 1024 * 1024})
        return 0

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
