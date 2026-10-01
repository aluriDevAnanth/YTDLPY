from typing import Optional
from sqlmodel import Field, SQLModel


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


class StorageCleanRequest(SQLModel):
    clean_watched: Optional[bool] = False
    clear_all: Optional[bool] = False
    video_ids: Optional[list[str]] = None
