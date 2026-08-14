import pytest
from sqlmodel import select
from src.models import Playlist, PlaylistVideoLink, Video
from tests.conftest import test_async_session


@pytest.mark.asyncio
async def test_playlists_auto_create_watch_later(seed_users, async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    res = await async_client.get("/api/playlists", headers=headers)
    assert res.status_code == 200
    playlists = res.json()
    assert len(playlists) >= 1
    wl = next((p for p in playlists if p["is_default"]), None)
    assert wl is not None
    assert wl["name"] == "Watch Later"


@pytest.mark.asyncio
async def test_create_and_delete_custom_playlist(seed_users, async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    create_res = await async_client.post(
        "/api/playlists",
        json={"name": "My Favorites", "description": "Favorite videos"},
        headers=headers,
    )
    assert create_res.status_code == 200
    p_data = create_res.json()
    assert p_data["name"] == "My Favorites"
    playlist_id = p_data["id"]

    del_res = await async_client.delete(f"/api/playlists/{playlist_id}", headers=headers)
    assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_prevent_delete_default_watch_later(seed_users, async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    res = await async_client.get("/api/playlists", headers=headers)
    playlists = res.json()
    wl = next(p for p in playlists if p["is_default"])

    del_res = await async_client.delete(f"/api/playlists/{wl['id']}", headers=headers)
    assert del_res.status_code == 400
    assert "Cannot delete" in del_res.json()["detail"]


@pytest.mark.asyncio
async def test_add_and_remove_video_from_playlist(seed_users, async_client, user1_token):
    user = seed_users["user1"]
    headers = {"Authorization": f"Bearer {user1_token}"}
    vid_id = "test-playlist-video-001"

    async with test_async_session() as session:
        vid = Video(
            id=vid_id,
            userId=user.id,
            url="https://youtube.com/watch?v=pltest",
            format="BEST",
            type="download",
            downloadStatus="completed",
        )
        session.add(vid)
        await session.commit()

    # Get Watch Later playlist
    res = await async_client.get("/api/playlists", headers=headers)
    wl = next(p for p in res.json() if p["is_default"])

    # Add video to Watch Later
    add_res = await async_client.post(
        f"/api/playlists/{wl['id']}/videos",
        json={"video_id": vid_id},
        headers=headers,
    )
    assert add_res.status_code == 200

    # Get playlist videos
    vids_res = await async_client.get(f"/api/playlists/{wl['id']}/videos", headers=headers)
    assert vids_res.status_code == 200
    vids = vids_res.json()
    assert any(v["id"] == vid_id for v in vids)

    # Remove video from Watch Later
    rm_res = await async_client.delete(f"/api/playlists/{wl['id']}/videos/{vid_id}", headers=headers)
    assert rm_res.status_code == 200
