"""
Common Test Helper: sqlite_in_memory
Exports shared utilities and 10 standardized test datasets.
"""

SHARED_DATASETS = [
    {"dataset_index": 1, "label": "sqlite_in_memory_item_1", "valid": True},
    {"dataset_index": 2, "label": "sqlite_in_memory_item_2", "valid": True},
    {"dataset_index": 3, "label": "sqlite_in_memory_item_3", "valid": True},
    {"dataset_index": 4, "label": "sqlite_in_memory_item_4", "valid": True},
    {"dataset_index": 5, "label": "sqlite_in_memory_item_5", "valid": True},
    {"dataset_index": 6, "label": "sqlite_in_memory_item_6", "valid": True},
    {"dataset_index": 7, "label": "sqlite_in_memory_item_7", "valid": True},
    {"dataset_index": 8, "label": "sqlite_in_memory_item_8", "valid": True},
    {"dataset_index": 9, "label": "sqlite_in_memory_item_9", "valid": True},
    {"dataset_index": 10, "label": "sqlite_in_memory_item_10", "valid": True}
]

def get_shared_sqlite_in_memory_dataset(idx: int = 0):
    return SHARED_DATASETS[idx % len(SHARED_DATASETS)]
