import pytest
from src.download_logging.stages import (
    STAGE_INITIALIZATION_START,
    STAGE_YT_DLP_METADATA_START,
    STAGE_YT_DLP_METADATA_END,
    STAGE_MEDIA_DOWNLOAD_START,
    STAGE_DOWNLOAD_PROGRESS,
    STAGE_MEDIA_DOWNLOAD_END,
    STAGE_FFMPEG_SPRITES_START,
    STAGE_FFMPEG_SPRITES_END,
    STAGE_BUNDLE_PACKING_START,
    STAGE_COMPLETED,
)

STAGE_DATASETS = [
    {"stage": STAGE_INITIALIZATION_START, "expected": "INITIALIZATION_START"},
    {"stage": STAGE_YT_DLP_METADATA_START, "expected": "YT_DLP_METADATA_START"},
    {"stage": STAGE_YT_DLP_METADATA_END, "expected": "YT_DLP_METADATA_END"},
    {"stage": STAGE_MEDIA_DOWNLOAD_START, "expected": "MEDIA_DOWNLOAD_START"},
    {"stage": STAGE_DOWNLOAD_PROGRESS, "expected": "DOWNLOAD_PROGRESS"},
    {"stage": STAGE_MEDIA_DOWNLOAD_END, "expected": "MEDIA_DOWNLOAD_END"},
    {"stage": STAGE_FFMPEG_SPRITES_START, "expected": "FFMPEG_SPRITES_START"},
    {"stage": STAGE_FFMPEG_SPRITES_END, "expected": "FFMPEG_SPRITES_END"},
    {"stage": STAGE_BUNDLE_PACKING_START, "expected": "BUNDLE_PACKING_START"},
    {"stage": STAGE_COMPLETED, "expected": "COMPLETED"},
]

@pytest.mark.parametrize("dataset", STAGE_DATASETS, ids=[f"stg_{i}" for i in range(10)])
def test_download_stages_constants_10_datasets(dataset):
    assert dataset["stage"] == dataset["expected"]
