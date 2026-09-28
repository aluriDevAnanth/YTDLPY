"""Playlist query helper functions and schemas."""

from fastapi import HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models import Playlist


class AddVideoToPlaylistRequest(BaseModel):
    video_id: str


async def ensure_default_watch_later(session: AsyncSession, user_id: str) -> Playlist:
    """Ensures a user has a default 'Watch Later' playlist in the database."""
    res = await session.exec(
        select(Playlist).where(Playlist.userId == user_id).where(Playlist.is_default == True)
    )
    wl = res.first()
    if not wl:
        res_name = await session.exec(
            select(Playlist).where(Playlist.userId == user_id).where(Playlist.name == "Watch Later")
        )
        wl = res_name.first()
        if wl:
            wl.is_default = True
            session.add(wl)
            await session.commit()
            await session.refresh(wl)
        else:
            wl = Playlist(
                userId=user_id,
                name="Watch Later",
                description="Default Watch Later playlist",
                is_default=True,
            )
            session.add(wl)
            await session.commit()
            await session.refresh(wl)
    return wl


async def get_playlist_by_id_or_public_id(session: AsyncSession, playlist_id: str, user_id: str) -> Playlist:
    """Finds playlist by internal ID or public slug ID for the authenticated user."""
    res = await session.exec(
        select(Playlist)
        .where((Playlist.id == playlist_id) | (Playlist.public_id == playlist_id))
        .where(Playlist.userId == user_id)
    )
    p = res.first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return p
