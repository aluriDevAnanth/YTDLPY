import asyncio
import shutil
import time
from pathlib import Path

import src.db as db
from sqlmodel import select
from src.config import BUNDLES_DIR, TEMP_DIR
from src.logger import log_error, log_info, log_success, log_warning
from src.models import Video
from src.VideoDownloader import download_registry


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
        if BUNDLES_DIR.exists():
            for bundle_file in BUNDLES_DIR.glob("*.adaumc"):
                bundle_id = bundle_file.stem
                if bundle_id not in db_referenced_ids:
                    try:
                        bundle_file.unlink()
                        log_info(
                            f"[Cleanup Worker] Purged orphaned bundle file with 0 subscribers: '{bundle_file.name}'"
                        )
                    except Exception as err:
                        log_error(
                            f"[Cleanup Worker] Failed to unlink orphaned bundle '{bundle_file.name}'",
                            err,
                        )
        if TEMP_DIR.exists():
            now = time.time()
            for temp_folder in TEMP_DIR.iterdir():
                if temp_folder.is_dir():
                    folder_name = temp_folder.name
                    if not download_registry.is_active(folder_name):
                        try:
                            mtime = temp_folder.stat().st_mtime
                            if (now - mtime) > 600:
                                shutil.rmtree(temp_folder, ignore_errors=True)
                                log_info(
                                    f"[Cleanup Worker] Purged stale temp folder: '{folder_name}'"
                                )
                        except Exception as err:
                            log_error(
                                f"[Cleanup Worker] Failed to purge temp folder '{folder_name}'",
                                err,
                            )
        stuck_statuses = ["downloading", "generating_sprites", "packing_bundle"]
        stuck_res = await session.exec(
            select(Video).where(Video.downloadStatus.in_(stuck_statuses))
        )
        stuck_videos = stuck_res.all()
        updated_any = False
        for v in stuck_videos:
            if not download_registry.is_active(v.id):
                v.downloadStatus = "failed"
                session.add(v)
                updated_any = True
                log_warning(
                    f"[Cleanup Worker] Marked dead task video record '{v.id}' as failed."
                )
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
