import pytest
from httpx import AsyncClient
from src.models import User
from src.crypto import get_password_hash

LOGIN_DATASETS = [
    {"username": f"user_login_{i:02d}", "password": f"Password_Secret_{i:02d}!", "role": "admin" if i == 0 else "user"}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", LOGIN_DATASETS, ids=[f"login_ds_{i}" for i in range(10)])
async def test_auth_login_success_10_datasets(async_client: AsyncClient, session, dataset):
    user = User(
        id=f"uid_{dataset['username']}",
        username=dataset["username"],
        hashed_password=get_password_hash(dataset["password"]),
        role=dataset["role"]
    )
    session.add(user)
    await session.commit()
    
    response = await async_client.post(
        "/api/auth/login",
        json={"username": dataset["username"], "password": dataset["password"]}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_login_wrong_password(async_client: AsyncClient, session):
    user = User(
        id="uid_wrong_pass",
        username="wrong_pass_user",
        hashed_password=get_password_hash("correct_password"),
        role="user"
    )
    session.add(user)
    await session.commit()
    
    response = await async_client.post(
        "/api/auth/login",
        json={"username": "wrong_pass_user", "password": "incorrect_password"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_login_nonexistent_user(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/login",
        json={"username": "ghost_user", "password": "any_password"}
    )
    assert response.status_code == 401
