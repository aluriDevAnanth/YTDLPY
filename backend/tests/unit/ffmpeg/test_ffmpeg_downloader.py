import io
import os
import zipfile
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from pathlib import Path
from src.ffmpeg.downloader import ensure_ffmpeg_installed
import src.config as config

def create_mock_ffmpeg_zip() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("bin/ffmpeg.exe", b"MOCK_FFMPEG_BINARY")
        z.writestr("bin/ffprobe.exe", b"MOCK_FFPROBE_BINARY")
        z.writestr("bin/ffmpeg", b"MOCK_FFMPEG_BINARY")
        z.writestr("bin/ffprobe", b"MOCK_FFPROBE_BINARY")
    return buf.getvalue()

DOWNLOAD_TEST_SCENARIOS = [
    {"index": i, "already_installed": bool(i < 3), "content_length": str(1024 * (i + 1))}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("scenario", DOWNLOAD_TEST_SCENARIOS)
async def test_ensure_ffmpeg_installed_10_scenarios(tmp_path, scenario):
    bin_dir = tmp_path / f"bin_ffmpeg_{scenario['index']}"
    bin_dir.mkdir(parents=True, exist_ok=True)
    
    ffmpeg_exe = bin_dir / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
    ffprobe_exe = bin_dir / ("ffprobe.exe" if os.name == "nt" else "ffprobe")
    
    if scenario["already_installed"]:
        ffmpeg_exe.write_bytes(b"EXISTING")
        ffprobe_exe.write_bytes(b"EXISTING")
        
    zip_bytes = create_mock_ffmpeg_zip()
    
    # Mock httpx streaming response
    mock_response = AsyncMock()
    mock_response.headers = {"content-length": scenario["content_length"]}
    
    async def mock_aiter_bytes(chunk_size=65536):
        yield zip_bytes
        
    mock_response.aiter_bytes = mock_aiter_bytes
    
    mock_stream_ctx = MagicMock()
    mock_stream_ctx.__aenter__ = AsyncMock(return_value=mock_response)
    mock_stream_ctx.__aexit__ = AsyncMock(return_value=None)
    
    mock_client = MagicMock()
    mock_client.stream = MagicMock(return_value=mock_stream_ctx)
    mock_client_ctx = MagicMock()
    mock_client_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client_ctx.__aexit__ = AsyncMock(return_value=None)
    
    with patch("src.ffmpeg.downloader.BIN_DIR", bin_dir), \
         patch("src.ffmpeg.paths.BIN_DIR", bin_dir), \
         patch("shutil.which", return_value=None), \
         patch("httpx.AsyncClient", return_value=mock_client_ctx), \
         patch("src.ffmpeg.downloader.send_startup_event", new_callable=AsyncMock) as mock_sio:
        
        await ensure_ffmpeg_installed()
        
        assert ffmpeg_exe.exists()
        assert ffprobe_exe.exists()
        assert not (bin_dir / "ffmpeg.zip").exists()
        assert mock_sio.called
