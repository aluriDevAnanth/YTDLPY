from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import User, UserOut, UserSettings
from .dependencies import get_current_user

router = APIRouter()


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
