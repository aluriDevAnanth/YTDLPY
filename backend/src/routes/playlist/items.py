"""Playlist items management endpoints (add and remove videos)."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import PlaylistVideoLink, User, Video
from src.routes.auth_route import get_current_user
from src.routes.playlist.helpers import (
    AddVideoToPlaylistRequest,
    get_playlist_by_id_or_public_id,
)

router = APIRouter()


@router.get("/playlists/{playlist_id}/videos", response_model=List[Video])
async def get_playlist_videos(
    playlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieves list of videos belonging to a playlist."""
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    links_res = await session.exec(
        select(PlaylistVideoLink)
        .where(PlaylistVideoLink.playlist_id == p.id)
        .order_by(PlaylistVideoLink.added_at.desc())
    )
    links = links_res.all()
    video_ids = [l.video_id for l in links]
    if not video_ids:
        return []

    v_res = await session.exec(
        select(Video).where(Video.id.in_(video_ids)).where(Video.userId == current_user.id)
    )
    v_map = {v.id: v for v in v_res.all()}
    return [v_map[vid] for vid in video_ids if vid in v_map]


@router.post("/playlists/{playlist_id}/videos")
async def add_video_to_playlist(
    playlist_id: str,
    req: AddVideoToPlaylistRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Adds a video link to a playlist."""
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    vid_res = await session.exec(
        select(Video).where(Video.id == req.video_id).where(Video.userId == current_user.id)
    )
    if not vid_res.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Video not found"
        )

    link_res = await session.exec(
        select(PlaylistVideoLink)
        .where(PlaylistVideoLink.playlist_id == p.id)
        .where(PlaylistVideoLink.video_id == req.video_id)
    )
    if not link_res.first():
        new_link = PlaylistVideoLink(playlist_id=p.id, video_id=req.video_id)
        session.add(new_link)
        await session.commit()
    return {"status": "success", "playlist_id": p.id, "public_id": p.public_id, "video_id": req.video_id}


@router.delete("/playlists/{playlist_id}/videos/{video_id}")
async def remove_video_from_playlist(
    playlist_id: str,
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Removes a video link from a playlist."""
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    link_res = await session.exec(
        select(PlaylistVideoLink)
        .where(PlaylistVideoLink.playlist_id == p.id)
        .where(PlaylistVideoLink.video_id == video_id)
    )
    link = link_res.first()
    if link:
        await session.delete(link)
        await session.commit()
    return {"status": "success", "playlist_id": p.id, "public_id": p.public_id, "video_id": video_id}

