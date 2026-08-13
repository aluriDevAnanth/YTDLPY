import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserSettings(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    default_format: str = "BEST"
    default_view_mode: str = "grid"
    max_concurrent_downloads: int = 3
    auto_generate_vtt: bool = True
    theme: str = "dark"
    cookies_source: str = "none"
    cookies_browser: Optional[str] = "chrome"
    cookies_txt: Optional[str] = None
    auth_storage_mode: str = "local"


class Video(SQLModel, table=True):
    id: str = Field(primary_key=True)
    userId: str = Field(foreign_key="user.id", index=True)
    bundleId: str = Field(default="", index=True)
    url: str
    videoId: str = ""
    fullTitle: str = ""
    durationString: str = ""
    size: str = ""
    resolution: str = ""
    downloadStatus: str = "queued"
    audioOnly: bool = False
    watched: bool = False
    downloaded: bool = False
    prevWatchTime: float = 0.0
    format: str = "BEST"
    type: str = "download"


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(SQLModel):
    id: str
    username: str
    role: str
    created_at: datetime
    settings: Optional[UserSettings] = None


class UserCreate(SQLModel):
    username: str
    password: str
    role: Optional[str] = "user"


class UserUpdate(SQLModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(SQLModel):
    username: str
    password: str


class UserSettingsUpdate(SQLModel):
    default_format: Optional[str] = None
    default_view_mode: Optional[str] = None
    max_concurrent_downloads: Optional[int] = None
    auto_generate_vtt: Optional[bool] = None
    theme: Optional[str] = None
    cookies_source: Optional[str] = None
    cookies_browser: Optional[str] = None
    cookies_txt: Optional[str] = None
    auth_storage_mode: Optional[str] = None


class StorageCleanRequest(SQLModel):
    clean_watched: Optional[bool] = False
    clear_all: Optional[bool] = False
    video_ids: Optional[list[str]] = None

