import asyncio
import os
import shutil
import time
import zipfile
from pathlib import Path

import httpx
from src.config import BIN_DIR
from src.logger import log_error, log_info, log_success, log_warning
from src.sio import send_startup_event

FFMPEG_WIN_URL = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"


def get_ffmpeg_path() -> str:
    ffmpeg_exe = BIN_DIR / "ffmpeg.exe" if os.name == "nt" else BIN_DIR / "ffmpeg"
    if ffmpeg_exe.exists():
        return str(ffmpeg_exe)
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    return str(ffmpeg_exe)


def get_ffprobe_path() -> str:
    ffprobe_exe = BIN_DIR / "ffprobe.exe" if os.name == "nt" else BIN_DIR / "ffprobe"
    if ffprobe_exe.exists():
        return str(ffprobe_exe)
    system_ffprobe = shutil.which("ffprobe")
    if system_ffprobe:
        return system_ffprobe
    return str(ffprobe_exe)


def format_size(bytes_val: float) -> str:
    if not bytes_val or bytes_val <= 0:
        return "0 B"
    if bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KiB"
    elif bytes_val < 1024 * 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.1f} MiB"
    else:
        return f"{bytes_val / (1024 * 1024 * 1024):.1f} GiB"


def format_eta(seconds: float) -> str:
    if not seconds or seconds <= 0:
        return "0s"
    if seconds < 60:
        return f"{int(seconds)}s"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    return f"{m}m {s}s"


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
                start_time = time.time()
                last_update_time = 0.0

                with open(zip_file, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=1024 * 64):
                        f.write(chunk)
                        downloaded += len(chunk)
                        now = time.time()

                        if now - last_update_time >= 0.2 or (
                            total_bytes > 0 and downloaded == total_bytes
                        ):
                            last_update_time = now
                            elapsed = now - start_time
                            speed = downloaded / elapsed if elapsed > 0 else 0.0

                            if total_bytes > 0:
                                percent = (downloaded / total_bytes) * 100
                                percent_per_sec = (speed / total_bytes) * 100
                                remaining_bytes = total_bytes - downloaded
                                eta_sec = remaining_bytes / speed if speed > 0 else 0.0

                                progress = {
                                    "percent": round(percent, 1),
                                    "speed": f"{format_size(speed)}/s",
                                    "percentPerSec": f"{percent_per_sec:.1f}%/s",
                                    "eta": format_eta(eta_sec),
                                    "downloadedSize": format_size(downloaded),
                                    "totalSize": format_size(total_bytes),
                                }
                                message = "Downloading FFmpeg binaries..."
                            else:
                                progress = {
                                    "percent": 0.0,
                                    "speed": f"{format_size(speed)}/s",
                                    "percentPerSec": "0.0%/s",
                                    "eta": "N/A",
                                    "downloadedSize": format_size(downloaded),
                                    "totalSize": "Unknown",
                                }
                                message = "Downloading FFmpeg binaries..."

                            await send_startup_event(
                                message=message,
                                typee="ongoing",
                                progress=progress,
                            )

        await send_startup_event("Extracting FFmpeg binaries...", "ongoing")

        def extract_zip():
            with zipfile.ZipFile(zip_file, "r") as z:
                for member in z.namelist():
                    filename = os.path.basename(member)
                    if filename in ["ffmpeg.exe", "ffprobe.exe", "ffmpeg", "ffprobe"]:
                        target_path = BIN_DIR / filename
                        with z.open(member) as source, open(
                            target_path, "wb"
                        ) as target:
                            shutil.copyfileobj(source, target)
                        if os.name != "nt":
                            os.chmod(target_path, 0o755)

        await asyncio.to_thread(extract_zip)
        if zip_file.exists():
            zip_file.unlink()
        log_success("FFmpeg successfully downloaded and installed.")
        await send_startup_event("Backend operational", "success")
    except Exception as e:
        log_error("Failed to download FFmpeg", e)
        await send_startup_event(f"FFmpeg download failed: {str(e)}", "error")

