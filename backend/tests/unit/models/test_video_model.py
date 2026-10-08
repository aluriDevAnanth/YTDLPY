"""
10-Dataset Unit Test Suite for Video and StorageCleanRequest Models.
"""
import pytest
from tests.fixtures.data_factories import VIDEO_DATASETS
from src.models import StorageCleanRequest, Video


@pytest.mark.parametrize("idx, data", list(enumerate(VIDEO_DATASETS)))
def test_video_model_instantiation(idx, data):
    """Verifies that Video model instantiates and validates across 10 distinct video datasets."""
    video = Video(
        id=data["id"],
        userId=data["userId"],
        url=data["url"],
        videoId=data["videoId"],
        fullTitle=data["fullTitle"],
        durationString=data["durationString"],
        size=data["size"],
        resolution=data["resolution"],
        downloadStatus=data["downloadStatus"],
        audioOnly=data["audioOnly"],
        format=data["format"],
        type=data["type"],
    )
    assert video.id == data["id"]
    assert video.userId == data["userId"]
    assert video.url == data["url"]
    assert video.fullTitle == data["fullTitle"]
    assert video.downloadStatus == data["downloadStatus"]


@pytest.mark.parametrize(
    "clean_watched, clear_all, video_ids",
    [
        (True, False, None),
        (False, True, None),
        (False, False, ["vid-001", "vid-002"]),
        (True, True, ["vid-003"]),
        (False, False, []),
        (True, False, ["vid-004", "vid-005", "vid-006"]),
        (False, False, ["vid-007"]),
        (False, True, ["vid-008", "vid-009"]),
        (True, True, []),
        (False, False, ["vid-010"]),
    ],
)
def test_storage_clean_request_datasets(clean_watched, clear_all, video_ids):
    """Verifies 10 variations of StorageCleanRequest parameters."""
    req = StorageCleanRequest(
        clean_watched=clean_watched,
        clear_all=clear_all,
        video_ids=video_ids,
    )
    assert req.clean_watched == clean_watched
    assert req.clear_all == clear_all
    assert req.video_ids == video_ids
