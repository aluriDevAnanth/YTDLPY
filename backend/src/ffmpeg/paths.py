import os
import shutil
from src.config import BIN_DIR


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
