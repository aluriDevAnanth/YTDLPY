"""Effective cookies resolver integrating user overrides, admin defaults, and fallback cascades."""

from typing import Dict, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.cookies.detector import get_installed_browser_ids
from src.models import User, UserSettings


async def get_admin_cookie_settings(session: AsyncSession) -> Optional[UserSettings]:
    """Fetches the primary administrator's settings to serve as global default."""
    try:
        statement = select(UserSettings).join(User).where(User.role == "admin")
        result = await session.exec(statement)
        return result.first()
    except Exception:
        return None


async def resolve_effective_cookies(
    user_settings: Optional[UserSettings],
    session: Optional[AsyncSession] = None,
) -> Dict:
    """
    Resolves effective cookie options following the hierarchy:
    User Override -> Admin Global Default -> System 'auto' Fallback
    """
    source = getattr(user_settings, "cookies_source", "inherit") if user_settings else "inherit"
    browser = getattr(user_settings, "cookies_browser", "auto") if user_settings else "auto"
    profile = getattr(user_settings, "cookies_profile", None) if user_settings else None
    txt = getattr(user_settings, "cookies_txt", None) if user_settings else None

    # If user inherits from admin, lookup admin settings
    if (not source or source == "inherit") and session:
        admin_settings = await get_admin_cookie_settings(session)
        if admin_settings and admin_settings.cookies_source and admin_settings.cookies_source != "inherit":
            source = admin_settings.cookies_source
            browser = admin_settings.cookies_browser or "auto"
            profile = admin_settings.cookies_profile
            txt = admin_settings.cookies_txt

    if not source or source == "inherit":
        source = "browser"
        browser = "firefox"

    installed = get_installed_browser_ids()
    prioritized_installed = [b for b in installed if b == "firefox"] + [b for b in installed if b != "firefox"]

    candidate_browsers = []
    if browser in ["auto", "firefox", None, ""]:
        candidate_browsers = prioritized_installed if prioritized_installed else ["firefox", "brave", "opera", "vivaldi", "chrome", "edge"]
    else:
        candidate_browsers = [browser] + [b for b in prioritized_installed if b != browser]

    return {
        "source": source,
        "browser": browser,
        "profile": profile,
        "candidate_browsers": candidate_browsers,
        "cookies_txt": txt,
    }
