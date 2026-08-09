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
    response = await async_client.post("/api/admin/users", headers=headers, json={
        "username": "newuser",
        "password": "newpassword123",
        "role": "user"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["role"] == "user"

@pytest.mark.asyncio
async def test_admin_delete_user(async_client, admin_token, seed_users):
    target_id = seed_users["user2"].id
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.delete(f"/api/admin/users/{target_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
