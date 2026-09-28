"""Aggregated playlist router module."""

from fastapi import APIRouter
from src.routes.playlist.crud import router as crud_router
from src.routes.playlist.helpers import (
    AddVideoToPlaylistRequest,
    ensure_default_watch_later,
    get_playlist_by_id_or_public_id,
)
from src.routes.playlist.items import router as items_router
from src.routes.playlist.watch_later import router as watch_later_router

router = APIRouter(prefix="/api", tags=["Playlists"])
router.include_router(crud_router)
router.include_router(items_router)
router.include_router(watch_later_router)

__all__ = [
    "router",
    "AddVideoToPlaylistRequest",
    "ensure_default_watch_later",
    "get_playlist_by_id_or_public_id",
]
