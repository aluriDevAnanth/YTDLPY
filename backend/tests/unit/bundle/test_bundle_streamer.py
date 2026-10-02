import pytest
from pathlib import Path
from src.bundle.streamer import get_asset_stream
from src.bundle.creator import create_bundle
import src.config as config

STREAM_DATASETS = [
    {
        "video_id": f"vid_stream_{i}",
        "raw_video_content": f"VIDEO_PAYLOAD_CHUNK_DATA_STREAM_{i}_".encode() * (50 + i * 20),
        "raw_thumb_content": f"THUMB_IMAGE_STREAM_BINARY_{i}".encode() * 10,
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", STREAM_DATASETS)
async def test_get_asset_stream_full_read_10_datasets(tmp_path, dataset):
    temp_dir = tmp_path / f"temp_{dataset['video_id']}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    video_name = "video.mp4"
    thumb_name = "thumb.jpg"
    (temp_dir / video_name).write_bytes(dataset["raw_video_content"])
    (temp_dir / thumb_name).write_bytes(dataset["raw_thumb_content"])
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    create_bundle(
        video_id=dataset["video_id"],
        temp_dir=temp_dir,
        asset_files={"video": video_name, "thumb": thumb_name}
    )
    
    # Test streaming video asset
    stream_chunks = []
    async for chunk in get_asset_stream(dataset["video_id"], "video", chunk_size=128):
        stream_chunks.append(chunk)
        
    reconstructed_video = b"".join(stream_chunks)
    assert reconstructed_video == dataset["raw_video_content"]
    
    # Test streaming thumb asset
    thumb_chunks = []
    async for chunk in get_asset_stream(dataset["video_id"], "thumb", chunk_size=64):
        thumb_chunks.append(chunk)
        
    reconstructed_thumb = b"".join(thumb_chunks)
    assert reconstructed_thumb == dataset["raw_thumb_content"]


@pytest.mark.asyncio
async def test_get_asset_stream_byte_ranges(tmp_path):
    temp_dir = tmp_path / "temp_range"
    temp_dir.mkdir(parents=True, exist_ok=True)
    full_content = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    (temp_dir / "test.mp4").write_bytes(full_content)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    create_bundle("range_test", temp_dir, {"video": "test.mp4"})
    
    # Slice [5:15] -> 11 bytes
    chunks = []
    async for chunk in get_asset_stream("range_test", "video", start_byte=5, end_byte=15):
        chunks.append(chunk)
    assert b"".join(chunks) == full_content[5:16]


@pytest.mark.asyncio
async def test_get_asset_stream_byte_ranges_non_zero_offset(tmp_path):
    temp_dir = tmp_path / "temp_range_multi"
    temp_dir.mkdir(parents=True, exist_ok=True)
    thumb_payload = b"PREVIEW_THUMBNAIL_BYTES_PADDING_1234567890"
    video_payload = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" * 10
    (temp_dir / "thumb.jpg").write_bytes(thumb_payload)
    (temp_dir / "video.mp4").write_bytes(video_payload)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # Thumbnail is first (offset 0), Video is second (offset > 0)
    create_bundle("range_multi_test", temp_dir, {"thumbnail": "thumb.jpg", "video": "video.mp4"})
    
    # Slice bytes 10-30 of the second asset
    chunks = []
    async for chunk in get_asset_stream("range_multi_test", "video", start_byte=10, end_byte=30):
        chunks.append(chunk)
    assert b"".join(chunks) == video_payload[10:31]


@pytest.mark.asyncio
async def test_get_asset_stream_missing_bundle(tmp_path):
    config.BUNDLES_DIR = tmp_path / "bundles"
    with pytest.raises(FileNotFoundError):
        async for _ in get_asset_stream("nonexistent_id", "video"):
            pass


@pytest.mark.asyncio
async def test_get_asset_stream_missing_key(tmp_path):
    temp_dir = tmp_path / "temp_key"
    temp_dir.mkdir(parents=True, exist_ok=True)
    (temp_dir / "test.mp4").write_bytes(b"content")
    
    bundles_dir = tmp_path / "bundles"
    config.BUNDLES_DIR = bundles_dir
    create_bundle("key_test", temp_dir, {"video": "test.mp4"})
    
    with pytest.raises(KeyError):
        async for _ in get_asset_stream("key_test", "invalid_key"):
            pass
