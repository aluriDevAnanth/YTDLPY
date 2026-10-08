import pytest
from httpx import AsyncClient
from sqlmodel import select
from src.models import User, UserSettings

REGISTER_DATASETS = [
    {"username": f"reg_user_{i:02d}", "password": f"SecureRegisterPwd_{i:02d}#", "role": "user"}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", REGISTER_DATASETS, ids=[f"reg_ds_{i}" for i in range(10)])
async def test_auth_register_10_datasets(async_client: AsyncClient, session, dataset):
    response = await async_client.post(
        "/api/auth/register",
        json={"username": dataset["username"], "password": dataset["password"]}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    
    # Verify User was inserted in DB
    user_res = await session.exec(select(User).where(User.username == dataset["username"]))
    user = user_res.first()
    assert user is not None
    assert user.role == "user"
    
    # Verify UserSettings was automatically initialized
    settings_res = await session.exec(select(UserSettings).where(UserSettings.user_id == user.id))
    settings = settings_res.first()
    assert settings is not None


@pytest.mark.asyncio
async def test_auth_register_duplicate_username(async_client: AsyncClient):
    payload = {"username": "duplicate_bob", "password": "secure_password_123"}
    r1 = await async_client.post("/api/auth/register", json=payload)
    assert r1.status_code == 200
    
    r2 = await async_client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already registered" in r2.json()["detail"].lower()
