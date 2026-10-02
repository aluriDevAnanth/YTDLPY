"""Utility functions for string and measurement formatting."""


def format_size(bytes_val: float) -> str:
    """Format byte count into human-readable KiB, MiB, or GiB."""
    if not bytes_val or bytes_val <= 0:
        return "0 MiB"
    if bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KiB"
    elif bytes_val < 1024 * 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.1f} MiB"
    else:
        return f"{bytes_val / (1024 * 1024 * 1024):.1f} GiB"


def format_duration(seconds: float) -> str:
    """Format seconds into HH:MM:SS or MM:SS."""
    if not seconds or seconds <= 0:
        return "00:00"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def format_vtt_timestamp(seconds: float) -> str:
    """Format float seconds into WebVTT timestamp format (HH:MM:SS.mmm)."""
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    sec_int = int(s)
    ms = int((s - sec_int) * 1000)
    return f"{int(h):02d}:{int(m):02d}:{sec_int:02d}.{ms:03d}"


def format_eta(eta_sec: float) -> str:
    """Format ETA seconds into human-friendly duration string."""
    if not eta_sec or eta_sec <= 0:
        return "0s"
    if eta_sec < 60:
        return f"{int(eta_sec)}s"
    m, s = divmod(int(eta_sec), 60)
    return f"{m}m {s}s"
