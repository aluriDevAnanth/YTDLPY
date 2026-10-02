"""Playlist router facade exporting submodules for backward compatibility."""

from src.routes.playlist import (
    AddVideoToPlaylistRequest,
    ensure_default_watch_later,
    get_playlist_by_id_or_public_id,
    router,
)

__all__ = [
    "router",
    "AddVideoToPlaylistRequest",
    "ensure_default_watch_later",
    "get_playlist_by_id_or_public_id",
]
