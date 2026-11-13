"""
Common Test Helper: file_system_sandbox
Exports shared utilities and 10 standardized test datasets.
"""

SHARED_DATASETS = [
    {"dataset_index": 1, "label": "file_system_sandbox_item_1", "valid": True},
    {"dataset_index": 2, "label": "file_system_sandbox_item_2", "valid": True},
    {"dataset_index": 3, "label": "file_system_sandbox_item_3", "valid": True},
    {"dataset_index": 4, "label": "file_system_sandbox_item_4", "valid": True},
    {"dataset_index": 5, "label": "file_system_sandbox_item_5", "valid": True},
    {"dataset_index": 6, "label": "file_system_sandbox_item_6", "valid": True},
    {"dataset_index": 7, "label": "file_system_sandbox_item_7", "valid": True},
    {"dataset_index": 8, "label": "file_system_sandbox_item_8", "valid": True},
    {"dataset_index": 9, "label": "file_system_sandbox_item_9", "valid": True},
    {"dataset_index": 10, "label": "file_system_sandbox_item_10", "valid": True}
]

def get_shared_file_system_sandbox_dataset(idx: int = 0):
    return SHARED_DATASETS[idx % len(SHARED_DATASETS)]
