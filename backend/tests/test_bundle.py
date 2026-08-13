import tempfile
from pathlib import Path

import pytest
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR


@pytest.mark.asyncio
async def test_bundle_creation_and_decryption_stream(tmp_path):
    video_id = "test-hex-12345678"
    temp_dir = tmp_path / "temp_video"
    temp_dir.mkdir()
    media_data = b"MOCK_VIDEO_BINARY_DATA_" * 100
    thumb_data = b"MOCK_THUMBNAIL_JPEG_DATA_" * 10
    vtt_data = b"WEBVTT\n1\n00:00.000 --> 00:05.000\nsprite.jpg#xywh=0,0,160,90\n"
    (temp_dir / "video.mp4").write_bytes(media_data)
    (temp_dir / "thumbnail.jpg").write_bytes(thumb_data)
    (temp_dir / "preview.vtt").write_bytes(vtt_data)
    asset_files = {
        "video": "video.mp4",
        "thumbnail": "thumbnail.jpg",
        "vtt": "preview.vtt",
    }
    bundle_path = BundleManager.create_bundle(video_id, temp_dir, asset_files)
    assert bundle_path.exists()
    assert bundle_path.suffix == ".adaumc"
    index_table, payload_start = BundleManager.read_index(bundle_path)
    assert "video" in index_table
    assert "thumbnail" in index_table
    assert "vtt" in index_table
    assert index_table["video"]["length"] == len(media_data)
    assert index_table["thumbnail"]["length"] == len(thumb_data)
    stream = BundleManager.get_asset_stream(video_id, "video")
    retrieved_data = b""
    async for chunk in stream:
        retrieved_data += chunk
    assert retrieved_data == media_data
    start_offset = 10
    end_offset = 49
    range_stream = BundleManager.get_asset_stream(
        video_id, "video", start_byte=start_offset, end_byte=end_offset
    )
    range_data = b""
    async for chunk in range_stream:
        range_data += chunk
    assert range_data == media_data[start_offset : end_offset + 1]
    if bundle_path.exists():
        bundle_path.unlink()


@pytest.mark.asyncio
async def test_files_route_vtt_sprite_streaming(tmp_path, async_client, seed_users):
    from src.db import async_session_maker
    from src.models import Video

    video_id = "1eebca36a206655c"
    user = seed_users["user1"]
    async with async_session_maker() as session:
        video = Video(
            id=video_id,
            userId=user.id,
            url="https://www.youtube.com/watch?v=test",
            downloadStatus="completed",
        )
        session.add(video)
        await session.commit()
    temp_dir = tmp_path / "temp_sprite"
    temp_dir.mkdir()
    sprite_data = b"MOCK_SPRITE_IMAGE_DATA_JPEG"
    vtt_data = b"WEBVTT\n1\n00:00.000 --> 00:05.000\n1eebca36a206655c_vtt_sprite_1.jpg#xywh=0,0,160,90\n"
    (temp_dir / "sprite_1.jpg").write_bytes(sprite_data)
    (temp_dir / "preview.vtt").write_bytes(vtt_data)
    asset_files = {
        "vtt": "preview.vtt",
        "vtt_sprite": "sprite_1.jpg",
        "vtt_sprite_1": "sprite_1.jpg",
    }
    bundle_path = BundleManager.create_bundle(video_id, temp_dir, asset_files)
    try:
        res_sprite1 = await async_client.get(f"/api/files/{video_id}_vtt_sprite_1.jpg")
        assert res_sprite1.status_code == 200
        assert res_sprite1.headers["content-type"] == "image/jpeg"
        assert res_sprite1.content == sprite_data
        res_sprite = await async_client.get(f"/api/files/{video_id}_vtt_sprite.jpg")
        assert res_sprite.status_code == 200
        assert res_sprite.headers["content-type"] == "image/jpeg"
        assert res_sprite.content == sprite_data
        res_vtt = await async_client.get(f"/api/files/{video_id}_vtt.vtt")
        assert res_vtt.status_code == 200
        assert res_vtt.headers["content-type"] == "text/vtt"
        assert res_vtt.content == vtt_data
        res_range = await async_client.get(
            f"/api/files/{video_id}_vtt.vtt", headers={"Range": "bytes=0-99999"}
        )
        assert res_range.status_code == 206
        assert len(res_range.content) == len(vtt_data)
    finally:
        if bundle_path.exists():
            bundle_path.unlink()


@pytest.mark.asyncio
async def test_files_route_custom_bundle_id_streaming(tmp_path, async_client, seed_users):
    from src.db import async_session_maker
    from src.models import Video

    video_id = "video_with_custom_bundle_123"
    custom_bundle_id = "shared_bundle_hash_999"
    user = seed_users["user1"]
    async with async_session_maker() as session:
        video = Video(
            id=video_id,
            bundleId=custom_bundle_id,
            userId=user.id,
            url="https://www.youtube.com/watch?v=custom_bundle",
            downloadStatus="completed",
        )
        session.add(video)
        await session.commit()
    temp_dir = tmp_path / "temp_custom_bundle"
    temp_dir.mkdir()
    vtt_data = b"WEBVTT\n1\n00:00.000 --> 00:05.000\ntest caption\n"
    (temp_dir / "preview.vtt").write_bytes(vtt_data)
    asset_files = {"vtt": "preview.vtt"}
    bundle_path = BundleManager.create_bundle(custom_bundle_id, temp_dir, asset_files)
    try:
        res_vtt = await async_client.get(f"/api/files/{video_id}_vtt.vtt")
        assert res_vtt.status_code == 200
        assert res_vtt.content == vtt_data

        res_range = await async_client.get(
            f"/api/files/{video_id}_vtt.vtt", headers={"Range": "bytes=0-5"}
        )
        assert res_range.status_code == 206
        assert res_range.content == b"WEBVTT"
    finally:
        if bundle_path.exists():
            bundle_path.unlink()

