from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from src.browser_cookie_manager import (
    get_admin_cookie_settings,
    get_available_browsers,
)
from src.db import get_session
from src.models import User
from src.routes.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/system/browsers")
async def list_available_browsers(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    browsers = get_available_browsers()
    admin_settings = await get_admin_cookie_settings(session)
    return {
        "browsers": browsers,
        "admin_defaults": {
            "cookies_source": admin_settings.cookies_source if admin_settings else "browser",
            "cookies_browser": admin_settings.cookies_browser if admin_settings else "auto",
            "cookies_profile": admin_settings.cookies_profile if admin_settings else None,
        } if admin_settings else None,
    }
