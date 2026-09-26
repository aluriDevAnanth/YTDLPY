import asyncio
import src.db as db
from sqlmodel import select
from src.logger import log_error, log_success
from src.models import Video
from .bundles import clean_orphaned_bundles
from .db_recovery import recover_stuck_videos
from .temp_folders import clean_stale_temp_folders


async def run_storage_cleanup():
    """
    Performs background maintenance & storage cleanup:
    1. Purges orphaned .adaumc bundle files on disk not associated with any DB record.
    2. Purges stale temp working folders older than 10 minutes.
    3. Recovers stale/interrupted DB video records stuck in active statuses.
    """
    async with db.async_session_maker() as session:
        result_ids = await session.exec(select(Video.id))
        result_bundle_ids = await session.exec(select(Video.bundleId))
        db_referenced_ids = set(result_ids.all()).union(set(result_bundle_ids.all()))

        clean_orphaned_bundles(db_referenced_ids)
        clean_stale_temp_folders(max_age_seconds=600)

        updated_any = await recover_stuck_videos(session)
        if updated_any:
            await session.commit()


async def start_cleanup_worker():
    """
    Non-overlapping background task loop. Runs storage cleanup every 10 seconds.
    Ensures previous execution completes before sleeping.
    """
    log_success("Storage Cleanup Worker initialized (10s non-overlapping interval).")
    while True:
        try:
            await run_storage_cleanup()
        except Exception as e:
            log_error("Unhandled exception in Storage Cleanup Worker", e)
        await asyncio.sleep(10)
