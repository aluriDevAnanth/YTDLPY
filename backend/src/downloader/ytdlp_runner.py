"""yt-dlp options construction and execution with resilient cookie/browser fallback."""

import shutil
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import yt_dlp
from src.config import STORAGE_DIR
from src.ffmpeg_manager import get_ffmpeg_path
from src.logger import log_info


def build_ytdlp_options(
    req_format: str,
    video_temp_dir: Path,
    progress_hook: Callable[[Dict[str, Any]], None],
    effective_cookies: Dict[str, Any],
) -> Dict[str, Any]:
    """Build yt-dlp configuration dictionary with format specifications, cookies, and hooks."""
    format_spec = "bestvideo*+bestaudio/best"
    if req_format == "BESTAUDIO":
        format_spec = "bestaudio/best"
    elif req_format == "WORST":
        format_spec = "worst"

    out_template = str(video_temp_dir / "video.%(ext)s")
    ydl_opts: Dict[str, Any] = {
        "format": format_spec,
        "outtmpl": out_template,
        "writethumbnail": True,
        "progress_hooks": [progress_hook],
        "merge_output_format": "mp4",
        "ffmpeg_location": get_ffmpeg_path(),
        "nopart": True,
        "continue_dl": True,
        "updatetime": False,
        "quiet": True,
        "no_warnings": True,
        "retries": 10,
        "fragment_retries": 10,
        "http_chunk_size": 10485760,
        "remote_components": ["ejs:github"],
        "js_runtimes": {"node": {}} if shutil.which("node") else {},
        "extractor_args": {
            "youtube": {
                "player_client": ["web_embedded", "web"],
            }
        },
    }

    cookie_source = effective_cookies.get("source", "none")
    profile = effective_cookies.get("profile")
    candidates = effective_cookies.get("candidate_browsers", [])

    if cookie_source == "custom" and effective_cookies.get("cookies_txt"):
        cookies_file = video_temp_dir / "cookies.txt"
        cookies_file.write_text(effective_cookies["cookies_txt"], encoding="utf-8")
        ydl_opts["cookiefile"] = str(cookies_file)
    elif cookie_source == "storage_file" or (STORAGE_DIR / "cookies.txt").exists():
        storage_cookies = STORAGE_DIR / "cookies.txt"
        if storage_cookies.exists():
            ydl_opts["cookiefile"] = str(storage_cookies)
    elif cookie_source == "browser" and candidates:
        primary_b = candidates[0]
        if profile:
            ydl_opts["cookiesfrombrowser"] = (primary_b, profile)
        else:
            ydl_opts["cookiesfrombrowser"] = (primary_b,)

    return ydl_opts, format_spec, out_template


def run_ytdlp_with_fallback(
    url: str,
    ydl_opts: Dict[str, Any],
    effective_cookies: Dict[str, Any],
):
    """Executes yt-dlp download, catching browser DPAPI locks and falling back gracefully."""
    candidates: List[str] = effective_cookies.get("candidate_browsers", [])
    profile = effective_cookies.get("profile")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        err_str = str(e).lower()
        is_retryable = any(
            k in err_str
            for k in [
                "cookie",
                "lock",
                "sqlite",
                "403",
                "forbidden",
                "dpapi",
                "decrypt",
            ]
        )
        if is_retryable:
            if candidates:
                for b in candidates:
                    if b == candidates[0] and "cookiesfrombrowser" in ydl_opts:
                        continue
                    try:
                        log_info(f"Retrying download with candidate browser '{b}'...")
                        opts = dict(ydl_opts)
                        opts["cookiesfrombrowser"] = (
                            (b, profile) if profile else (b,)
                        )
                        with yt_dlp.YoutubeDL(opts) as ydl:
                            ydl.download([url])
                        return
                    except Exception:
                        continue
            if "cookiesfrombrowser" in ydl_opts:
                try:
                    log_info(
                        "Browser DPAPI decryption failed. Retrying download without browser cookies..."
                    )
                    opts_nocookie = {
                        k: v
                        for k, v in ydl_opts.items()
                        if k != "cookiesfrombrowser"
                    }
                    with yt_dlp.YoutubeDL(opts_nocookie) as ydl:
                        ydl.download([url])
                    return
                except Exception:
                    pass
        raise e
