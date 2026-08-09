import os
import shutil
import zipfile
import asyncio
import httpx
from pathlib import Path
from src.config import BIN_DIR
from src.sio import send_startup_event
from src.logger import log_info, log_success, log_warning, log_error

FFMPEG_WIN_URL = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"

def get_ffmpeg_path() -> str:
    ffmpeg_exe = BIN_DIR / "ffmpeg.exe" if os.name == 'nt' else BIN_DIR / "ffmpeg"
    if ffmpeg_exe.exists():
        return str(ffmpeg_exe)
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    return str(ffmpeg_exe)

def get_ffprobe_path() -> str:
    ffprobe_exe = BIN_DIR / "ffprobe.exe" if os.name == 'nt' else BIN_DIR / "ffprobe"
    if ffprobe_exe.exists():
        return str(ffprobe_exe)
    system_ffprobe = shutil.which("ffprobe")
    if system_ffprobe:
        return system_ffprobe
    return str(ffprobe_exe)

async def ensure_ffmpeg_installed():
    """Checks for FFmpeg; downloads and extracts if missing with live startup progress."""
    ffmpeg_exe = Path(get_ffmpeg_path())
    ffprobe_exe = Path(get_ffprobe_path())
    
    if ffmpeg_exe.exists() and ffprobe_exe.exists():
        log_success(f"FFmpeg binary verified at: {ffmpeg_exe}")
        await send_startup_event("Backend operational", "success")
        return

    log_warning("FFmpeg binary not found. Initiating automatic download...")
    await send_startup_event("Downloading FFmpeg binaries (0%)...", "ongoing")

    zip_file = BIN_DIR / "ffmpeg.zip"
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=120.0) as client:
            async with client.stream("GET", FFMPEG_WIN_URL) as response:
                total_bytes = int(response.headers.get("content-length", 0))
                downloaded = 0
                last_percent = -1
                
                with open(zip_file, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=1024 * 64):
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_bytes > 0:
                            percent = int((downloaded / total_bytes) * 100)
                            if percent != last_percent and percent % 5 == 0:
                                last_percent = percent
                                await send_startup_event(f"Downloading FFmpeg binaries ({percent}%)...", "ongoing")
        
        await send_startup_event("Extracting FFmpeg binaries...", "ongoing")
        
        # Extract binaries offloaded to thread
        def extract_zip():
            with zipfile.ZipFile(zip_file, "r") as z:
                for member in z.namelist():
                    filename = os.path.basename(member)
                    if filename in ["ffmpeg.exe", "ffprobe.exe", "ffmpeg", "ffprobe"]:
                        target_path = BIN_DIR / filename
                        with z.open(member) as source, open(target_path, "wb") as target:
                            shutil.copyfileobj(source, target)
                        if os.name != 'nt':
                            os.chmod(target_path, 0o755)

        await asyncio.to_thread(extract_zip)
        
        if zip_file.exists():
            zip_file.unlink()

        log_success("FFmpeg successfully downloaded and installed.")
        await send_startup_event("Backend operational", "success")
    except Exception as e:
        log_error("Failed to download FFmpeg", e)
        await send_startup_event(f"FFmpeg download failed: {str(e)}", "error")
