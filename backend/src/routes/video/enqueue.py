"""Video submission, deduplication, bundle-sharing and download enqueuing endpoint."""

import asyncio
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import User, Video
from src.routes import video_route
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event, send_notify, send_video_message

router = APIRouter()


@router.post("/video", response_model=Video)
async def create_video(
    video_data: Video,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Enqueues a video for download or instantly reuses existing matching completed bundle."""
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
    asyncio.create_task(video_route.process_video_download(video_data.id, loop))
    await send_admin_event("admin_stats_update")
    return video_data
