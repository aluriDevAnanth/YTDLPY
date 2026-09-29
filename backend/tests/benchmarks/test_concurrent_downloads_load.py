import pytest
import asyncio
import time
import uuid
from pathlib import Path
from src.models import Video, User
from src.db.session import async_session_maker
from src.bundle.creator import create_bundle

CONCURRENT_LOAD_DATASETS = [
    {"batch_seed": f"batch_{i}", "concurrency": 4, "items_per_batch": 4}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.benchmark
@pytest.mark.parametrize("dataset", CONCURRENT_LOAD_DATASETS, ids=[f"load_batch_{i}" for i in range(10)])
async def test_concurrent_downloads_load_10_datasets(tmp_path, dataset):
    concurrency = dataset["concurrency"]
    uid = f"u_{uuid.uuid4().hex[:8]}"
    uname = f"usr_{uuid.uuid4().hex[:8]}"
    
    # 1. Create test user with unique username
    async with async_session_maker() as session:
        user = User(
            id=uid,
            username=uname,
            hashed_password="hashed_pw",
            role="user",
        )
        session.add(user)
        await session.commit()

    # 2. Worker coroutine simulating download completion & bundle creation
    async def worker(worker_id: int):
        v_id = f"vid_{uuid.uuid4().hex[:8]}"
        # DB write
        async with async_session_maker() as session:
            video = Video(
                id=v_id,
                userId=uid,
                url=f"https://example.com/{v_id}",
                title=f"Parallel Video {worker_id}",
                downloadStatus="completed",
                downloaded=True,
            )
            session.add(video)
            await session.commit()
            
        # Bundle creation
        raw_vid = tmp_path / f"{v_id}.mp4"
        with open(raw_vid, "wb") as f:
            f.write(b"\x00" * 4096)
            
        bundle_path = create_bundle(
            video_id=v_id,
            temp_dir=tmp_path,
            asset_files={"video": f"{v_id}.mp4"},
        )
        return bundle_path

    start_time = time.perf_counter()
    tasks = [worker(i) for i in range(concurrency)]
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start_time

    assert len(results) == concurrency
    assert elapsed < 5.0  # Must complete concurrent pipelines in under 5 seconds
