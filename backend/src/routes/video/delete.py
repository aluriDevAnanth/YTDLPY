"""Video deletion endpoint with download cancellation and event emission."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.downloader import download_registry
from src.models import User, Video
from src.routes.auth_route import get_current_user
from src.sio import send_admin_event, send_remove_video

router = APIRouter()


@router.delete("/video/{video_id}")
async def delete_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Cancels and deletes a video belonging to the authenticated user."""
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
