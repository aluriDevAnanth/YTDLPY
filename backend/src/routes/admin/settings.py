"""Admin global defaults propagation endpoint."""

from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import User, UserSettings
from src.routes.admin.dependencies import require_admin

router = APIRouter()


@router.post("/settings/apply-to-all")
async def apply_admin_settings_to_all(
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Copies the administrator's preferences to all regular users."""
    admin_settings_res = await session.exec(
        select(UserSettings).where(UserSettings.user_id == admin.id)
    )
    admin_settings = admin_settings_res.first()
    if not admin_settings:
        return {"status": "success", "message": "No admin settings configured yet."}

    all_users_res = await session.exec(select(User).where(User.role != "admin"))
    regular_users = all_users_res.all()

    updated_count = 0
    for u in regular_users:
        u_settings_res = await session.exec(
            select(UserSettings).where(UserSettings.user_id == u.id)
        )
        u_settings = u_settings_res.first()
        if not u_settings:
            u_settings = UserSettings(user_id=u.id)

        u_settings.default_format = admin_settings.default_format
        u_settings.default_view_mode = admin_settings.default_view_mode
        u_settings.max_concurrent_downloads = admin_settings.max_concurrent_downloads
        u_settings.auto_generate_vtt = admin_settings.auto_generate_vtt
        u_settings.cookies_source = admin_settings.cookies_source
        u_settings.cookies_browser = admin_settings.cookies_browser
        u_settings.cookies_profile = admin_settings.cookies_profile
        u_settings.cookies_txt = admin_settings.cookies_txt
        u_settings.auth_storage_mode = admin_settings.auth_storage_mode

        session.add(u_settings)
        updated_count += 1

    await session.commit()
    return {
        "status": "success",
        "message": f"Applied admin defaults to {updated_count} user(s).",
    }
