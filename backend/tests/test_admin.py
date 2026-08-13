import pytest


@pytest.mark.asyncio
async def test_admin_list_users(async_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.get("/api/admin/users", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    usernames = [u["username"] for u in data]
    assert "admin" in usernames
    assert "testuser" in usernames


@pytest.mark.asyncio
async def test_regular_user_forbidden_admin_routes(async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    response = await async_client.get("/api/admin/users", headers=headers)
    assert response.status_code == 403
    assert "Administrator access required" in response.json()["detail"]


@pytest.mark.asyncio
async def test_admin_create_user(async_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.post(
        "/api/admin/users",
        headers=headers,
        json={"username": "newuser", "password": "newpassword123", "role": "user"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["role"] == "user"


@pytest.mark.asyncio
async def test_admin_delete_user(async_client, admin_token, seed_users):
    target_id = seed_users["user2"].id
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.delete(
        f"/api/admin/users/{target_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"


@pytest.mark.asyncio
async def test_admin_stats(async_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.get("/api/admin/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_videos" in data
    assert "formatted_storage" in data


@pytest.mark.asyncio
async def test_admin_cannot_download_video(async_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.post(
        "/api/video",
        headers=headers,
        json={
            "id": "admin-video-test",
            "url": "https://example.com/admin-test",
            "format": "BEST",
            "type": "download",
        },
    )
    assert response.status_code == 403
    assert (
        "Admin accounts cannot download or process videos" in response.json()["detail"]
    )


@pytest.mark.asyncio
async def test_admin_list_and_delete_videos(async_client, admin_token, seed_users):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.get("/api/admin/videos", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

    del_res = await async_client.delete("/api/admin/videos/nonexistent-id", headers=headers)
    assert del_res.status_code == 404

