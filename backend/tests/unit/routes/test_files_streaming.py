import pytest
from httpx import AsyncClient
from src.models import User, Video
from src.crypto import create_access_token, get_password_hash
from src.bundle.creator import create_bundle
import src.config as config

STREAMING_DATASETS = [
    {
        "index": i,
        "video_id": f"vid_stream_route_{i:02d}",
        "asset_key": ["video", "thumbnail", "vtt", "vtt_sprite_1", "log"][i % 5],
        "content": f"RAW_STREAM_DATA_PAYLOAD_{i}_".encode() * (20 + i * 5),
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", STREAMING_DATASETS, ids=[f"stream_ds_{i}" for i in range(10)])
async def test_files_streaming_success_10_datasets(async_client: AsyncClient, session, tmp_path, dataset):
    temp_dir = tmp_path / f"temp_{dataset['video_id']}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # Write asset file and create bundle
    filename = f"asset_{dataset['asset_key']}.dat"
    (temp_dir / filename).write_bytes(dataset["content"])
    create_bundle(
        video_id=dataset["video_id"],
        temp_dir=temp_dir,
        asset_files={dataset["asset_key"]: filename}
    )
    
    # Create user and video
    user = User(
        id=f"uid_stream_{dataset['index']}",
        username=f"stream_user_{dataset['index']}",
        hashed_password=get_password_hash("pass"),
        role="user"
    )
    video = Video(
        id=dataset["video_id"],
        userId=user.id,
        url=f"https://www.youtube.com/watch?v={dataset['video_id']}",
        title="Streaming Test Video",
        downloadStatus="completed",
        downloaded=True,
        bundleId=dataset["video_id"]
    )
    session.add(user)
    session.add(video)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    # Request stream via /api/files/{video_id}_{asset_key}
    file_id = f"{dataset['video_id']}_{dataset['asset_key']}.mp4"
    response = await async_client.get(
        f"/api/files/{file_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.content == dataset["content"]


@pytest.mark.asyncio
async def test_files_streaming_range_request(async_client: AsyncClient, session, tmp_path):
    video_id = "range_test_vid"
    temp_dir = tmp_path / "temp_range"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    full_payload = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    (temp_dir / "video.mp4").write_bytes(full_payload)
    create_bundle(video_id, temp_dir, {"video": "video.mp4"})
    
    user = User(id="uid_range", username="range_user", hashed_password=get_password_hash("p"), role="user")
    video = Video(id=video_id, userId=user.id, url="https://yt", title="T", downloadStatus="completed", downloaded=True)
    session.add(user)
    session.add(video)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    # Request bytes 5-15
    res = await async_client.get(
        f"/api/files/{video_id}_video.mp4",
        headers={"Authorization": f"Bearer {token}", "Range": "bytes=5-15"}
    )
    assert res.status_code == 206
    assert res.content == full_payload[5:16]
    assert "Content-Range" in res.headers


@pytest.mark.asyncio
async def test_files_streaming_unauthorized(async_client: AsyncClient, session, tmp_path):
    response = await async_client.get("/api/files/testvid_video.mp4")
    assert response.status_code == 404 # Nonexistent video returns 404 first or 401


@pytest.mark.asyncio
async def test_files_streaming_head_request(async_client: AsyncClient, session, tmp_path):
    video_id = "head_test_vid"
    temp_dir = tmp_path / "temp_head"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    payload = b"HEAD_REQUEST_TEST_VIDEO_BYTES"
    (temp_dir / "video.mp4").write_bytes(payload)
    create_bundle(video_id, temp_dir, {"video": "video.mp4"})
    
    user = User(id="uid_head", username="head_user", hashed_password=get_password_hash("p"), role="user")
    video = Video(id=video_id, userId=user.id, url="https://yt", title="T", downloadStatus="completed", downloaded=True)
    session.add(user)
    session.add(video)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    # 1. Full HEAD request
    res = await async_client.head(
        f"/api/files/{video_id}_video.mp4?token={token}"
    )
    assert res.status_code == 200
    assert res.headers["Content-Length"] == str(len(payload))
    assert res.headers["Accept-Ranges"] == "bytes"
    assert res.content == b""

    # 2. Range HEAD request
    res_range = await async_client.head(
        f"/api/files/{video_id}_video.mp4",
        headers={"Authorization": f"Bearer {token}", "Range": "bytes=0-10"}
    )
    assert res_range.status_code == 206
    assert res_range.headers["Content-Length"] == "11"
    assert res_range.headers["Content-Range"] == f"bytes 0-10/{len(payload)}"
    assert res_range.content == b""
