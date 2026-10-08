import uuid
import pytest
from httpx import AsyncClient
from src.models import User, UserSettings
from src.crypto import create_access_token, get_password_hash

SETTINGS_DATASETS = [
    {
        "index": i,
        "default_format": ["BEST", "BESTAUDIO", "WORST", "BESTVIDEO"][i % 4],
        "cookies_source": "browser" if i % 2 == 0 else "custom",
        "cookies_browser": "chrome" if i % 2 == 0 else "firefox"
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", SETTINGS_DATASETS, ids=[f"set_ds_{i}" for i in range(10)])
async def test_auth_settings_get_and_update_10_datasets(async_client: AsyncClient, session, dataset):
    uid = f"set_uid_{uuid.uuid4().hex[:8]}"
    uname = f"set_usr_{uuid.uuid4().hex[:8]}"
    user = User(
        id=uid,
        username=uname,
        hashed_password=get_password_hash("pass123"),
        role="user"
    )
    settings = UserSettings(
        user_id=user.id,
        default_format=dataset["default_format"],
        cookies_source=dataset["cookies_source"],
        cookies_browser=dataset["cookies_browser"]
    )
    session.add(user)
    session.add(settings)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. GET user settings via /api/auth/me
    get_res = await async_client.get("/api/auth/me", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["settings"]["default_format"] == dataset["default_format"]
    
    # 2. PUT settings update via /api/user/settings
    updated_format = "WORSTAUDIO"
    put_res = await async_client.put(
        "/api/user/settings",
        headers=headers,
        json={"default_format": updated_format}
    )
    assert put_res.status_code == 200
    assert put_res.json()["default_format"] == updated_format
