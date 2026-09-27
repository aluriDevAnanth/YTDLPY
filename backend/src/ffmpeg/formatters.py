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
