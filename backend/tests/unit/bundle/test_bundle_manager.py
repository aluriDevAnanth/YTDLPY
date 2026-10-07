import pytest
from pathlib import Path
from src.bundle.manager import BundleManager
import src.config as config

MANAGER_DATASETS = [
    {"video_id": f"mgr_vid_{i}", "data": f"MANAGER_STREAM_DATA_{i}".encode() * 20}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", MANAGER_DATASETS)
async def test_bundle_manager_facade_10_datasets(tmp_path, dataset):
    temp_dir = tmp_path / f"temp_{dataset['video_id']}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    video_file = temp_dir / "stream.mp4"
    video_file.write_bytes(dataset["data"])
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    # 1. get_bundle_path
    bpath = BundleManager.get_bundle_path(dataset["video_id"])
    assert bpath == bundles_dir / f"{dataset['video_id']}.adaumc"
    
    # 2. create_bundle
    created = BundleManager.create_bundle(
        video_id=dataset["video_id"],
        temp_dir=temp_dir,
        asset_files={"video": "stream.mp4"}
    )
    assert created.exists()
    
    # 3. read_index
    index_table, payload_start = BundleManager.read_index(created)
    assert "video" in index_table
    assert index_table["video"]["length"] == len(dataset["data"])
    
    # 4. get_asset_stream
    chunks = []
    async for chunk in BundleManager.get_asset_stream(dataset["video_id"], "video"):
        chunks.append(chunk)
    assert b"".join(chunks) == dataset["data"]
