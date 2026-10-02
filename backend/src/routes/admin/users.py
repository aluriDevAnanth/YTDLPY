"""Admin user management endpoints (listing, creation, role update, password resets, deletion)."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.crypto import get_password_hash
from src.db import get_session
from src.models import User, UserCreate, UserOut, UserSettings, UserUpdate, Video
from src.routes.admin.dependencies import require_admin
from src.sio import send_admin_event

router = APIRouter()


@router.get("/users", response_model=List[UserOut])
async def list_users(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    """List all registered users with their associated video download counts."""
    result = await session.exec(select(User))
    users = result.all()
    user_outs = []
    for u in users:
        videos_res = await session.exec(select(Video).where(Video.userId == u.id))
        video_count = len(videos_res.all())
        user_dict = u.dict() if hasattr(u, "dict") else u.model_dump()
        user_dict["video_count"] = video_count
        user_outs.append(UserOut(**user_dict))
    return user_outs


@router.post("/users", response_model=UserOut)
async def create_user_admin(
    user_in: UserCreate,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Admin endpoint to create a new user account directly."""
    existing = await session.exec(select(User).where(User.username == user_in.username))
    if existing.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    user_id = str(uuid.uuid4())
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        id=user_id,
        username=user_in.username,
        hashed_password=hashed_pwd,
        role="user",
    )
    session.add(new_user)
    settings = UserSettings(user_id=user_id, default_format="BEST")
    session.add(settings)
    await session.commit()
    await session.refresh(new_user)
    await send_admin_event("admin_stats_update")
    return new_user


@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Updates user fields (e.g. role promotion/demotion)."""
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.role is not None:
        user.role = user_update.role
    session.add(user)
    await session.commit()
    await session.refresh(user)
    await send_admin_event("admin_stats_update")
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Deletes a user account and associated user settings."""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own account",
        )
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    settings_res = await session.exec(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    settings = settings_res.first()
    if settings:
        await session.delete(settings)

    await session.delete(user)
    await session.commit()
    await send_admin_event("admin_stats_update")
    return {"status": "success", "id": user_id}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    payload: dict,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Admin reset of a user's password."""
    new_password = payload.get("new_password")
    if not new_password or len(new_password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long",
        )
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(new_password)
    session.add(user)
    await session.commit()
    return {"status": "success", "message": f"Password reset for user '{user.username}'"}
