import pytest

@pytest.mark.asyncio
async def test_login_success(async_client, seed_users):
    response = await async_client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client, seed_users):
    response = await async_client.post("/api/auth/login", json={
        "username": "admin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_me_authenticated(async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    response = await async_client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["role"] == "user"
    assert data["settings"]["default_format"] == "BESTAUDIO"

@pytest.mark.asyncio
async def test_get_me_unauthorized(async_client):
    response = await async_client.get("/api/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_update_user_settings(async_client, user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    response = await async_client.put("/api/user/settings", headers=headers, json={
        "default_format": "WORST",
        "max_concurrent_downloads": 5,
        "auto_generate_vtt": False
    })
    assert response.status_code == 200
    data = response.json()
    assert data["default_format"] == "WORST"
    assert data["max_concurrent_downloads"] == 5
    assert data["auto_generate_vtt"] is False
