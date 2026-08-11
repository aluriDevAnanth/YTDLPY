from unittest.mock import patch

import pytest
import src.db as db
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR
from src.models import Video


@pytest.mark.asyncio
async def test_create_video_mocked(async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    with patch("src.routes.video_route.process_video_download") as mock_process:
        response = await async_client.post(
            "/api/video",
            headers=headers,
            json={
                "id": "video-hex-001",
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "format": "BEST",
                "type": "download",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert data["downloadStatus"] == "queued"
        mock_process.assert_called_once()


@pytest.mark.asyncio
async def test_reuse_completed_video_bundle(
    async_client, user1_token, user2_token, seed_users
):
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    u1 = seed_users["user1"]
    shared_url = "https://example.com/shared-video-test"
    shared_format = "BEST"
    import hashlib

    shared_bundle_id = hashlib.sha256(
        f"{shared_url}_{shared_format}".encode()
    ).hexdigest()[:16]
    async with db.async_session_maker() as session:
        u1_vid = Video(
            id="u1-shared-vid-id",
            userId=u1.id,
            bundleId=shared_bundle_id,
            url=shared_url,
            format=shared_format,
            fullTitle="Shared Test Video",
            downloadStatus="completed",
            downloaded=True,
        )
        session.add(u1_vid)
        await session.commit()
    shared_bundle = BundleManager.get_bundle_path(shared_bundle_id)
    shared_bundle.parent.mkdir(parents=True, exist_ok=True)
    shared_bundle.write_bytes(b"TEST_BUNDLE_CONTENT_FOR_REUSE")
    res2 = await async_client.post(
        "/api/video",
        headers=headers2,
        json={
            "id": "temp-id",
            "url": shared_url,
            "format": shared_format,
            "type": "download",
        },
    )
    assert res2.status_code == 200
    u2_data = res2.json()
    assert u2_data["downloadStatus"] == "completed"
    assert u2_data["fullTitle"] == "Shared Test Video"
    assert u2_data["downloaded"] == True
    if shared_bundle.exists():
        shared_bundle.unlink()
