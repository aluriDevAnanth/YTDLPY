import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db import get_session
from src.models import Video, User
from src.routes.auth_route import get_current_user
from src.VideoDownloader import process_video_download, download_registry
from src.bundle_manager import BundleManager

router = APIRouter(prefix="/api", tags=["Videos"])

@router.get("/videos", response_model=List[Video])
async def get_videos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Strict privacy isolation: User can ONLY see their own videos
    result = await session.exec(select(Video).where(Video.userId == current_user.id))
    return result.all()

@router.post("/video", response_model=Video)
async def create_video(
    video_data: Video,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    video_data.userId = current_user.id
    
    # Check if record with this primary key id (URL hex hash) already exists for this user
    result = await session.exec(
        select(Video).where(Video.id == video_data.id).where(Video.userId == current_user.id)
    )
    existing = result.first()
    if existing:
        return existing
        
    session.add(video_data)
    await session.commit()
    await session.refresh(video_data)
    
    # Spawn background task for yt-dlp scan/download
    loop = asyncio.get_event_loop()
    asyncio.create_task(process_video_download(video_data.id, loop))
    
    return video_data

@router.get("/video/{video_id}", response_model=Video)
async def get_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
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
    session: AsyncSession = Depends(get_session)
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
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # 1. Cancel active download task if running
    download_registry.cancel(video_id)
    
    # 2. Delete bundle file on disk
    bundle_file = BundleManager.get_bundle_path(video_id)
    if bundle_file.exists():
        bundle_file.unlink()
        
    # 3. Delete database record
    await session.delete(video)
    await session.commit()
    
    return {"status": "success", "id": video_id}
