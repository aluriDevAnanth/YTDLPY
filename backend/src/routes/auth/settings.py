from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import User, UserSettings, UserSettingsUpdate
from .dependencies import get_current_user

router = APIRouter()


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
    update_data = (
        settings_update.model_dump(exclude_unset=True)
        if hasattr(settings_update, "model_dump")
        else settings_update.dict(exclude_unset=True)
    )
    for key, value in update_data.items():
        setattr(settings, key, value)
    session.add(settings)
    await session.commit()
    await session.refresh(settings)
    return settings
