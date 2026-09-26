import shutil
import time
import src.config as config
from src.logger import log_error, log_info
from src.VideoDownloader import download_registry


def clean_stale_temp_folders(max_age_seconds: int = 600) -> int:
    """Purges stale temp working folders older than max_age_seconds."""
    purged_count = 0
    temp_dir = config.TEMP_DIR
    if temp_dir.exists():
        now = time.time()
        for temp_folder in temp_dir.iterdir():
            if temp_folder.is_dir():
                folder_name = temp_folder.name
                if not download_registry.is_active(folder_name):
                    try:
                        mtime = temp_folder.stat().st_mtime
                        if (now - mtime) > max_age_seconds:
                            shutil.rmtree(temp_folder, ignore_errors=True)
                            purged_count += 1
                            log_info(
                                f"[Cleanup Worker] Purged stale temp folder: '{folder_name}'"
                            )
                    except Exception as err:
                        log_error(
                            f"[Cleanup Worker] Failed to purge temp folder '{folder_name}'",
                            err,
                        )
    return purged_count
