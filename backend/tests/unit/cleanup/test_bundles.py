import pytest
from pathlib import Path
from src.cleanup.bundles import clean_orphaned_bundles
import src.config as config

CLEANUP_BUNDLE_DATASETS = [
    {
        "active_ids": {f"active_{i}_{j}" for j in range(3)},
        "orphan_ids": {f"orphan_{i}_{j}" for j in range(2)},
    }
    for i in range(10)
]

@pytest.mark.parametrize("dataset", CLEANUP_BUNDLE_DATASETS)
def test_clean_orphaned_bundles_10_datasets(tmp_path, dataset):
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # Create active bundle files
    for aid in dataset["active_ids"]:
        (bundles_dir / f"{aid}.adaumc").write_bytes(b"ACTIVE_BUNDLE_CONTENT")
        
    # Create orphan bundle files
    for oid in dataset["orphan_ids"]:
        (bundles_dir / f"{oid}.adaumc").write_bytes(b"ORPHAN_BUNDLE_CONTENT")
        
    purged = clean_orphaned_bundles(dataset["active_ids"])
    assert purged == len(dataset["orphan_ids"])
    
    # Verify active files remain
    for aid in dataset["active_ids"]:
        assert (bundles_dir / f"{aid}.adaumc").exists()
        
    # Verify orphan files deleted
    for oid in dataset["orphan_ids"]:
        assert not (bundles_dir / f"{oid}.adaumc").exists()


def test_clean_orphaned_bundles_empty_dir(tmp_path):
    bundles_dir = tmp_path / "bundles_empty"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    purged = clean_orphaned_bundles(set())
    assert purged == 0
