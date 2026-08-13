from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR, TEMP_DIR
from src.crypto import get_password_hash
from src.db import get_session
from src.models import User, UserCreate, UserOut, UserSettings, UserUpdate, Video
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event, send_remove_video
from src.VideoDownloader import download_registry, format_size

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
    total_bytes = 0
    if BUNDLES_DIR.exists():
        total_bytes += sum(
            f.stat().st_size for f in BUNDLES_DIR.rglob("*") if f.is_file()
        )
    if TEMP_DIR.exists():
        total_bytes += sum(
            f.stat().st_size for f in TEMP_DIR.rglob("*") if f.is_file()
        )
    return {
        "total_users": users_count,
        "total_videos": videos_count,
        "completed_downloads": completed_count,
        "total_storage_bytes": total_bytes,
        "formatted_storage": format_size(total_bytes),
    }


@router.get("/videos")
async def list_admin_videos(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Video))
    videos = result.all()
    user_map = {}
    users_res = await session.exec(select(User))
    for u in users_res.all():
        user_map[u.id] = u.username

    bundle_user_counts = {}
    for vid in videos:
        tb_id = vid.bundleId if vid.bundleId else vid.id
        bundle_user_counts[tb_id] = bundle_user_counts.get(tb_id, 0) + 1

    out = []
    for v in videos:
        target_bundle_id = v.bundleId if v.bundleId else v.id
        bundle_path = BundleManager.get_bundle_path(target_bundle_id)
        bytes_val = bundle_path.stat().st_size if bundle_path.exists() else 0
        mapped_count = bundle_user_counts.get(target_bundle_id, 1)

        v_dict = v.dict() if hasattr(v, "dict") else v.model_dump()
        v_dict.update(
            {
                "username": user_map.get(v.userId, "Unknown User"),
                "fullTitle": v.fullTitle or v.url,
                "url": v.url,
                "durationString": v.durationString or "N/A",
                "size": v.size or format_size(bytes_val),
                "resolution": v.resolution or "HD",
                "bytes": bytes_val,
                "formatted_bytes": format_size(bytes_val),
                "mapped_users_count": mapped_count,
            }
        )
        out.append(v_dict)

    out.sort(key=lambda x: x["bytes"], reverse=True)
    return out


@router.delete("/videos/{video_id}")
async def delete_admin_video(
    video_id: str,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(Video).where(Video.id == video_id))
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    target_bundle_id = video.bundleId if video.bundleId else video.id
    user_id = video.userId
    download_registry.cancel(video_id)

    await session.delete(video)
    await session.commit()

    other_v = await session.exec(
        select(Video).where(
            (Video.bundleId == target_bundle_id) | (Video.id == target_bundle_id)
        )
    )
    if not other_v.first():
        bundle_file = BundleManager.get_bundle_path(target_bundle_id)
        if bundle_file.exists():
            try:
                bundle_file.unlink()
            except Exception:
                pass

    await send_remove_video(video_id, user_id)
    await send_admin_event("admin_stats_update")
    return {"status": "success", "message": f"Purged video {video_id}", "id": video_id}


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
        target_bundle_id = v.bundleId if v.bundleId else v.id
        await session.delete(v)
        await session.flush()
        other_v = await session.exec(
            select(Video).where(
                (Video.bundleId == target_bundle_id) | (Video.id == target_bundle_id)
            )
        )
        if not other_v.first():
            bundle_file = BundleManager.get_bundle_path(target_bundle_id)
            if bundle_file.exists():
                bundle_file.unlink()
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
