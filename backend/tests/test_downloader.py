import asyncio
from unittest.mock import MagicMock, patch

import pytest
import src.config as config
import yt_dlp
from sqlmodel import select
from src.bundle_manager import BundleManager
from src.models import User, Video
from src.VideoDownloader import download_registry, process_video_download
from tests.conftest import test_async_session


@pytest.mark.asyncio
async def test_process_video_download_mocked(seed_users):
    user = seed_users["user1"]
    video_id = "mock-dl-video-001"
    async with test_async_session() as session:
        vid = Video(
            id=video_id,
            userId=user.id,
            url="https://youtube.com/watch?v=mockvideo",
            format="BEST",
            type="download",
            downloadStatus="queued",
        )
        session.add(vid)
        await session.commit()
    mock_info = {
        "title": "Mocked Test Video",
        "duration": 120,
        "height": 1080,
        "filesize": 10485760,
    }

    def mock_download(self, urls):
        hooks = self.params.get("progress_hooks", [])
        for hook in hooks:
            hook(
                {
                    "status": "downloading",
                    "info_dict": mock_info,
                    "downloaded_bytes": 5242880,
                    "total_bytes": 10485760,
                    "speed": 1048576,
                    "eta": 5,
                }
            )
        v_dir = config.TEMP_DIR / video_id
        v_dir.mkdir(parents=True, exist_ok=True)
        (v_dir / "video.mp4").write_bytes(b"MOCK_MP4_HEADER_" + b"0" * 1000)
        (v_dir / "video.jpg").write_bytes(b"MOCK_JPG_HEADER_" + b"0" * 100)

    loop = asyncio.get_event_loop()
    mock_proc = MagicMock()
    mock_proc.stderr = []
    mock_proc.wait.return_value = 0
    with patch.object(
        yt_dlp.YoutubeDL, "download", side_effect=mock_download, autospec=True
    ), patch("subprocess.run"), patch("subprocess.Popen", return_value=mock_proc):
        await process_video_download(video_id, loop)
    temp_folder = config.TEMP_DIR / video_id
    assert not temp_folder.exists()
    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == video_id))
        updated_vid = res.first()
        assert updated_vid is not None
        assert updated_vid.downloadStatus == "completed"
        assert updated_vid.fullTitle == "Mocked Test Video"
        assert updated_vid.downloaded is True
    bundle_file = BundleManager.get_bundle_path(updated_vid.bundleId or video_id)
    assert bundle_file.exists()
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
            downloadStatus="queued",
        )
        session.add(vid)
        await session.commit()
    loop = asyncio.get_event_loop()

    def mock_download_cancel(self, urls):
        download_registry.cancel(video_id)
        hooks = self.params.get("progress_hooks", [])
        for hook in hooks:
            hook(
                {"status": "downloading", "downloaded_bytes": 500, "total_bytes": 1000}
            )

    with patch.object(
        yt_dlp.YoutubeDL, "download", side_effect=mock_download_cancel, autospec=True
    ):
        await process_video_download(video_id, loop)
    assert not (config.TEMP_DIR / video_id).exists()
    assert not BundleManager.get_bundle_path(video_id).exists()
    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == video_id))
        assert res.first() is None


@pytest.mark.asyncio
async def test_download_registry_pause_resume():
    vid_id = "test-pause-resume-001"
    download_registry.register(vid_id)
    assert download_registry.is_active(vid_id)
    assert not download_registry.is_paused(vid_id)

    download_registry.pause(vid_id)
    assert download_registry.is_paused(vid_id)

    download_registry.resume(vid_id)
    assert not download_registry.is_paused(vid_id)

    download_registry.unregister(vid_id)


@pytest.mark.asyncio
async def test_resume_uncompleted_downloads_ignores_paused(seed_users):
    user = seed_users["user1"]
    paused_vid_id = "test-paused-on-startup"
    async with test_async_session() as session:
        vid = Video(
            id=paused_vid_id,
            userId=user.id,
            url="https://youtube.com/watch?v=pausedonstartup",
            format="BEST",
            type="download",
            downloadStatus="paused",
            downloaded=False,
        )
        session.add(vid)
        await session.commit()

    with patch("src.VideoDownloader.process_video_download") as mock_process:
        from src.VideoDownloader import resume_uncompleted_downloads
        await resume_uncompleted_downloads()
        mock_process.assert_not_called()

    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == paused_vid_id))
        vid_rec = res.first()
        assert vid_rec is not None
        assert vid_rec.downloadStatus == "paused"


@pytest.mark.asyncio
async def test_failed_video_preserved_in_db(seed_users):
    user = seed_users["user1"]
    failed_video_id = "test-fail-preserve-001"
    async with test_async_session() as session:
        vid = Video(
            id=failed_video_id,
            userId=user.id,
            url="https://youtube.com/watch?v=failme",
            format="BEST",
            type="download",
            downloadStatus="queued",
        )
        session.add(vid)
        await session.commit()

    loop = asyncio.get_event_loop()

    def mock_download_error(self, urls):
        raise Exception("Network connection timeout")

    with patch.object(
        yt_dlp.YoutubeDL, "download", side_effect=mock_download_error, autospec=True
    ):
        await process_video_download(failed_video_id, loop)

    async with test_async_session() as session:
        res = await session.exec(select(Video).where(Video.id == failed_video_id))
        vid_rec = res.first()
        assert vid_rec is not None
        assert vid_rec.downloadStatus == "failed"
