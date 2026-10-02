import os
import time
import pytest
from pathlib import Path
from src.cleanup.temp_folders import clean_stale_temp_folders
from src.VideoDownloader import download_registry
import src.config as config

TEMP_CLEANUP_DATASETS = [
    {
        "active_names": [f"active_task_{i}_{j}" for j in range(2)],
        "stale_names": [f"stale_task_{i}_{j}" for j in range(2)],
        "fresh_names": [f"fresh_task_{i}_{j}" for j in range(2)],
    }
    for i in range(10)
]

@pytest.mark.parametrize("dataset", TEMP_CLEANUP_DATASETS)
def test_clean_stale_temp_folders_10_datasets(tmp_path, dataset):
    temp_dir = tmp_path / "temp_env"
    temp_dir.mkdir(parents=True, exist_ok=True)
    config.TEMP_DIR = temp_dir
    
    # 1. Create active task folders (registered in download_registry)
    for name in dataset["active_names"]:
        fpath = temp_dir / name
        fpath.mkdir(parents=True, exist_ok=True)
        (fpath / "data.bin").write_bytes(b"temp_data")
        download_registry.register(name)
        # Artificially set old mtime to verify registry protection
        old_time = time.time() - 1000
        os.utime(fpath, (old_time, old_time))
        
    # 2. Create stale task folders (not in registry, old mtime)
    for name in dataset["stale_names"]:
        fpath = temp_dir / name
        fpath.mkdir(parents=True, exist_ok=True)
        (fpath / "data.bin").write_bytes(b"temp_data")
        old_time = time.time() - 1000
        os.utime(fpath, (old_time, old_time))
        
    # 3. Create fresh task folders (not in registry, fresh mtime)
    for name in dataset["fresh_names"]:
        fpath = temp_dir / name
        fpath.mkdir(parents=True, exist_ok=True)
        (fpath / "data.bin").write_bytes(b"temp_data")
        now_time = time.time()
        os.utime(fpath, (now_time, now_time))
        
    try:
        purged = clean_stale_temp_folders(max_age_seconds=600)
        assert purged == len(dataset["stale_names"])
        
        # Verify active and fresh folders survive
        for name in dataset["active_names"]:
            assert (temp_dir / name).exists()
        for name in dataset["fresh_names"]:
            assert (temp_dir / name).exists()
            
        # Verify stale folders deleted
        for name in dataset["stale_names"]:
            assert not (temp_dir / name).exists()
    finally:
        # Cleanup registry
        for name in dataset["active_names"]:
            download_registry.unregister(name)
