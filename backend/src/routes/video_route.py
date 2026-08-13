import asyncio
import hashlib
import shutil
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.db import get_session
from src.models import StorageCleanRequest, User, Video
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event, send_notify, send_remove_video, send_video_message
from src.VideoDownloader import download_registry, format_size, process_video_download

router = APIRouter(prefix="/api", tags=["Videos"])


@router.get("/videos", response_model=List[Video])
async def get_videos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role == "admin":
        return []
    result = await session.exec(select(Video).where(Video.userId == current_user.id))
    return result.all()


@router.post("/video", response_model=Video)
async def create_video(
    video_data: Video,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot download or process videos. Log in with a regular user account.",
        )
    shared_bundle_id = hashlib.sha256(
        f"{video_data.url}_{video_data.format}".encode()
    ).hexdigest()[:16]
    user_video_id = hashlib.sha256(
        f"{video_data.url}_{video_data.format}_{current_user.id}".encode()
    ).hexdigest()[:16]
    video_data.id = user_video_id
    video_data.bundleId = shared_bundle_id
    video_data.userId = current_user.id
    result_user = await session.exec(select(Video).where(Video.id == user_video_id))
    existing_user_vid = result_user.first()
    if existing_user_vid:
        return existing_user_vid
    result_existing = await session.exec(
        select(Video)
        .where(Video.url == video_data.url)
        .where(Video.format == video_data.format)
    )
    already_existing = result_existing.first()
    if already_existing:
        if already_existing.downloadStatus == "completed":
            video_data.videoId = already_existing.videoId
            video_data.fullTitle = already_existing.fullTitle
            video_data.durationString = already_existing.durationString
            video_data.size = already_existing.size
            video_data.resolution = already_existing.resolution
            video_data.downloadStatus = "completed"
            video_data.downloaded = True
            session.add(video_data)
            await session.commit()
            await session.refresh(video_data)
            await send_video_message(video_data.dict(), current_user.id)
            await send_notify(
                "success",
                "Video Instantly Available",
                f"Reused existing downloaded bundle for '{video_data.fullTitle or video_data.url}'",
                current_user.id,
            )
            return video_data
        elif already_existing.downloadStatus in [
            "queued",
            "downloading",
            "generating_sprites",
            "packing_bundle",
        ]:
            video_data.videoId = already_existing.videoId
            video_data.fullTitle = already_existing.fullTitle
            video_data.durationString = already_existing.durationString
            video_data.size = already_existing.size
            video_data.resolution = already_existing.resolution
            video_data.downloadStatus = already_existing.downloadStatus
            video_data.downloaded = False
            session.add(video_data)
            await session.commit()
            await session.refresh(video_data)
            await send_video_message(video_data.dict(), current_user.id)
            await send_notify(
                "info",
                "Joined Active Download",
                f"Attached to active download task for '{video_data.fullTitle or video_data.url}'",
                current_user.id,
            )
            return video_data
    try:
        session.add(video_data)
        await session.commit()
        await session.refresh(video_data)
    except Exception:
        await session.rollback()
        existing_retry = (
            await session.exec(select(Video).where(Video.id == user_video_id))
        ).first()
        if existing_retry:
            return existing_retry
        raise
    loop = asyncio.get_event_loop()
    asyncio.create_task(process_video_download(video_data.id, loop))
    await send_admin_event("admin_stats_update")
    return video_data


@router.get("/video/{video_id}", response_model=Video)
async def get_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.put("/video/{video_id}", response_model=Video)
async def update_video(
    video_id: str,
    video_update: Video,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    video.watched = video_update.watched
    video.prevWatchTime = video_update.prevWatchTime
    session.add(video)
    await session.commit()
    await session.refresh(video)
    return video


@router.delete("/video/{video_id}")
async def delete_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result_any = await session.exec(select(Video).where(Video.id == video_id))
    existing_video = result_any.first()
    if existing_video and existing_video.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Video not found")
    download_registry.cancel(video_id)
    if existing_video:
        await session.delete(existing_video)
        await session.commit()
    await send_remove_video(video_id, current_user.id)
    await send_admin_event("admin_stats_update")
    return {"status": "success", "id": video_id}


@router.get("/user/storage")
async def get_user_storage_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
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
