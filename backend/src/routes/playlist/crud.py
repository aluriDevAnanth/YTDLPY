"""Playlist CRUD endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models import Playlist, PlaylistCreate, PlaylistOut, PlaylistVideoLink, User
from src.routes.auth_route import get_current_user
from src.routes.playlist.helpers import (
    ensure_default_watch_later,
    get_playlist_by_id_or_public_id,
)

router = APIRouter()


@router.get("/playlists", response_model=List[PlaylistOut])
@router.get("/playlists/", response_model=List[PlaylistOut], include_in_schema=False)
async def get_playlists(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve all playlists for the current user."""
    await ensure_default_watch_later(session, current_user.id)
    res = await session.exec(
        select(Playlist)
        .where(Playlist.userId == current_user.id)
        .order_by(Playlist.is_default.desc(), Playlist.created_at.desc())
    )
    playlists = res.all()
    output = []
    for p in playlists:
        links_res = await session.exec(
            select(PlaylistVideoLink).where(PlaylistVideoLink.playlist_id == p.id)
        )
        links = links_res.all()
        video_ids = [l.video_id for l in links]
        output.append(
            PlaylistOut(
                id=p.id,
                public_id=getattr(p, "public_id", p.id.lstrip("_")),
                userId=p.userId,
                name=p.name,
                description=p.description or "",
                is_default=p.is_default,
                created_at=p.created_at,
                video_count=len(video_ids),
                video_ids=video_ids,
            )
        )
    return output


@router.post("/playlists", response_model=PlaylistOut)
@router.post("/playlists/", response_model=PlaylistOut, include_in_schema=False)
async def create_playlist(
    req: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Creates a new custom user playlist."""
    name_clean = req.name.strip()
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Playlist name cannot be empty",
        )

    playlist = Playlist(
        userId=current_user.id,
        name=name_clean,
        description=req.description or "",
        is_default=False,
    )
    session.add(playlist)
    await session.commit()
    await session.refresh(playlist)

    return PlaylistOut(
        id=playlist.id,
        public_id=playlist.public_id,
        userId=playlist.userId,
        name=playlist.name,
        description=playlist.description or "",
        is_default=playlist.is_default,
        created_at=playlist.created_at,
        video_count=0,
        video_ids=[],
    )


@router.get("/playlists/{playlist_id}", response_model=PlaylistOut)
async def get_playlist_details(
    playlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieves single playlist metadata and video IDs list."""
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    links_res = await session.exec(
        select(PlaylistVideoLink).where(PlaylistVideoLink.playlist_id == p.id)
    )
    video_ids = [l.video_id for l in links_res.all()]
    return PlaylistOut(
        id=p.id,
        public_id=p.public_id,
        userId=p.userId,
        name=p.name,
        description=p.description or "",
        is_default=p.is_default,
        created_at=p.created_at,
        video_count=len(video_ids),
        video_ids=video_ids,
    )


@router.delete("/playlists/{playlist_id}")
async def delete_playlist(
    playlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Deletes a playlist (protected default playlists cannot be deleted)."""
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    if p.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default Watch Later playlist",
        )

    links_res = await session.exec(
        select(PlaylistVideoLink).where(PlaylistVideoLink.playlist_id == p.id)
    )
    for l in links_res.all():
        await session.delete(l)

    await session.delete(p)
    await session.commit()
    return {"status": "success", "id": p.id}
