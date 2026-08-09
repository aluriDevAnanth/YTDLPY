from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR
from src.crypto import get_password_hash
from src.db import get_session
from src.models import User, UserCreate, UserOut, UserSettings, UserUpdate, Video
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event
from src.VideoDownloader import format_size

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    users_count = (await session.exec(select(func.count(User.id)))).one()
    videos_count = (await session.exec(select(func.count(Video.id)))).one()
    completed_count = (
        await session.exec(
            select(func.count(Video.id)).where(Video.downloadStatus == "completed")
        )
    ).one()
    total_bytes = (
        sum(f.stat().st_size for f in BUNDLES_DIR.glob("*.ytdlpy"))
        if BUNDLES_DIR.exists()
        else 0
    )
    return {
        "total_users": users_count,
        "total_videos": videos_count,
        "completed_downloads": completed_count,
        "total_storage_bytes": total_bytes,
        "formatted_storage": format_size(total_bytes),
    }


@router.get("/users", response_model=List[UserOut])
async def list_users(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(User))
    users = result.all()
    out = []
    for u in users:
        settings_res = await session.exec(
            select(UserSettings).where(UserSettings.user_id == u.id)
        )
        s = settings_res.first()
        out.append(
            UserOut(
                id=u.id,
                username=u.username,
                role=u.role,
                created_at=u.created_at,
                settings=s,
            )
        )
    return out


@router.post("/users", response_model=UserOut)
async def create_user(
    req: UserCreate,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(User).where(User.username == req.username))
    if result.first():
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(
        username=req.username,
        hashed_password=get_password_hash(req.password),
        role=req.role or "user",
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    settings = UserSettings(user_id=new_user.id)
    session.add(settings)
    await session.commit()
    await session.refresh(settings)
    await send_admin_event("admin_stats_update")
    return UserOut(
        id=new_user.id,
        username=new_user.username,
        role=new_user.role,
        created_at=new_user.created_at,
        settings=settings,
    )


@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    req: UserUpdate,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.username:
        user.username = req.username
    if req.password:
        user.hashed_password = get_password_hash(req.password)
    if req.role:
        user.role = req.role
    session.add(user)
    await session.commit()
    await session.refresh(user)
    await send_admin_event("admin_stats_update")
    settings_res = await session.exec(
        select(UserSettings).where(UserSettings.user_id == user.id)
    )
    s = settings_res.first()
    return UserOut(
        id=user.id,
        username=user.username,
        role=user.role,
        created_at=user.created_at,
        settings=s,
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=400, detail="Cannot delete your own admin account"
        )
    result = await session.exec(select(User).where(User.id == user_id))
    user = result.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    video_res = await session.exec(select(Video).where(Video.userId == user_id))
    videos = video_res.all()
    for v in videos:
        bundle_file = BundleManager.get_bundle_path(v.id)
        if bundle_file.exists():
            bundle_file.unlink()
        await session.delete(v)
    settings_res = await session.exec(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    s = settings_res.first()
    if s:
        await session.delete(s)
    await session.delete(user)
    await session.commit()
    await send_admin_event("admin_stats_update")
    return {
        "status": "success",
        "message": f"User {user.username} and all associated files purged",
    }
