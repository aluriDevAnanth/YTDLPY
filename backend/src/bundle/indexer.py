import struct
from pathlib import Path
from typing import Tuple
from src.crypto import decrypt_header_index
from .constants import MAGIC_HEADER


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
