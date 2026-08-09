import pytest
import tempfile
from pathlib import Path
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR

@pytest.mark.asyncio
async def test_bundle_creation_and_decryption_stream(tmp_path):
    video_id = "test-hex-12345678"
    temp_dir = tmp_path / "temp_video"
    temp_dir.mkdir()

    # Create dummy asset files
    media_data = b"MOCK_VIDEO_BINARY_DATA_" * 100
    thumb_data = b"MOCK_THUMBNAIL_JPEG_DATA_" * 10
    vtt_data = b"WEBVTT\n1\n00:00.000 --> 00:05.000\nsprite.jpg#xywh=0,0,160,90\n"

    (temp_dir / "video.mp4").write_bytes(media_data)
    (temp_dir / "thumbnail.jpg").write_bytes(thumb_data)
    (temp_dir / "preview.vtt").write_bytes(vtt_data)

    asset_files = {
        "video": "video.mp4",
        "thumbnail": "thumbnail.jpg",
        "vtt": "preview.vtt"
    }

    # Create bundle
    bundle_path = BundleManager.create_bundle(video_id, temp_dir, asset_files)
    assert bundle_path.exists()
    assert bundle_path.suffix == ".ytdlpy"

    # Read and decrypt index table
    index_table, payload_start = BundleManager.read_index(bundle_path)
    assert "video" in index_table
    assert "thumbnail" in index_table
    assert "vtt" in index_table

    assert index_table["video"]["length"] == len(media_data)
    assert index_table["thumbnail"]["length"] == len(thumb_data)

    # Stream and unmask video asset
    stream = BundleManager.get_asset_stream(video_id, "video")
    retrieved_data = b""
    async for chunk in stream:
        retrieved_data += chunk

    assert retrieved_data == media_data

    # Stream byte range (slice test)
    start_offset = 10
    end_offset = 49
    range_stream = BundleManager.get_asset_stream(video_id, "video", start_byte=start_offset, end_byte=end_offset)
    range_data = b""
    async for chunk in range_stream:
        range_data += chunk

    assert range_data == media_data[start_offset:end_offset + 1]

    # Clean up test bundle file
    if bundle_path.exists():
        bundle_path.unlink()
