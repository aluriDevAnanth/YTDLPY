import pytest
from src.browser_cookie_manager import (
    detect_installed_browsers,
    get_available_browsers,
    get_installed_browser_ids,
    resolve_effective_cookies,
)
from src.models import UserSettings


def test_detect_installed_browsers():
    browsers = detect_installed_browsers()
    assert isinstance(browsers, list)
    assert len(browsers) > 0
    browser_ids = [b["id"] for b in browsers]
    assert "chrome" in browser_ids
    assert "edge" in browser_ids
    assert "firefox" in browser_ids


def test_get_available_browsers():
    browsers = get_available_browsers()
    assert len(browsers) > 0


@pytest.mark.asyncio
async def test_resolve_effective_cookies_user_override():
    user_settings = UserSettings(
        user_id="test-user",
        cookies_source="browser",
        cookies_browser="firefox",
        cookies_profile="test-profile",
    )
    res = await resolve_effective_cookies(user_settings)
    assert res["source"] == "browser"
    assert res["browser"] == "firefox"
    assert res["profile"] == "test-profile"
    assert "firefox" in res["candidate_browsers"]


@pytest.mark.asyncio
async def test_resolve_effective_cookies_auto_mode():
    user_settings = UserSettings(
        user_id="test-user",
        cookies_source="browser",
        cookies_browser="auto",
    )
    res = await resolve_effective_cookies(user_settings)
    assert res["source"] == "browser"
    assert res["browser"] == "auto"
    assert len(res["candidate_browsers"]) > 0
