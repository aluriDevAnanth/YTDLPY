from unittest.mock import patch

import pytest
import src.db as db
from src.bundle_manager import BundleManager
from src.models import Video


@pytest.mark.asyncio
async def test_shared_active_download_deduplication(
    async_client, user1_token, user2_token, seed_users
):
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    shared_url = "https://example.com/shared-in-progress-video"
    shared_format = "BEST"
    with patch("src.routes.video_route.process_video_download") as mock_process:
        res1 = await async_client.post(
            "/api/video",
            headers=headers1,
            json={
                "id": "temp-id-1",
                "url": shared_url,
                "format": shared_format,
                "type": "download",
            },
        )
        assert res1.status_code == 200
        u1_vid = res1.json()
        assert u1_vid["downloadStatus"] == "queued"
        assert mock_process.call_count == 1
        res2 = await async_client.post(
            "/api/video",
            headers=headers2,
            json={
                "id": "temp-id-2",
                "url": shared_url,
                "format": shared_format,
                "type": "download",
            },
        )
        assert res2.status_code == 200
        u2_vid = res2.json()
        assert u2_vid["downloadStatus"] == "queued"
        assert mock_process.call_count == 1
