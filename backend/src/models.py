# Re-export all models from modular models package for 100% backward compatibility
from src.models import (
    LoginRequest,
    Playlist,
    PlaylistCreate,
    PlaylistOut,
    PlaylistVideoLink,
    StorageCleanRequest,
    Token,
    User,
    UserCreate,
    UserOut,
    UserSettings,
    UserSettingsUpdate,
    UserUpdate,
    Video,
)

__all__ = [
    "User",
    "UserSettings",
    "Video",
    "Token",
    "UserOut",
    "UserCreate",
    "UserUpdate",
    "LoginRequest",
    "UserSettingsUpdate",
    "StorageCleanRequest",
    "Playlist",
    "PlaylistVideoLink",
    "PlaylistCreate",
    "PlaylistOut",
]
