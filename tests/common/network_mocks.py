"""
Common Test Helper: network_mocks
Exports shared utilities and 10 standardized test datasets.
"""

SHARED_DATASETS = [
    {"dataset_index": 1, "label": "network_mocks_item_1", "valid": True},
    {"dataset_index": 2, "label": "network_mocks_item_2", "valid": True},
    {"dataset_index": 3, "label": "network_mocks_item_3", "valid": True},
    {"dataset_index": 4, "label": "network_mocks_item_4", "valid": True},
    {"dataset_index": 5, "label": "network_mocks_item_5", "valid": True},
    {"dataset_index": 6, "label": "network_mocks_item_6", "valid": True},
    {"dataset_index": 7, "label": "network_mocks_item_7", "valid": True},
    {"dataset_index": 8, "label": "network_mocks_item_8", "valid": True},
    {"dataset_index": 9, "label": "network_mocks_item_9", "valid": True},
    {"dataset_index": 10, "label": "network_mocks_item_10", "valid": True}
]

def get_shared_network_mocks_dataset(idx: int = 0):
    return SHARED_DATASETS[idx % len(SHARED_DATASETS)]
