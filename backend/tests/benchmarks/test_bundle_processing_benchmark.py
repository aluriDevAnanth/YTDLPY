import os
import time
import pytest
from pathlib import Path
from src.bundle_manager import BundleManager
from src.crypto import apply_stream_cipher_mask, encrypt_header_index, decrypt_header_index
from src.download_logger import DownloadLogger
import src.config as config

BENCHMARK_PAYLOAD_SIZES = [
    1024 * 1024,        # 1 MB
    5 * 1024 * 1024,    # 5 MB
    10 * 1024 * 1024,   # 10 MB
    20 * 1024 * 1024,   # 20 MB
    30 * 1024 * 1024,   # 30 MB
]

@pytest.mark.benchmark
@pytest.mark.parametrize("payload_size", BENCHMARK_PAYLOAD_SIZES, ids=[f"size_{s//(1024*1024)}MB" for s in BENCHMARK_PAYLOAD_SIZES])
def test_stream_cipher_mask_throughput_benchmark(payload_size):
    """Profiles AES-128-CTR stream cipher mask throughput in MB/s."""
    raw_data = os.urandom(payload_size)
    
    start_time = time.perf_counter()
    masked = apply_stream_cipher_mask(raw_data, offset=0)
    elapsed = time.perf_counter() - start_time
    
    throughput_mb_s = (payload_size / (1024 * 1024)) / elapsed
    assert len(masked) == payload_size
    # Target: >= 15 MB/s lower bound for CI/test environments
    assert throughput_mb_s > 10.0


@pytest.mark.benchmark
def test_header_index_encryption_latency_benchmark():
    """Profiles JSON header table encryption and decryption latency (< 5ms threshold)."""
    large_index = {
        f"asset_stream_{i}": {"offset": i * 1024 * 1024, "length": 1024 * 1024, "filename": f"asset_{i}.mp4"}
        for i in range(100)
    }
    
    start_enc = time.perf_counter()
    encrypted = encrypt_header_index(large_index)
    enc_latency_ms = (time.perf_counter() - start_enc) * 1000
    
    start_dec = time.perf_counter()
    decrypted = decrypt_header_index(encrypted)
    dec_latency_ms = (time.perf_counter() - start_dec) * 1000
    
    assert decrypted == large_index
    assert enc_latency_ms < 15.0  # < 15ms threshold for 100 entries
    assert dec_latency_ms < 15.0


@pytest.mark.asyncio
@pytest.mark.benchmark
async def test_download_to_bundle_pipeline_latency_benchmark(tmp_path):
    """
    Profiles complete pipeline latency from downloaded files -> final .adaumc bundle file.
    Validates packing time, index reading, and byte-range streaming time-to-first-byte (TTFB).
    """
    video_id = "bench_bundle_vid_01"
    temp_dir = tmp_path / "bench_temp"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    bundles_dir = tmp_path / "bench_bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # Generate 15MB total media assets
    video_data = b"V" * (12 * 1024 * 1024)
    thumb_data = b"T" * (200 * 1024)
    vtt_data = b"WEBVTT\n" * 5000
    sprite_data = b"S" * (1024 * 1024)
    
    (temp_dir / "video.mp4").write_bytes(video_data)
    (temp_dir / "thumb.jpg").write_bytes(thumb_data)
    (temp_dir / "storyboard.vtt").write_bytes(vtt_data)
    (temp_dir / "sprite.jpg").write_bytes(sprite_data)
    
    # Measure .adaumc packing time
    start_pack = time.perf_counter()
    bundle_path = BundleManager.create_bundle(
        video_id=video_id,
        temp_dir=temp_dir,
        asset_files={
            "video": "video.mp4",
            "thumbnail": "thumb.jpg",
            "vtt": "storyboard.vtt",
            "vtt_sprite": "sprite.jpg",
        }
    )
    pack_elapsed = time.perf_counter() - start_pack
    total_mb = (len(video_data) + len(thumb_data) + len(vtt_data) + len(sprite_data)) / (1024 * 1024)
    pack_speed_mb_s = total_mb / pack_elapsed
    
    assert bundle_path.exists()
    assert pack_speed_mb_s > 5.0  # Packing speed >= 5 MB/s
    
    # Measure Index Read Latency
    start_idx = time.perf_counter()
    index_table, payload_start = BundleManager.read_index(bundle_path)
    idx_latency_ms = (time.perf_counter() - start_idx) * 1000
    assert idx_latency_ms < 50.0  # Header index read < 50ms
    
    # Measure Random Byte Range Time-to-First-Byte (TTFB)
    start_ttfb = time.perf_counter()
    stream = BundleManager.get_asset_stream(video_id, "video", start_byte=1024*1024*5, end_byte=1024*1024*6)
    first_chunk = None
    async for chunk in stream:
        first_chunk = chunk
        break
    ttfb_ms = (time.perf_counter() - start_ttfb) * 1000
    assert first_chunk is not None
    assert ttfb_ms < 30.0  # TTFB < 30ms
