"""Video download control endpoints (pause, resume, retry)."""

import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.downloader import download_registry, process_video_download
from src.models import User, Video
from src.routes.auth_route import get_current_user
from src.sio import send_status_update, send_video_message

router = APIRouter()


@router.post("/video/{video_id}/pause")
async def pause_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Pauses an active video download."""
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.downloadStatus in ["completed", "failed"]:
        raise HTTPException(
            status_code=400, detail="Cannot pause a completed or failed download"
        )
    download_registry.pause(video_id)
    try:
        video.downloadStatus = "paused"
        session.add(video)
        await session.commit()
        await session.refresh(video)
    except Exception:
        await session.rollback()
        res = await session.exec(
            select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
        )
        video = res.first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        video.downloadStatus = "paused"
        session.add(video)
        await session.commit()
        await session.refresh(video)

    await send_video_message(video.dict(), current_user.id)
    await send_status_update(
        {
            "id": video_id,
            "videoId": video_id,
            "downloadStatus": "paused",
            "eta": "Paused",
            "speed": "Paused",
        },
        current_user.id,
    )
    return video


@router.post("/video/{video_id}/resume")
async def resume_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Resumes a paused download or restarts the download worker if inactive."""
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    download_registry.resume(video_id)
    if not download_registry.is_active(video_id):
        download_registry.register(video_id)
        loop = asyncio.get_event_loop()
        asyncio.create_task(process_video_download(video_id, loop))

    try:
        video.downloadStatus = "downloading"
        session.add(video)
        await session.commit()
        await session.refresh(video)
    except Exception:
        await session.rollback()
        res = await session.exec(
            select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
        )
        video = res.first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        video.downloadStatus = "downloading"
        session.add(video)
        await session.commit()
        await session.refresh(video)

    await send_video_message(video.dict(), current_user.id)
    await send_status_update(
        {
            "id": video_id,
            "videoId": video_id,
            "downloadStatus": "downloading",
            "eta": "Resuming...",
        },
        current_user.id,
    )
    return video


@router.post("/video/{video_id}/retry")
async def retry_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retries a failed video download from the beginning."""
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        video.downloadStatus = "queued"
        video.downloaded = False
        session.add(video)
        await session.commit()
        await session.refresh(video)
    except Exception:
        await session.rollback()
        res = await session.exec(
            select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
        )
        video = res.first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        video.downloadStatus = "queued"
        video.downloaded = False
        session.add(video)
        await session.commit()
        await session.refresh(video)

    download_registry.register(video_id)
    await send_video_message(video.dict(), current_user.id)
    await send_status_update(
        {
            "id": video_id,
            "videoId": video_id,
            "downloadStatus": "queued",
            "eta": "Restarting...",
            "percent": 0.0,
            "speed": "0 B/s",
        },
        current_user.id,
    )

    loop = asyncio.get_event_loop()
    asyncio.create_task(process_video_download(video_id, loop))
    return video
