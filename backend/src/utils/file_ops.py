"""Safe filesystem operation utilities resilient against Windows file locks."""

import gc
import os
import shutil
import time
from pathlib import Path

_orig_os_replace = os.replace
_orig_os_rename = os.rename


def safe_os_replace(src, dst, retries: int = 10, delay: float = 0.3):
    """Safely replace a file, retrying if Windows holds a transient file lock ([WinError 32])."""
    for i in range(retries):
        try:
            return _orig_os_replace(src, dst)
        except (PermissionError, OSError) as err:
            if (
                getattr(err, "winerror", None) == 32
                or getattr(err, "errno", None) == 13
            ):
                if i < retries - 1:
                    time.sleep(delay)
                    continue
            raise


def safe_os_rename(src, dst, retries: int = 10, delay: float = 0.3):
    """Safely rename a file, retrying if Windows holds a transient file lock ([WinError 32])."""
    for i in range(retries):
        try:
            return _orig_os_rename(src, dst)
        except (PermissionError, OSError) as err:
            if (
                getattr(err, "winerror", None) == 32
                or getattr(err, "errno", None) == 13
            ):
                if i < retries - 1:
                    time.sleep(delay)
                    continue
            raise


os.replace = safe_os_replace
os.rename = safe_os_rename


def safe_move_file(src: Path, dst: Path, retries: int = 5, delay: float = 0.5):
    """Safely move a file on Windows, retrying if the file is temporarily locked by background processes."""
    if src == dst:
        return
    for i in range(retries):
        try:
            if dst.exists():
                dst.unlink()
            shutil.move(str(src), str(dst))
            return
        except (PermissionError, OSError):
            if i == retries - 1:
                raise
            time.sleep(delay)


def safe_copy_file(src: Path, dst: Path, retries: int = 5, delay: float = 0.5):
    """Safely copy a file on Windows, retrying if the file is temporarily locked by background processes."""
    if src == dst:
        return
    for i in range(retries):
        try:
            shutil.copy(str(src), str(dst))
            return
        except (PermissionError, OSError):
            if i == retries - 1:
                raise
            time.sleep(delay)


def safe_rmtree(path: Path, retries: int = 10, delay: float = 0.2):
    """Safely delete directory on Windows, retrying if files are temporarily locked."""
    if not path.exists():
        return

    for _ in range(retries):
        gc.collect()
        try:
            shutil.rmtree(path, ignore_errors=False)
        except Exception:
            try:
                shutil.rmtree(path, ignore_errors=True)
            except Exception:
                pass
        if not path.exists():
            return
        time.sleep(delay)
