import pytest
from pathlib import Path
from src.bundle.creator import create_bundle
from src.bundle.manager import BundleManager
import src.config as config

BYTE_RANGE_DATASETS = [
    {"start": 0, "end": 49, "expected_length": 50},
    {"start": 50, "end": 99, "expected_length": 50},
    {"start": 0, "end": 99, "expected_length": 100},
    {"start": 10, "end": 20, "expected_length": 11},
    {"start": 0, "end": 0, "expected_length": 1},
    {"start": 99, "end": 99, "expected_length": 1},
    {"start": 25, "end": 74, "expected_length": 50},
    {"start": 0, "end": 500, "expected_length": 501},
    {"start": 200, "end": 400, "expected_length": 201},
    {"start": 500, "end": 999, "expected_length": 500},
]

@pytest.fixture(scope="module")
def sample_streaming_bundle(tmp_path_factory):
    tmp_dir = tmp_path_factory.mktemp("streaming_test")
    
    # Generate 1024 bytes of known deterministic data
    test_data = bytes([i % 256 for i in range(1024)])
    raw_video = tmp_dir / "video.mp4"
    with open(raw_video, "wb") as f:
        f.write(test_data)
        
    bundle_path = create_bundle(
        video_id="range_matrix_vid",
        temp_dir=tmp_dir,
        asset_files={"video": "video.mp4"},
    )
    return "range_matrix_vid", test_data

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", BYTE_RANGE_DATASETS, ids=[f"range_{i}" for i in range(10)])
async def test_streaming_byte_range_matrix_10_datasets(sample_streaming_bundle, dataset):
    bundle_id, original_data = sample_streaming_bundle
    
    start = dataset["start"]
    end = dataset["end"]
    
    chunks = []
    async for chunk in BundleManager.get_asset_stream(bundle_id, "video", start_byte=start, end_byte=end):
        chunks.append(chunk)
        
    sliced_bytes = b"".join(chunks)
    assert len(sliced_bytes) == dataset["expected_length"]
    assert sliced_bytes == original_data[start : end + 1]
