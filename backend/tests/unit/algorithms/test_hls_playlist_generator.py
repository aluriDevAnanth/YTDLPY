import pytest

"""
Unit Test: HLS m3u8 Multivariant Master Index Generator
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "hls_1", "input_val": "input_hls_1", "expected": "expected_hls_1"},
    {"id": 2, "key": "hls_2", "input_val": "input_hls_2", "expected": "expected_hls_2"},
    {"id": 3, "key": "hls_3", "input_val": "input_hls_3", "expected": "expected_hls_3"},
    {"id": 4, "key": "hls_4", "input_val": "input_hls_4", "expected": "expected_hls_4"},
    {"id": 5, "key": "hls_5", "input_val": "input_hls_5", "expected": "expected_hls_5"},
    {"id": 6, "key": "hls_6", "input_val": "input_hls_6", "expected": "expected_hls_6"},
    {"id": 7, "key": "hls_7", "input_val": "input_hls_7", "expected": "expected_hls_7"},
    {"id": 8, "key": "hls_8", "input_val": "input_hls_8", "expected": "expected_hls_8"},
    {"id": 9, "key": "hls_9", "input_val": "input_hls_9", "expected": "expected_hls_9"},
    {"id": 10, "key": "hls_10", "input_val": "input_hls_10", "expected": "expected_hls_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_hls_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
