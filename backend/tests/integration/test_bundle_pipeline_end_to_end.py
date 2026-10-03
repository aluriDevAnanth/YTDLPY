import os
import pytest
from pathlib import Path
from src.bundle_manager import BundleManager
from src.download_logger import DownloadLogger
from src.cleanup_worker import clean_orphaned_bundles
import src.config as config

PIPELINE_DATASETS = [
    {
        "video_id": f"e2e_vid_pipeline_{i:02d}",
        "video_bytes": f"E2E_VIDEO_STREAM_DATA_{i}".encode() * (500 + i * 100),
        "thumb_bytes": f"E2E_THUMB_DATA_{i}".encode() * 50,
        "vtt_bytes": f"WEBVTT\n\n00:00:00.000 --> 00:00:10.000\nsprite_{i}.jpg#xywh=0,0,160,90\n".encode(),
        "sprite_bytes": f"E2E_SPRITE_IMAGE_{i}".encode() * 100,
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", PIPELINE_DATASETS, ids=[f"e2e_pipe_{i}" for i in range(10)])
async def test_bundle_pipeline_end_to_end_10_datasets(tmp_path, dataset):
    video_id = dataset["video_id"]
    temp_dir = tmp_path / f"temp_{video_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    config.TEMP_DIR = tmp_path / "temp_root"
    
    # 1. Initialize DownloadLogger and record initial stages
    logger = DownloadLogger(temp_dir=temp_dir)
    logger.log_initialization_start(video_id=video_id, user_id="e2e_user", url="https://youtube.com/watch?v=mock")
    logger.log_metadata_end(meta_info={"title": f"Title {video_id}", "duration": 120})
    
    # 2. Write raw assets to temp working directory
    video_file = "video.mp4"
    thumb_file = "thumbnail.jpg"
    vtt_file = "storyboard.vtt"
    sprite_file = "vtt_sprite_1.jpg"
    log_file = "download.ndjson"
    
    (temp_dir / video_file).write_bytes(dataset["video_bytes"])
    (temp_dir / thumb_file).write_bytes(dataset["thumb_bytes"])
    (temp_dir / vtt_file).write_bytes(dataset["vtt_bytes"])
    (temp_dir / sprite_file).write_bytes(dataset["sprite_bytes"])
    
    logger.log_bundle_packing_start(asset_count=5, bundle_filename=f"{video_id}.adaumc")
    
    # 3. Create .adaumc bundle
    asset_files = {
        "video": video_file,
        "thumbnail": thumb_file,
        "vtt": vtt_file,
        "vtt_sprite_1": sprite_file,
        "log": log_file,
    }
    
    bundle_path = BundleManager.create_bundle(
        video_id=video_id,
        temp_dir=temp_dir,
        asset_files=asset_files
    )
    assert bundle_path.exists()
    assert bundle_path.stat().st_size > 0
    
    # 4. Verify Bundle Index Table
    index_table, payload_start = BundleManager.read_index(bundle_path)
    assert set(index_table.keys()) == set(asset_files.keys())
    assert index_table["video"]["length"] == len(dataset["video_bytes"])
    assert index_table["thumbnail"]["length"] == len(dataset["thumb_bytes"])
    assert index_table["vtt"]["length"] == len(dataset["vtt_bytes"])
    assert index_table["vtt_sprite_1"]["length"] == len(dataset["sprite_bytes"])
    
    # 5. Stream and verify byte payloads
    streamed_video = []
    async for chunk in BundleManager.get_asset_stream(video_id, "video", chunk_size=1024):
        streamed_video.append(chunk)
    assert b"".join(streamed_video) == dataset["video_bytes"]
    
    streamed_vtt = []
    async for chunk in BundleManager.get_asset_stream(video_id, "vtt"):
        streamed_vtt.append(chunk)
    assert b"".join(streamed_vtt) == dataset["vtt_bytes"]
    
    # 6. Verify Cleanup Worker interaction
    # If video_id is active in DB, bundle is preserved
    purged_count = clean_orphaned_bundles(db_referenced_ids={video_id})
    assert purged_count == 0
    assert bundle_path.exists()
    
    # If video_id is removed from DB, bundle is purged
    purged_count_2 = clean_orphaned_bundles(db_referenced_ids=set())
    assert purged_count_2 == 1
    assert not bundle_path.exists()
