"""Watch later shortcut endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import PlaylistVideoLink, User, Video
from src.routes.auth_route import get_current_user
from src.routes.playlist.helpers import ensure_default_watch_later

router = APIRouter()


@router.post("/playlists/watch-later/toggle/{video_id}")
async def toggle_watch_later(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Toggles video presence in the default Watch Later playlist."""
    wl = await ensure_default_watch_later(session, current_user.id)
    vid_res = await session.exec(
        select(Video).where(Video.id == video_id).where(Video.userId == current_user.id)
    )
    if not vid_res.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Video not found"
        )

    link_res = await session.exec(
        select(PlaylistVideoLink)
        .where(PlaylistVideoLink.playlist_id == wl.id)
        .where(PlaylistVideoLink.video_id == video_id)
    )
    link = link_res.first()
    if link:
        await session.delete(link)
        await session.commit()
        in_wl = False
    else:
        new_link = PlaylistVideoLink(playlist_id=wl.id, video_id=video_id)
        session.add(new_link)
        await session.commit()
        in_wl = True

    return {
        "status": "success",
        "in_watch_later": in_wl,
        "playlist_id": wl.id,
        "video_id": video_id,
    }
