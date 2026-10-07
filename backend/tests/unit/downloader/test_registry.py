import pytest
from src.downloader.registry import ActiveDownloadRegistry, get_optimal_thread_count

REGISTRY_DATASETS = [
    {"video_id": f"vid_reg_t_{i}", "duration": i * 10} for i in range(10)
]

@pytest.mark.parametrize("dataset", REGISTRY_DATASETS, ids=[f"reg_{i}" for i in range(10)])
def test_download_registry_10_datasets(dataset):
    registry = ActiveDownloadRegistry()
    vid = dataset["video_id"]
    
    registry.register(vid)
    assert registry.is_active(vid) is True
    
    registry.pause(vid)
    assert registry.is_paused(vid) is True
    
    registry.resume(vid)
    assert registry.is_paused(vid) is False
    
    registry.unregister(vid)
    assert registry.is_active(vid) is False
    
    threads = get_optimal_thread_count(dataset["duration"])
    assert threads >= 1
