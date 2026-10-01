import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Playlist(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"_{uuid.uuid4().hex}", primary_key=True)
    public_id: str = Field(default_factory=lambda: uuid.uuid4().hex, index=True)
    userId: str = Field(foreign_key="user.id", index=True)
    name: str
    description: Optional[str] = ""
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PlaylistVideoLink(SQLModel, table=True):
    playlist_id: str = Field(foreign_key="playlist.id", primary_key=True)
    video_id: str = Field(foreign_key="video.id", primary_key=True)
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PlaylistCreate(SQLModel):
    name: str
    description: Optional[str] = ""


class PlaylistOut(SQLModel):
    id: str
    public_id: str = ""
    userId: str
    name: str
    description: Optional[str] = ""
    is_default: bool = False
    created_at: datetime
    video_count: int = 0
    video_ids: list[str] = []
