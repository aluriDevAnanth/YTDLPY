import struct
from pathlib import Path
from typing import Callable, Dict, Optional
import src.config as config
from src.crypto import (
    apply_stream_cipher_mask,
    encrypt_header_index,
)
from .constants import MAGIC_HEADER


def get_bundle_path(video_id: str) -> Path:
    return config.BUNDLES_DIR / f"{video_id}.adaumc"


def create_bundle(
    video_id: str,
    temp_dir: Path,
    asset_files: Dict[str, str],
    progress_callback: Optional[Callable[[int, int], None]] = None,
) -> Path:
    """
    Packs temp files into single .adaumc bundle.
    asset_files dict: {'video': 'file.mp4', 'thumbnail': 'thumb.jpg', 'vtt': 'sub.vtt', 'vtt_sprite': 'sprite.jpg'}
    """
    bundle_path = get_bundle_path(video_id)
    bundle_path.parent.mkdir(parents=True, exist_ok=True)
    index_table = {}
    file_payloads = []
    current_offset = 0
    for asset_key, filename in asset_files.items():
        file_path = temp_dir / filename
        if file_path.exists():
            size = file_path.stat().st_size
            index_table[asset_key] = {
                "offset": current_offset,
                "length": size,
                "filename": filename,
            }
            current_offset += size
            file_payloads.append((asset_key, file_path))
    encrypted_index = encrypt_header_index(index_table)
    index_length = len(encrypted_index)
    with open(bundle_path, "wb") as f_out:
        f_out.write(MAGIC_HEADER)
        f_out.write(struct.pack(">I", index_length))
        f_out.write(encrypted_index)
        payload_start = 4 + 4 + index_length
        file_offset = 0
        total_bytes = max(1, current_offset)
        last_reported = 0
        for asset_key, file_path in file_payloads:
            with open(file_path, "rb") as f_in:
                while chunk := f_in.read(1024 * 64):
                    masked_chunk = apply_stream_cipher_mask(
                        chunk, offset=file_offset
                    )
                    f_out.write(masked_chunk)
                    file_offset += len(chunk)
                    if progress_callback and (
                        file_offset - last_reported >= 2 * 1024 * 1024
                        or file_offset == total_bytes
                    ):
                        last_reported = file_offset
                        progress_callback(file_offset, total_bytes)
    return bundle_path
