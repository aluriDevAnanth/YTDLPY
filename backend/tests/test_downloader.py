import pytest
import asyncio
from unittest.mock import patch
from sqlmodel import select
import yt_dlp

from src.models import Video, User
from src.VideoDownloader import process_video_download, download_registry
from src.bundle_manager import BundleManager
from src.config import TEMP_DIR, BUNDLES_DIR
from tests.conftest import test_async_session

@pytest.mark.asyncio
async def test_process_video_download_mocked(seed_users):
    user = seed_users["user1"]
    video_id = "mock-dl-video-001"
    
    # Create DB entry for video
    async with test_async_session() as session:
        vid = Video(
            id=video_id,
            userId=user.id,
            url="https://youtube.com/watch?v=mockvideo",
            format="BEST",
            type="download",
            downloadStatus="queued"
        )
        session.add(vid)
        await session.commit()

    mock_info = {
        'title': 'Mocked Test Video',
        'duration': 120,
        'height': 1080,
        'filesize': 10485760,
    }

    def mock_download(self, urls):
        # Trigger progress hook to simulate first-hook metadata population & progress stream
        hooks = self.params.get('progress_hooks', [])
        for hook in hooks:
            hook({
                'status': 'downloading',
                'info_dict': mock_info,
                'downloaded_bytes': 5242880,
                'total_bytes': 10485760,
                'speed': 1048576,
                'eta': 5
            })

        # Create fake downloaded media & thumbnail files in temp folder
        v_dir = TEMP_DIR / video_id
        v_dir.mkdir(parents=True, exist_ok=True)
        (v_dir / "video.mp4").write_bytes(b"MOCK_MP4_HEADER_" + b"0" * 1000)
        (v_dir / "video.jpg").write_bytes(b"MOCK_JPG_HEADER_" + b"0" * 100)

    loop = asyncio.get_event_loop()

    with patch.object(yt_dlp.YoutubeDL, "download", side_effect=mock_download, autospec=True), \
         patch("subprocess.run"):
        
        # Run background download process
        await process_video_download(video_id, loop)

    # Verify temp folder was atomically purged
    temp_folder = TEMP_DIR / video_id
    assert not temp_folder.exists()

    # Verify .ytdlpy bundle file was created
    bundle_file = BundleManager.get_bundle_path(video_id)
    assert bundle_file.exists()

    # Verify database record was updated to completed
    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == video_id))
        updated_vid = res.first()
        assert updated_vid is not None
        assert updated_vid.downloadStatus == "completed"
        assert updated_vid.fullTitle == "Mocked Test Video"
        assert updated_vid.downloaded is True

    # Clean up test bundle
    if bundle_file.exists():
        bundle_file.unlink()

@pytest.mark.asyncio
async def test_process_video_cancellation(seed_users):
    user = seed_users["user1"]
    video_id = "mock-cancel-video-002"
    
    async with test_async_session() as session:
        vid = Video(
            id=video_id,
            userId=user.id,
            url="https://youtube.com/watch?v=cancelme",
            format="BEST",
            type="download",
            downloadStatus="queued"
        )
        session.add(vid)
        await session.commit()

    loop = asyncio.get_event_loop()

    # Simulate cancellation mid-download
    def mock_download_cancel(self, urls):
        download_registry.cancel(video_id)
        hooks = self.params.get('progress_hooks', [])
        for hook in hooks:
            hook({'status': 'downloading', 'downloaded_bytes': 500, 'total_bytes': 1000})

    with patch.object(yt_dlp.YoutubeDL, "download", side_effect=mock_download_cancel, autospec=True):
        await process_video_download(video_id, loop)

    # Verify temp folder and bundle files were completely purged
    assert not (TEMP_DIR / video_id).exists()
    assert not BundleManager.get_bundle_path(video_id).exists()

    # Verify video DB entry was removed
    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == video_id))
        assert res.first() is None
