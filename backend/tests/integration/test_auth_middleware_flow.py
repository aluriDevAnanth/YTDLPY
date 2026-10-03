import pytest
from httpx import AsyncClient
from datetime import timedelta
from src.crypto import create_access_token

AUTH_FLOW_DATASETS = [
    {
        "username": f"flow_user_{i:02d}",
        "password": f"FlowPassword_Secret_{i:02d}!",
        "new_format": ["BEST", "BESTAUDIO", "WORST", "BESTVIDEO"][i % 4]
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", AUTH_FLOW_DATASETS, ids=[f"flow_ds_{i}" for i in range(10)])
async def test_auth_middleware_full_lifecycle_10_datasets(async_client: AsyncClient, dataset):
    # 1. Register
    reg_res = await async_client.post(
        "/api/auth/register",
        json={"username": dataset["username"], "password": dataset["password"]}
    )
    assert reg_res.status_code == 200
    token_data = reg_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Me (Protected)
    me_res = await async_client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_body = me_res.json()
    assert me_body["username"] == dataset["username"]
    assert me_body["role"] == "user"
    user_id = me_body["id"]
    
    # 3. Update Settings (Protected)
    update_res = await async_client.put(
        "/api/user/settings",
        headers=headers,
        json={"default_format": dataset["new_format"]}
    )
    assert update_res.status_code == 200
    assert update_res.json()["default_format"] == dataset["new_format"]
    
    # 4. Verify updated settings in /api/auth/me
    me_res_2 = await async_client.get("/api/auth/me", headers=headers)
    assert me_res_2.json()["settings"]["default_format"] == dataset["new_format"]
    
    # 5. Expired token rejection
    expired_token = create_access_token({"sub": user_id, "role": "user"}, expires_delta=timedelta(seconds=-10))
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    exp_res = await async_client.get("/api/auth/me", headers=expired_headers)
    assert exp_res.status_code == 401
    
    # 6. Login again with correct credentials
    login_res = await async_client.post(
        "/api/auth/login",
        json={"username": dataset["username"], "password": dataset["password"]}
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
