import asyncio
import pytest
from src.VideoDownloader import download_registry

REGISTRY_DATASETS = [
    {"task_id": f"task_reg_lifecycle_{i:02d}", "concurrent_subtasks": 5}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", REGISTRY_DATASETS, ids=[f"reg_cycle_{i}" for i in range(10)])
async def test_download_registry_lifecycle_10_datasets(dataset):
    task_id = dataset["task_id"]
    
    # 1. Initial state: not active
    assert not download_registry.is_active(task_id)
    
    # 2. Register task
    download_registry.register(task_id)
    assert download_registry.is_active(task_id)
    
    # 3. Duplicate registration is idempotent
    download_registry.register(task_id)
    assert download_registry.is_active(task_id)
    
    # 4. Concurrent registration of sub-tasks
    async def subtask_worker(sub_id: str):
        download_registry.register(sub_id)
        await asyncio.sleep(0.01)
        assert download_registry.is_active(sub_id)
        download_registry.unregister(sub_id)
        assert not download_registry.is_active(sub_id)

    sub_tasks = [
        subtask_worker(f"{task_id}_sub_{j}")
        for j in range(dataset["concurrent_subtasks"])
    ]
    await asyncio.gather(*sub_tasks)
    
    # 5. Main task still active until explicitly unregistered
    assert download_registry.is_active(task_id)
    download_registry.unregister(task_id)
    assert not download_registry.is_active(task_id)
