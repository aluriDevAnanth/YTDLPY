"""Backend startup download resumption tasks."""

import asyncio
from sqlmodel import select
from src import db
from src.downloader.engine import process_video_download
from src.logger import log_info
from src.models import Video


async def resume_uncompleted_downloads():
    """Scans DB on backend startup for any interrupted downloads and automatically resumes them (excluding paused and failed downloads)."""
    loop = asyncio.get_running_loop()
    async with db.async_session_maker() as session:
        result = await session.exec(
            select(Video)
            .where(Video.downloaded == False, Video.type == "download")
            .where(Video.downloadStatus != "paused")
            .where(Video.downloadStatus != "failed")
        )
        uncompleted_videos = result.all()
        if uncompleted_videos:
            log_info(
                f"🔄 Resuming {len(uncompleted_videos)} uncompleted download(s) after backend start..."
            )
            for vid in uncompleted_videos:
                vid.downloadStatus = "queued"
                session.add(vid)
                await session.commit()
                asyncio.create_task(process_video_download(vid.id, loop))
