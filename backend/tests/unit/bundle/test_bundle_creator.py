import struct
import pytest
from pathlib import Path
from src.bundle.creator import get_bundle_path, create_bundle
from src.bundle.constants import MAGIC_HEADER
from src.crypto import decrypt_header_index, apply_stream_cipher_mask
import src.config as config

BUNDLE_CREATOR_DATASETS = [
    {"video_id": f"vid_create_{i:02d}", "files": {"video": f"video_{i}.mp4", "thumb": f"thumb_{i}.jpg"}, "video_content": f"VIDEO_DATA_{i}".encode() * (i + 1), "thumb_content": f"THUMB_DATA_{i}".encode() * 5}
    for i in range(10)
]

@pytest.mark.parametrize("dataset", BUNDLE_CREATOR_DATASETS)
def test_create_bundle_integrity_10_datasets(tmp_path, dataset):
    # Setup temp working directory
    temp_dir = tmp_path / f"temp_{dataset['video_id']}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Write dummy source files
    video_file = temp_dir / dataset["files"]["video"]
    video_file.write_bytes(dataset["video_content"])
    thumb_file = temp_dir / dataset["files"]["thumb"]
    thumb_file.write_bytes(dataset["thumb_content"])
    
    # Configure bundle directory
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    progress_calls = []
    def on_progress(done, total):
        progress_calls.append((done, total))
        
    created_path = create_bundle(
        video_id=dataset["video_id"],
        temp_dir=temp_dir,
        asset_files=dataset["files"],
        progress_callback=on_progress
    )
    
    assert created_path.exists()
    assert created_path == get_bundle_path(dataset["video_id"])
    
    # Verify binary structure
    with open(created_path, "rb") as f:
        magic = f.read(4)
        assert magic == MAGIC_HEADER
        index_len = struct.unpack(">I", f.read(4))[0]
        enc_index = f.read(index_len)
        index_table = decrypt_header_index(enc_index)
        
        assert "video" in index_table
        assert "thumb" in index_table
        assert index_table["video"]["length"] == len(dataset["video_content"])
        assert index_table["thumb"]["length"] == len(dataset["thumb_content"])
        assert index_table["video"]["offset"] == 0
        assert index_table["thumb"]["offset"] == len(dataset["video_content"])
        
        payload_bytes = f.read()
        expected_total_len = len(dataset["video_content"]) + len(dataset["thumb_content"])
        assert len(payload_bytes) == expected_total_len
        
        # Verify cipher mask decryption
        unmasked = apply_stream_cipher_mask(payload_bytes, offset=0)
        expected_combined = dataset["video_content"] + dataset["thumb_content"]
        assert unmasked == expected_combined


def test_create_bundle_with_missing_files(tmp_path):
    temp_dir = tmp_path / "temp_missing"
    temp_dir.mkdir(parents=True, exist_ok=True)
    (temp_dir / "exists.mp4").write_bytes(b"existing_video")
    
    bundles_dir = tmp_path / "bundles"
    config.BUNDLES_DIR = bundles_dir
    
    bundle_path = create_bundle(
        video_id="missing_test",
        temp_dir=temp_dir,
        asset_files={"video": "exists.mp4", "ghost": "not_found.vtt"}
    )
    
    assert bundle_path.exists()
    with open(bundle_path, "rb") as f:
        f.seek(4)
        index_len = struct.unpack(">I", f.read(4))[0]
        index_table = decrypt_header_index(f.read(index_len))
        assert "video" in index_table
        assert "ghost" not in index_table
