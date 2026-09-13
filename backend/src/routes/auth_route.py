from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import yt_dlp.cookies
from src.browser_cookie_manager import (
    get_admin_cookie_settings,
    get_available_browsers,
    get_installed_browser_ids,
)
from src.crypto import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from src.db import get_session
from src.models import (
    LoginRequest,
    Token,
    User,
    UserOut,
    UserSettings,
    UserSettingsUpdate,
)
from src.sio import send_admin_event

router = APIRouter(prefix="/api", tags=["Auth & User"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


@router.post("/auth/login", response_model=Token)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.username == req.username))
    user = result.first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return Token(access_token=access_token, token_type="bearer")


@router.post("/auth/register", response_model=Token)
async def register(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.username == req.username))
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already registered. Please choose another username or sign in.",
        )
    new_user = User(
        username=req.username,
        hashed_password=get_password_hash(req.password),
        role="user",
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    settings = UserSettings(user_id=new_user.id)
    session.add(settings)
    await session.commit()
    await send_admin_event("admin_stats_update")
    access_token = create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/auth/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        session.add(settings)
        await session.commit()
        await session.refresh(settings)
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        created_at=current_user.created_at,
        settings=settings,
    )


@router.put("/user/settings", response_model=UserSettings)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    session.add(settings)
    await session.commit()
    await session.refresh(settings)
    return settings


class CookieTestRequest(BaseModel):
    browser: str
    profile: Optional[str] = None


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
        } if admin_settings else None
    }


@router.post("/system/test-cookies")
async def test_browser_cookies(
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

