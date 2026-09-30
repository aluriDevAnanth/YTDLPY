from pathlib import Path
from typing import AsyncGenerator, Callable, Dict, Optional, Tuple

from .constants import MAGIC_HEADER
from .creator import create_bundle, get_bundle_path
from .indexer import read_index
from .streamer import get_asset_stream


class BundleManager:
    @staticmethod
    def get_bundle_path(video_id: str) -> Path:
        return get_bundle_path(video_id)

    @staticmethod
    def create_bundle(
        video_id: str,
        temp_dir: Path,
        asset_files: Dict[str, str],
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Path:
        return create_bundle(video_id, temp_dir, asset_files, progress_callback)

    @staticmethod
    def read_index(bundle_path: Path) -> Tuple[dict, int]:
        return read_index(bundle_path)

    @staticmethod
    async def get_asset_stream(
        bundle_id: str,
        asset_key: str,
        start_byte: int = 0,
        end_byte: Optional[int] = None,
        chunk_size: int = 1024 * 64,
    ) -> AsyncGenerator[bytes, None]:
        async for chunk in get_asset_stream(
            bundle_id, asset_key, start_byte, end_byte, chunk_size
        ):
            yield chunk
