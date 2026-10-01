import src.config as config
from src.logger import log_error, log_info


def clean_orphaned_bundles(db_referenced_ids: set[str]) -> int:
    """Purges orphaned .adaumc bundle files on disk not associated with any DB record."""
    purged_count = 0
    bundles_dir = config.BUNDLES_DIR
    if bundles_dir.exists():
        for bundle_file in bundles_dir.glob("*.adaumc"):
            bundle_id = bundle_file.stem
            if bundle_id not in db_referenced_ids:
                try:
                    bundle_file.unlink()
                    purged_count += 1
                    log_info(
                        f"[Cleanup Worker] Purged orphaned bundle file with 0 subscribers: '{bundle_file.name}'"
                    )
                except Exception as err:
                    log_error(
                        f"[Cleanup Worker] Failed to unlink orphaned bundle '{bundle_file.name}'",
                        err,
                    )
    return purged_count
