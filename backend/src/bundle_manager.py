import os
import json
import struct
from pathlib import Path
from typing import Dict, Tuple, Optional, AsyncGenerator
import aiofiles

from src.config import BUNDLES_DIR
from src.crypto import encrypt_header_index, decrypt_header_index, apply_stream_cipher_mask

MAGIC_HEADER = b'YTPY'

class BundleManager:
    @staticmethod
    def get_bundle_path(video_id: str) -> Path:
        return BUNDLES_DIR / f"{video_id}.ytdlpy"

    @staticmethod
    def create_bundle(video_id: str, temp_dir: Path, asset_files: Dict[str, str]) -> Path:
        """
        Packs temp files into single .ytdlpy bundle.
        asset_files dict: {'video': 'file.mp4', 'thumbnail': 'thumb.jpg', 'vtt': 'sub.vtt', 'vtt_sprite': 'sprite.jpg'}
        """
        bundle_path = BundleManager.get_bundle_path(video_id)
        
        index_table = {}
        file_payloads = []
        
        current_offset = 0
        
        # Read payload binary files and calculate offsets
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

        # Encrypt index header
        encrypted_index = encrypt_header_index(index_table)
        index_length = len(encrypted_index)

        # Write binary container
        with open(bundle_path, "wb") as f_out:
            f_out.write(MAGIC_HEADER)
            f_out.write(struct.pack(">I", index_length))
            f_out.write(encrypted_index)
            
            # Payload offset start position
            payload_start = 4 + 4 + index_length
            
            # Write masked asset streams
            file_offset = 0
            for asset_key, file_path in file_payloads:
                with open(file_path, "rb") as f_in:
                    while chunk := f_in.read(1024 * 64):
                        masked_chunk = apply_stream_cipher_mask(chunk, offset=file_offset)
                        f_out.write(masked_chunk)
                        file_offset += len(chunk)

        return bundle_path

    @staticmethod
    def read_index(bundle_path: Path) -> Tuple[dict, int]:
        """Reads and decrypts bundle index table. Returns (index_table, payload_start_offset)."""
        with open(bundle_path, "rb") as f:
            magic = f.read(4)
            if magic != MAGIC_HEADER:
                raise ValueError("Invalid .ytdlpy bundle format")
            index_length = struct.unpack(">I", f.read(4))[0]
            encrypted_index = f.read(index_length)
            payload_start = 4 + 4 + index_length
            index_table = decrypt_header_index(encrypted_index)
            return index_table, payload_start

    @staticmethod
    async def get_asset_stream(
        video_id: str,
        asset_key: str,
        start_byte: int = 0,
        end_byte: Optional[int] = None,
        chunk_size: int = 1024 * 64
    ) -> AsyncGenerator[bytes, None]:
        """Async generator streaming decrypted asset slice from .ytdlpy bundle."""
        bundle_path = BundleManager.get_bundle_path(video_id)
        if not bundle_path.exists():
            raise FileNotFoundError(f"Bundle {bundle_path} not found")

        index_table, payload_start = BundleManager.read_index(bundle_path)
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
                
                # Unmask using CTR cipher stream
                current_file_offset = asset_offset + start_byte + read_so_far
                unmasked = apply_stream_cipher_mask(chunk, offset=current_file_offset)
                read_so_far += len(chunk)
                yield unmasked
