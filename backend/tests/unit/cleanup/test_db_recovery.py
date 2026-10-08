import pytest
from sqlmodel import select
from src.cleanup.db_recovery import recover_stuck_videos
from src.models import Video, User
from src.VideoDownloader import download_registry
import src.config as config

RECOVERY_DATASETS = [
    {
        "user_id": f"recov_user_{i}",
        "stuck_video_id": f"vid_stuck_{i}",
        "missing_bundle_video_id": f"vid_missing_b_{i}",
        "healthy_video_id": f"vid_healthy_{i}",
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", RECOVERY_DATASETS)
async def test_recover_stuck_videos_10_datasets(session, tmp_path, dataset):
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # 1. Setup user
    user = User(
        id=dataset["user_id"],
        username=f"user_{dataset['user_id']}",
        hashed_password="fakehash"
    )
    session.add(user)
    await session.commit()
    
    # 2. Setup stuck video (not in registry)
    v_stuck = Video(
        id=dataset["stuck_video_id"],
        userId=user.id,
        url=f"https://www.youtube.com/watch?v={dataset['stuck_video_id']}",
        title="Stuck Video",
        downloadStatus="downloading",
        downloaded=False
    )
    
    # 3. Setup completed video with missing bundle
    v_missing_b = Video(
        id=dataset["missing_bundle_video_id"],
        userId=user.id,
        url=f"https://www.youtube.com/watch?v={dataset['missing_bundle_video_id']}",
        title="Missing Bundle Video",
        downloadStatus="completed",
        downloaded=True,
        bundleId=dataset["missing_bundle_video_id"]
    )
    
    # 4. Setup healthy completed video with existing bundle
    v_healthy = Video(
        id=dataset["healthy_video_id"],
        userId=user.id,
        url=f"https://www.youtube.com/watch?v={dataset['healthy_video_id']}",
        title="Healthy Video",
        downloadStatus="completed",
        downloaded=True,
        bundleId=dataset["healthy_video_id"]
    )
    (bundles_dir / f"{dataset['healthy_video_id']}.adaumc").write_bytes(b"BUNDLE_DATA")
    
    session.add(v_stuck)
    session.add(v_missing_b)
    session.add(v_healthy)
    await session.commit()
    
    # Execute recovery
    updated = await recover_stuck_videos(session)
    await session.commit()
    
    assert updated is True
    
    # Verify states
    refreshed_stuck = await session.get(Video, dataset["stuck_video_id"])
    assert refreshed_stuck.downloadStatus == "failed"
    
    refreshed_missing = await session.get(Video, dataset["missing_bundle_video_id"])
    assert refreshed_missing.downloadStatus == "failed"
    assert refreshed_missing.downloaded is False
    
    refreshed_healthy = await session.get(Video, dataset["healthy_video_id"])
    assert refreshed_healthy.downloadStatus == "completed"
    assert refreshed_healthy.downloaded is True
