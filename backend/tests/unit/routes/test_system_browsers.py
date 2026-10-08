import pytest
from unittest.mock import patch
from httpx import AsyncClient
from src.models import User, UserSettings
from src.crypto import create_access_token, get_password_hash

BROWSER_LIST_SCENARIOS = [
    {"index": i, "role": "admin" if i == 0 else "user", "mock_browsers": [{"id": f"browser_{j}", "name": f"Browser {j}", "available": True} for j in range(i + 1)]}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("scenario", BROWSER_LIST_SCENARIOS, ids=[f"browse_sc_{i}" for i in range(10)])
async def test_system_browsers_route_10_scenarios(async_client: AsyncClient, session, scenario):
    user = User(
        id=f"uid_sys_br_{scenario['index']}",
        username=f"sys_br_user_{scenario['index']}",
        hashed_password=get_password_hash("pass"),
        role=scenario["role"]
    )
    settings = UserSettings(user_id=user.id, cookies_browser="chrome")
    session.add(user)
    session.add(settings)
    await session.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    with patch("src.routes.system.browsers.get_available_browsers", return_value=scenario["mock_browsers"]):
        response = await async_client.get(
            "/api/system/browsers",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        body = response.json()
        assert "browsers" in body
        assert len(body["browsers"]) == len(scenario["mock_browsers"])
