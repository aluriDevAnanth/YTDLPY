import pytest
from httpx import AsyncClient
from src.models import User
from src.crypto import create_access_token, get_password_hash

ME_DATASETS = [
    {"user_id": f"me_uid_{i:02d}", "username": f"me_user_{i:02d}", "role": "admin" if i % 2 == 0 else "user"}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", ME_DATASETS, ids=[f"me_ds_{i}" for i in range(10)])
async def test_auth_me_authenticated_10_datasets(async_client: AsyncClient, session, dataset):
    user = User(
        id=dataset["user_id"],
        username=dataset["username"],
        hashed_password=get_password_hash("password123"),
        role=dataset["role"]
    )
    session.add(user)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    response = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == dataset["user_id"]
    assert body["username"] == dataset["username"]
    assert body["role"] == dataset["role"]


@pytest.mark.asyncio
async def test_auth_me_unauthorized(async_client: AsyncClient):
    response = await async_client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_invalid_token(async_client: AsyncClient):
    response = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token.string"}
    )
    assert response.status_code == 401
