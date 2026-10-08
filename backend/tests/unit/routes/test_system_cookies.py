import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from src.models import User
from src.crypto import create_access_token, get_password_hash

COOKIE_TEST_SCENARIOS = [
    {
        "index": i,
        "browser": ["chrome", "firefox", "edge", "brave", "opera", "safari", "vivaldi", "chromium", "auto", "custom"][i],
        "profile": f"Profile_{i}" if i % 2 == 0 else None,
        "cookie_count": i * 5,
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("scenario", COOKIE_TEST_SCENARIOS, ids=[f"cookie_sc_{i}" for i in range(10)])
async def test_system_test_cookies_route_10_scenarios(async_client: AsyncClient, session, scenario):
    user = User(
        id=f"uid_cookie_test_{scenario['index']}",
        username=f"cookie_user_{scenario['index']}",
        hashed_password=get_password_hash("pass"),
        role="admin" if scenario["index"] == 0 else "user"
    )
    session.add(user)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    mock_cookie = MagicMock()
    mock_cookie.domain = ".youtube.com"
    mock_jar = [mock_cookie] * scenario["cookie_count"]
    
    with patch("yt_dlp.cookies.extract_cookies_from_browser", return_value=mock_jar), \
         patch("src.routes.system.cookies.get_installed_browser_ids", return_value=["chrome"]):
        
        payload = {"browser": scenario["browser"]}
        if scenario["profile"]:
            payload["profile"] = scenario["profile"]
            
        response = await async_client.post(
            "/api/system/test-cookies",
            headers={"Authorization": f"Bearer {token}"},
            json=payload
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["cookie_count"] == scenario["cookie_count"]


@pytest.mark.asyncio
async def test_system_test_cookies_extraction_error(async_client: AsyncClient, session):
    user = User(
        id="uid_cookie_err",
        username="cookie_err_user",
        hashed_password=get_password_hash("pass"),
        role="user"
    )
    session.add(user)
    await session.commit()
    token = create_access_token({"sub": user.id, "role": user.role})
    
    with patch("yt_dlp.cookies.extract_cookies_from_browser", side_effect=RuntimeError("Database locked")):
        response = await async_client.post(
            "/api/system/test-cookies",
            headers={"Authorization": f"Bearer {token}"},
            json={"browser": "chrome"}
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert "Database locked" in body["error"]
