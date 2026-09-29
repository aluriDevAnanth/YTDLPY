import asyncio
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import yt_dlp.cookies
from src.browser_cookie_manager import get_installed_browser_ids
from src.models import User
from src.routes.auth.dependencies import get_current_user

router = APIRouter()


class CookieTestRequest(BaseModel):
    browser: str
    profile: Optional[str] = None


@router.post("/system/test-cookies")
async def handle_test_browser_cookies(
    req: CookieTestRequest,
    current_user: User = Depends(get_current_user),
):
    def _test():
        target_browser = req.browser
        if target_browser == "auto":
            installed = get_installed_browser_ids()
            target_browser = installed[0] if installed else "chrome"

        browser_tuple = (target_browser,)
        if req.profile:
            browser_tuple = (target_browser, req.profile)

        try:
            jar = yt_dlp.cookies.extract_cookies_from_browser(*browser_tuple)
            cookie_count = len(jar) if jar else 0
            domains = list({c.domain for c in jar})[:10] if jar else []
            return {
                "success": True,
                "browser": target_browser,
                "profile": req.profile,
                "cookie_count": cookie_count,
                "domains": domains,
                "message": f"Successfully extracted {cookie_count} cookies from {target_browser}.",
            }
        except Exception as e:
            err_msg = str(e)
            tip = "Make sure the browser is installed. If on Windows, try closing the browser if the cookie database is locked."
            return {
                "success": False,
                "browser": target_browser,
                "profile": req.profile,
                "error": err_msg,
                "message": f"Could not extract cookies from {target_browser}: {err_msg}. {tip}",
            }

    return await asyncio.to_thread(_test)
