"""
Common Test Helper: video_factories
Exports shared utilities and 10 standardized test datasets.
"""

SHARED_DATASETS = [
    {"dataset_index": 1, "label": "video_factories_item_1", "valid": True},
    {"dataset_index": 2, "label": "video_factories_item_2", "valid": True},
    {"dataset_index": 3, "label": "video_factories_item_3", "valid": True},
    {"dataset_index": 4, "label": "video_factories_item_4", "valid": True},
    {"dataset_index": 5, "label": "video_factories_item_5", "valid": True},
    {"dataset_index": 6, "label": "video_factories_item_6", "valid": True},
    {"dataset_index": 7, "label": "video_factories_item_7", "valid": True},
    {"dataset_index": 8, "label": "video_factories_item_8", "valid": True},
    {"dataset_index": 9, "label": "video_factories_item_9", "valid": True},
    {"dataset_index": 10, "label": "video_factories_item_10", "valid": True}
]

def get_shared_video_factories_dataset(idx: int = 0):
    return SHARED_DATASETS[idx % len(SHARED_DATASETS)]
