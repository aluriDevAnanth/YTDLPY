"""Video query and individual metadata update endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import User, Video
from src.routes.auth_route import get_current_user

router = APIRouter()


@router.get("/videos", response_model=List[Video])
async def get_videos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve all videos owned by the authenticated user."""
    if current_user.role == "admin":
        return []
    result = await session.exec(select(Video).where(Video.userId == current_user.id))
    return result.all()


@router.get("/video/{video_id}", response_model=Video)
async def get_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve detailed metadata for a single video."""
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
    """Update watch progress or watched state for a video."""
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
