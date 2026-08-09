import pytest
from unittest.mock import patch

@pytest.mark.asyncio
async def test_create_video_mocked(async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    
    # Mock process_video_download to avoid real yt-dlp network execution during tests
    with patch("src.routes.video_route.process_video_download") as mock_process:
        response = await async_client.post("/api/video", headers=headers, json={
            "id": "video-hex-001",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "format": "BEST",
            "type": "download"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "video-hex-001"
        assert data["url"] == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert data["downloadStatus"] == "queued"
        
        # Verify background task was called with video_id
        mock_process.assert_called_once()

@pytest.mark.asyncio
async def test_video_user_isolation(async_client, user1_token, user2_token):
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    
    with patch("src.routes.video_route.process_video_download"):
        # User 1 creates a video
        res1 = await async_client.post("/api/video", headers=headers1, json={
            "id": "u1-video-123",
            "url": "https://example.com/u1-video",
            "format": "BEST",
            "type": "download"
        })
        assert res1.status_code == 200

    # User 1 can list their video
    v_res1 = await async_client.get("/api/videos", headers=headers1)
    assert len(v_res1.json()) == 1
    assert v_res1.json()[0]["id"] == "u1-video-123"

    # User 2 CANNOT see User 1's video (Privacy Isolation)
    v_res2 = await async_client.get("/api/videos", headers=headers2)
    assert len(v_res2.json()) == 0

    # User 2 CANNOT delete User 1's video
    del_res = await async_client.delete("/api/video/u1-video-123", headers=headers2)
    assert del_res.status_code == 404
    assert del_res.json()["detail"] == "Video not found"
