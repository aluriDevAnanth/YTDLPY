from typing import AsyncGenerator, Optional
import aiofiles
from src.crypto import apply_stream_cipher_mask
from .creator import get_bundle_path
from .indexer import read_index


async def get_asset_stream(
    bundle_id: str,
    asset_key: str,
    start_byte: int = 0,
    end_byte: Optional[int] = None,
    chunk_size: int = 1024 * 64,
) -> AsyncGenerator[bytes, None]:
    """Async generator streaming decrypted asset slice from .ytdlpy bundle."""
    bundle_path = get_bundle_path(bundle_id)
    if not bundle_path.exists():
        raise FileNotFoundError(f"Bundle {bundle_path} not found")
    index_table, payload_start = read_index(bundle_path)
    if asset_key not in index_table:
        raise KeyError(f"Asset key '{asset_key}' not found in bundle index")
    asset_info = index_table[asset_key]
    asset_offset = asset_info["offset"]
    asset_length = asset_info["length"]
    abs_start = payload_start + asset_offset + start_byte
    max_end = asset_offset + asset_length - 1
    if end_byte is None or end_byte > max_end:
        actual_end = max_end
    else:
        actual_end = end_byte
    bytes_to_read = actual_end - (asset_offset + start_byte) + 1
    async with aiofiles.open(bundle_path, "rb") as f:
        await f.seek(abs_start)
        read_so_far = 0
        while read_so_far < bytes_to_read:
            to_read = min(chunk_size, bytes_to_read - read_so_far)
            chunk = await f.read(to_read)
            if not chunk:
                break
            current_file_offset = asset_offset + start_byte + read_so_far
            unmasked = apply_stream_cipher_mask(chunk, offset=current_file_offset)
            read_so_far += len(chunk)
            yield unmasked
