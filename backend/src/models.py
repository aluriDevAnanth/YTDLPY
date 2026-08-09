import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = "user"  # "admin" or "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserSettings(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    default_format: str = "BEST"  # BEST, BESTAUDIO, WORST
    max_concurrent_downloads: int = 3
    auto_generate_vtt: bool = True
    theme: str = "dark"

class Video(SQLModel, table=True):
    id: str = Field(primary_key=True)  # 16-char SHA256 hex hash of URL
    userId: str = Field(foreign_key="user.id", index=True)
    url: str
    videoId: str = ""
    fullTitle: str = ""
    durationString: str = ""
    size: str = ""
    resolution: str = ""
    downloadStatus: str = "queued"  # queued, downloading, paused, completed, failed
    audioOnly: bool = False
    watched: bool = False
    downloaded: bool = False
    prevWatchTime: float = 0.0
    format: str = "BEST"  # BEST, BESTAUDIO, WORST
    type: str = "download"  # scan, download
    videoPathId: str = ""
    thumbnailPathId: str = ""
    vttPathId: str = ""
    vttSpritePathId: str = ""

# API DTO Schemas
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
    max_concurrent_downloads: Optional[int] = None
    auto_generate_vtt: Optional[bool] = None
    theme: Optional[str] = None
