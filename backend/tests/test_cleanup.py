from pathlib import Path

import pytest
import src.db as db
from sqlmodel import select
from src.cleanup_worker import run_storage_cleanup
from src.config import BUNDLES_DIR
from src.models import Video


@pytest.mark.asyncio
async def test_storage_cleanup_orphaned_bundles(seed_users):
    BUNDLES_DIR.mkdir(parents=True, exist_ok=True)
    orphaned_path = BUNDLES_DIR / "orphaned_test_id.adaumc"
    orphaned_path.write_bytes(b"YTPY_ORPHANED_HEADER_TEST")
    assert orphaned_path.exists()
    await run_storage_cleanup()
    assert not orphaned_path.exists()


@pytest.mark.asyncio
async def test_storage_cleanup_stale_db_tasks(seed_users):
    user = seed_users["user1"]
    async with db.async_session_maker() as session:
        stuck_video = Video(
            id="stuck-task-999",
            userId=user.id,
            url="https://example.com/stuck",
            title="Stuck Video",
            downloadStatus="downloading",
        )
        session.add(stuck_video)
        await session.commit()
    await run_storage_cleanup()
    async with db.async_session_maker() as session:
        res = await session.exec(select(Video).where(Video.id == "stuck-task-999"))
        v = res.first()
        assert v is not None
        assert v.downloadStatus == "failed"
        await session.delete(v)
        await session.commit()
