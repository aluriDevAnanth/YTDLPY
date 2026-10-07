import struct
import pytest
from pathlib import Path
from src.bundle.indexer import read_index
from src.bundle.creator import create_bundle
from src.bundle.constants import MAGIC_HEADER
from src.crypto import encrypt_header_index
import src.config as config

INDEX_DATASETS = [
    {
        "video_id": f"vid_idx_{i}",
        "assets": {
            "video": {"filename": f"video_{i}.mp4", "content": b"VID" * (i + 2)},
            "vtt": {"filename": f"sub_{i}.vtt", "content": b"WEBVTT\n" * (i + 1)},
            "vtt_sprite": {"filename": f"sprite_{i}.jpg", "content": b"SPRITE" * (i + 1)},
        }
    }
    for i in range(10)
]

@pytest.mark.parametrize("dataset", INDEX_DATASETS)
def test_read_index_valid_bundles_10_datasets(tmp_path, dataset):
    temp_dir = tmp_path / f"temp_{dataset['video_id']}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    asset_files = {}
    for key, data in dataset["assets"].items():
        (temp_dir / data["filename"]).write_bytes(data["content"])
        asset_files[key] = data["filename"]
        
    bundles_dir = tmp_path / "bundles"
    bundles_dir.mkdir(parents=True, exist_ok=True)
    config.BUNDLES_DIR = bundles_dir
    
    bundle_path = create_bundle(
        video_id=dataset["video_id"],
        temp_dir=temp_dir,
        asset_files=asset_files
    )
    
    index_table, payload_start = read_index(bundle_path)
    
    assert isinstance(index_table, dict)
    assert payload_start > 8 # 4 bytes magic + 4 bytes header length + encrypted table
    
    for key, data in dataset["assets"].items():
        assert key in index_table
        assert index_table[key]["length"] == len(data["content"])
        assert index_table[key]["filename"] == data["filename"]


def test_read_index_invalid_magic_header(tmp_path):
    bad_bundle = tmp_path / "corrupt.adaumc"
    bad_bundle.write_bytes(b"BAD!" + b"\x00" * 32)
    
    with pytest.raises(ValueError, match="Invalid .ytdlpy bundle format"):
        read_index(bad_bundle)


def test_read_index_truncated_header(tmp_path):
    truncated_bundle = tmp_path / "truncated.adaumc"
    truncated_bundle.write_bytes(MAGIC_HEADER + struct.pack(">I", 100) + b"\x00" * 10)
    
    with pytest.raises(Exception):
        read_index(truncated_bundle)
