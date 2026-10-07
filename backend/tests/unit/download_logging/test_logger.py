import json
import pytest
from pathlib import Path
from src.download_logging.logger import DownloadLogger
from src.download_logging.stages import (
    STAGE_INITIALIZATION_START,
    STAGE_YT_DLP_METADATA_START,
    STAGE_YT_DLP_METADATA_END,
    STAGE_MEDIA_DOWNLOAD_START,
    STAGE_DOWNLOAD_PROGRESS,
    STAGE_MEDIA_DOWNLOAD_END,
    STAGE_FFMPEG_SPRITES_START,
    STAGE_FFMPEG_SPRITES_PROGRESS,
    STAGE_FFMPEG_SPRITES_END,
    STAGE_VTT_GENERATION,
    STAGE_BUNDLE_PACKING_START,
    STAGE_BUNDLE_PACKING_END,
    STAGE_COMPLETED,
    STAGE_ERROR,
)

LOG_STAGE_DATASETS = [
    {
        "video_id": f"vid_log_{i:02d}",
        "url": f"https://www.youtube.com/watch?v=mock_log_{i:02d}",
        "title": f"Log Video Title #{i}",
        "uploader": f"Channel Creator {i}",
        "duration": 60 + i * 30,
        "filesize": 1024 * 1024 * (i + 1),
    }
    for i in range(10)
]

@pytest.mark.parametrize("dataset", LOG_STAGE_DATASETS)
def test_download_logger_full_pipeline_10_datasets(tmp_path, dataset):
    log_dir = tmp_path / f"log_test_{dataset['video_id']}"
    logger = DownloadLogger(temp_dir=log_dir)
    assert logger.log_file_path.name == "download.ndjson"
    
    # 1. Initialization
    e1 = logger.log_initialization_start(
        video_id=dataset["video_id"],
        user_id="test_user",
        url=dataset["url"]
    )
    assert e1["stage"] == STAGE_INITIALIZATION_START
    assert e1["details"]["video_id"] == dataset["video_id"]
    
    # 2. Metadata Start & End
    e2 = logger.log_metadata_start(url=dataset["url"])
    assert e2["stage"] == STAGE_YT_DLP_METADATA_START
    
    e3 = logger.log_metadata_end(meta_info={
        "title": dataset["title"],
        "uploader": dataset["uploader"],
        "duration": dataset["duration"],
        "ext": "mp4"
    })
    assert e3["stage"] == STAGE_YT_DLP_METADATA_END
    assert e3["details"]["title"] == dataset["title"]
    
    # 3. Download Start, Progress & End
    e4 = logger.log_download_start(format_spec="bestvideo+bestaudio")
    assert e4["stage"] == STAGE_MEDIA_DOWNLOAD_START
    
    e5 = logger.log_progress(percent=50.0, speed="5.2 MiB/s", eta="10s", downloaded_bytes=dataset["filesize"] // 2)
    assert e5["stage"] == STAGE_DOWNLOAD_PROGRESS
    assert e5["details"]["percent"] == 50.0
    
    e6 = logger.log_download_end(media_filepath="/path/video.mp4", filesize=dataset["filesize"])
    assert e6["stage"] == STAGE_MEDIA_DOWNLOAD_END
    assert e6["details"]["filesize"] == dataset["filesize"]
    
    # 4. Sprites Start, Progress & End
    e7 = logger.log_ffmpeg_sprites_start(duration_sec=dataset["duration"], num_threads=4)
    assert e7["stage"] == STAGE_FFMPEG_SPRITES_START
    
    e8 = logger.log_ffmpeg_sprites_progress(completed_thumbnails=10, total_thumbnails=20, percent=50.0)
    assert e8["stage"] == STAGE_FFMPEG_SPRITES_PROGRESS
    
    e9 = logger.log_ffmpeg_sprites_end(total_thumbnails=20, sprite_filepath="/path/sprite.jpg", grid_cols=5, grid_rows=4)
    assert e9["stage"] == STAGE_FFMPEG_SPRITES_END
    
    # 5. VTT Generation
    e10 = logger.log_vtt_generation(vtt_filepath="/path/storyboard.vtt", total_cues=20)
    assert e10["stage"] == STAGE_VTT_GENERATION
    
    # 6. Bundle Packing
    e11 = logger.log_bundle_packing_start(asset_count=4, bundle_filename=f"{dataset['video_id']}.adaumc")
    assert e11["stage"] == STAGE_BUNDLE_PACKING_START
    
    e12 = logger.log_bundle_packing_end(bundle_filepath=f"/bundles/{dataset['video_id']}.adaumc", bundle_size_bytes=dataset["filesize"])
    assert e12["stage"] == STAGE_BUNDLE_PACKING_END
    
    # 7. Completed
    e13 = logger.log_completed(video_id=dataset["video_id"], elapsed_seconds=12.34)
    assert e13["stage"] == STAGE_COMPLETED
    
    # Verify file content has all 13 lines correctly formatted as JSON
    lines = logger.log_file_path.read_text(encoding="utf-8").strip().split("\n")
    assert len(lines) == 13
    for line in lines:
        parsed = json.loads(line)
        assert "timestamp" in parsed
        assert "stage" in parsed
        assert "level" in parsed
        assert "message" in parsed
        assert "details" in parsed


def test_download_logger_error_logging(tmp_path):
    log_dir = tmp_path / "error_test"
    logger = DownloadLogger(temp_dir=log_dir)
    
    err_entry = logger.log_error(
        stage=STAGE_YT_DLP_METADATA_START,
        error_message="HTTP 403 Forbidden: Video is private",
        traceback_str="Traceback (most recent call last): ..."
    )
    assert err_entry["stage"] == STAGE_ERROR
    assert err_entry["level"] == "ERROR"
    assert "HTTP 403" in err_entry["details"]["error"]
