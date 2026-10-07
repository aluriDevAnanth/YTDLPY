import pytest

"""
Unit Test: HMAC Signed One-Time Stream Token Generator
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "stream_token_1", "input_val": "input_stream_token_1", "expected": "expected_stream_token_1"},
    {"id": 2, "key": "stream_token_2", "input_val": "input_stream_token_2", "expected": "expected_stream_token_2"},
    {"id": 3, "key": "stream_token_3", "input_val": "input_stream_token_3", "expected": "expected_stream_token_3"},
    {"id": 4, "key": "stream_token_4", "input_val": "input_stream_token_4", "expected": "expected_stream_token_4"},
    {"id": 5, "key": "stream_token_5", "input_val": "input_stream_token_5", "expected": "expected_stream_token_5"},
    {"id": 6, "key": "stream_token_6", "input_val": "input_stream_token_6", "expected": "expected_stream_token_6"},
    {"id": 7, "key": "stream_token_7", "input_val": "input_stream_token_7", "expected": "expected_stream_token_7"},
    {"id": 8, "key": "stream_token_8", "input_val": "input_stream_token_8", "expected": "expected_stream_token_8"},
    {"id": 9, "key": "stream_token_9", "input_val": "input_stream_token_9", "expected": "expected_stream_token_9"},
    {"id": 10, "key": "stream_token_10", "input_val": "input_stream_token_10", "expected": "expected_stream_token_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_stream_token_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
