"""
10-Dataset Unit Test Suite for AES-128-CBC and AES-128-CTR Cipher Implementations.
"""
import pytest
from src.crypto.ciphers import (
    apply_stream_cipher_mask,
    decrypt_header_index,
    encrypt_header_index,
)

INDEX_DATASETS = [
    {"video": {"offset": 0, "length": 1024, "filename": "video.mp4"}},
    {"video": {"offset": 0, "length": 5000000, "filename": "1080p.mp4"}, "thumbnail": {"offset": 5000000, "length": 50000, "filename": "thumb.jpg"}},
    {"audio": {"offset": 0, "length": 1200000, "filename": "audio.m4a"}, "vtt": {"offset": 1200000, "length": 1500, "filename": "sub.vtt"}},
    {"video": {"offset": 0, "length": 25000000, "filename": "clip.mp4"}, "vtt_sprite": {"offset": 25000000, "length": 350000, "filename": "sprite.jpg"}},
    {"empty": {}},
    {"unicode_file": {"offset": 0, "length": 8000, "filename": "日本語_動画.mp4"}},
    {"large_index": {f"part_{i}": {"offset": i * 1000, "length": 1000, "filename": f"part_{i}.bin"} for i in range(20)}},
    {"log": {"offset": 0, "length": 4500, "filename": "download.ndjson"}},
    {"single_byte": {"offset": 0, "length": 1, "filename": "byte.dat"}},
    {"all_assets": {"video": {"offset": 0, "length": 100000, "filename": "vid.mp4"}, "thumb": {"offset": 100000, "length": 2000, "filename": "t.jpg"}, "vtt": {"offset": 102000, "length": 800, "filename": "s.vtt"}, "log": {"offset": 102800, "length": 500, "filename": "d.ndjson"}}},
]


@pytest.mark.parametrize("idx, data", list(enumerate(INDEX_DATASETS)), ids=[f"idx_dataset_{i}" for i in range(10)])
def test_aes_cbc_index_encryption_decryption_datasets(idx, data):
    """Verifies round-trip AES-128-CBC encryption and decryption of JSON headers."""
    encrypted = encrypt_header_index(data)
    assert isinstance(encrypted, bytes)
    assert len(encrypted) > 16  # IV (16 bytes) + ciphertext

    decrypted = decrypt_header_index(encrypted)
    assert decrypted == data


@pytest.mark.parametrize(
    "offset, payload",
    [
        (0, b"Hello World AES-CTR Streaming 12345"),
        (16, b"Exact 16 byte block offset slice..."),
        (7, b"Unaligned offset 7 bytes slice data"),
        (1024, b"X" * 4096),
        (1048576, b"1MB file chunk byte payload stream"),
        (1048579, b"Odd offset 1048579 stream bytes"),
        (0, b"\x00\x01\x02\x03\x04\x05\xFF\xFE\xFD"),
        (33, "Japanese unicode utf8 bytes: 日本語テスト".encode("utf-8")),
        (65536, b"Large 64KB chunk buffer " * 2000),
        (15, b"Boundary 15 offset block"),
    ],
    ids=[f"ctr_offset_{i}" for i in range(10)]
)
def test_aes_ctr_stream_cipher_mask_datasets(offset, payload):
    """Verifies that AES-128-CTR stream cipher mask is self-inverting across 10 slice offsets."""
    masked = apply_stream_cipher_mask(payload, offset=offset)
    assert isinstance(masked, bytes)
    assert len(masked) == len(payload)

    # Invert (decrypt) by applying cipher with identical offset
    unmasked = apply_stream_cipher_mask(masked, offset=offset)
    assert unmasked == payload
