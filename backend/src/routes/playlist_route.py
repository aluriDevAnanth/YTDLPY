from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db import get_session
from src.models import Playlist, PlaylistCreate, PlaylistOut, PlaylistVideoLink, User, Video
from src.routes.auth_route import get_current_user

router = APIRouter(prefix="/api", tags=["Playlists"])


class AddVideoToPlaylistRequest(BaseModel):
    video_id: str


async def ensure_default_watch_later(session: AsyncSession, user_id: str) -> Playlist:
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
    res = await session.exec(
        select(Playlist)
        .where((Playlist.id == playlist_id) | (Playlist.public_id == playlist_id))
        .where(Playlist.userId == user_id)
    )
    p = res.first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return p


@router.get("/playlists", response_model=List[PlaylistOut])
@router.get("/playlists/", response_model=List[PlaylistOut], include_in_schema=False)
async def get_playlists(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await ensure_default_watch_later(session, current_user.id)
    res = await session.exec(
        select(Playlist).where(Playlist.userId == current_user.id).order_by(Playlist.is_default.desc(), Playlist.created_at.desc())
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
    name_clean = req.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Playlist name cannot be empty")

    new_playlist = Playlist(
        userId=current_user.id,
        name=name_clean,
        description=req.description or "",
        is_default=False,
    )
    session.add(new_playlist)
    await session.commit()
    await session.refresh(new_playlist)

    return PlaylistOut(
        id=new_playlist.id,
        public_id=new_playlist.public_id,
        userId=new_playlist.userId,
        name=new_playlist.name,
        description=new_playlist.description or "",
        is_default=new_playlist.is_default,
        created_at=new_playlist.created_at,
        video_count=0,
        video_ids=[],
    )


@router.delete("/playlists/{playlist_id}")
async def delete_playlist(
    playlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)
    if p.is_default:
        raise HTTPException(
            status_code=400, detail="Cannot delete default 'Watch Later' playlist"
        )

    links_res = await session.exec(
        select(PlaylistVideoLink).where(PlaylistVideoLink.playlist_id == p.id)
    )
    for l in links_res.all():
        await session.delete(l)

    await session.delete(p)
    await session.commit()
    return {"status": "success", "id": p.id, "public_id": p.public_id}


@router.get("/playlists/{playlist_id}/videos", response_model=List[Video])
async def get_playlist_videos(
    playlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
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
    p = await get_playlist_by_id_or_public_id(session, playlist_id, current_user.id)

    v_res = await session.exec(
        select(Video).where(Video.id == req.video_id).where(Video.userId == current_user.id)
    )
    if not v_res.first():
        raise HTTPException(status_code=404, detail="Video not found")

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


@router.post("/watch-later/toggle/{video_id}")
async def toggle_watch_later(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    wl = await ensure_default_watch_later(session, current_user.id)
    link_res = await session.exec(
        select(PlaylistVideoLink)
        .where(PlaylistVideoLink.playlist_id == wl.id)
        .where(PlaylistVideoLink.video_id == video_id)
    )
    link = link_res.first()
    in_watch_later = False
    if link:
        await session.delete(link)
        await session.commit()
        in_watch_later = False
    else:
        new_link = PlaylistVideoLink(playlist_id=wl.id, video_id=video_id)
        session.add(new_link)
        await session.commit()
        in_watch_later = True

    return {"status": "success", "in_watch_later": in_watch_later, "playlist_id": wl.id, "public_id": wl.public_id, "video_id": video_id}
