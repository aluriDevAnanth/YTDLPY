import asyncio
import time
import pytest
from sqlmodel import select
from src.models import Video, User

@pytest.mark.asyncio
@pytest.mark.benchmark
async def test_db_insert_and_select_throughput_benchmark(session):
    """Measures database concurrent insertion and bulk query throughput."""
    user = User(id="bench_user_01", username="bench_user", hashed_password="pw", role="user")
    session.add(user)
    await session.commit()
    
    # 1. Bulk insert 200 video records
    count = 200
    videos = [
        Video(
            id=f"bench_vid_{i:04d}",
            userId=user.id,
            url=f"https://www.youtube.com/watch?v=bench_{i:04d}",
            title=f"Benchmark Video #{i}",
            downloadStatus="completed" if i % 2 == 0 else "downloading",
            downloaded=bool(i % 2 == 0),
        )
        for i in range(count)
    ]
    
    start_insert = time.perf_counter()
    session.add_all(videos)
    await session.commit()
    insert_elapsed = time.perf_counter() - start_insert
    inserts_per_sec = count / insert_elapsed
    
    assert inserts_per_sec > 50.0  # Safe threshold for in-memory SQLite
    
    # 2. Bulk select query latency
    start_select = time.perf_counter()
    result = await session.exec(select(Video).where(Video.userId == user.id))
    rows = result.all()
    select_elapsed = time.perf_counter() - start_select
    
    assert len(rows) == count
    assert select_elapsed < 0.1  # < 100ms for 200 rows
