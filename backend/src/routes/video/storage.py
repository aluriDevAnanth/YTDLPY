"""User disk storage statistics and cleanup endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.db import get_session
from src.downloader import download_registry
from src.models import StorageCleanRequest, User, Video
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event, send_remove_video
from src.utils.formatters import format_size

router = APIRouter()


@router.get("/user/storage")
async def get_user_storage_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Calculates storage usage, watched bytes, and largest file for the user."""
    if current_user.role == "admin":
        return {
            "total_videos": 0,
            "completed_downloads": 0,
            "total_bytes": 0,
            "formatted_bytes": "0 B",
            "watched_videos_count": 0,
            "watched_bytes": 0,
            "formatted_watched_bytes": "0 B",
            "largest_video_title": None,
            "largest_video_bytes": 0,
            "formatted_largest_bytes": "0 B",
        }

    result = await session.exec(select(Video).where(Video.userId == current_user.id))
    user_videos = result.all()

    total_videos = len(user_videos)
    completed_downloads = 0
    total_bytes = 0
    watched_videos_count = 0
    watched_bytes = 0
    largest_video_title = None
    largest_video_bytes = 0

    for v in user_videos:
        target_bundle_id = v.bundleId if v.bundleId else v.id
        bundle_path = BundleManager.get_bundle_path(target_bundle_id)
        bytes_val = bundle_path.stat().st_size if bundle_path.exists() else 0

        if v.downloadStatus == "completed":
            completed_downloads += 1

        total_bytes += bytes_val

        if v.watched:
            watched_videos_count += 1
            watched_bytes += bytes_val

        if bytes_val > largest_video_bytes:
            largest_video_bytes = bytes_val
            largest_video_title = v.fullTitle or v.url

    return {
        "total_videos": total_videos,
        "completed_downloads": completed_downloads,
        "total_bytes": total_bytes,
        "formatted_bytes": format_size(total_bytes),
        "watched_videos_count": watched_videos_count,
        "watched_bytes": watched_bytes,
        "formatted_watched_bytes": format_size(watched_bytes),
        "largest_video_title": largest_video_title,
        "largest_video_bytes": largest_video_bytes,
        "formatted_largest_bytes": format_size(largest_video_bytes),
    }


@router.post("/user/storage/clean")
async def clean_user_storage(
    req: StorageCleanRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Purges selected or watched videos and deletes orphaned physical bundles."""
    if current_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Storage cleanup is for regular user accounts.",
        )

    stmt = select(Video).where(Video.userId == current_user.id)
    if req.video_ids:
        stmt = stmt.where(Video.id.in_(req.video_ids))
    elif req.clean_watched:
        stmt = stmt.where(Video.watched == True)
    elif not req.clear_all:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid cleanup criteria provided.",
        )

    result = await session.exec(stmt)
    target_videos = result.all()

    purged_count = 0
    freed_bytes = 0

    for v in target_videos:
        video_id = v.id
        target_bundle_id = v.bundleId if v.bundleId else v.id
        bundle_path = BundleManager.get_bundle_path(target_bundle_id)
        bytes_val = bundle_path.stat().st_size if bundle_path.exists() else 0

        download_registry.cancel(video_id)
        await session.delete(v)
        await session.flush()

        other_v = await session.exec(
            select(Video).where(
                (Video.bundleId == target_bundle_id) | (Video.id == target_bundle_id)
            )
        )
        if not other_v.first():
            if bundle_path.exists():
                try:
                    bundle_path.unlink()
                except Exception:
                    pass

        freed_bytes += bytes_val
        purged_count += 1
        await send_remove_video(video_id, current_user.id)

    await session.commit()
    await send_admin_event("admin_stats_update")

    return {
        "status": "success",
        "purged_count": purged_count,
        "freed_bytes": freed_bytes,
        "formatted_freed_bytes": format_size(freed_bytes),
    }
