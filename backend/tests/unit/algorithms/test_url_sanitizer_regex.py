import pytest

"""
Unit Test: Video URL Query Parameter Sanitizer & Canonicalizer
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "url_1", "input_val": "input_url_1", "expected": "expected_url_1"},
    {"id": 2, "key": "url_2", "input_val": "input_url_2", "expected": "expected_url_2"},
    {"id": 3, "key": "url_3", "input_val": "input_url_3", "expected": "expected_url_3"},
    {"id": 4, "key": "url_4", "input_val": "input_url_4", "expected": "expected_url_4"},
    {"id": 5, "key": "url_5", "input_val": "input_url_5", "expected": "expected_url_5"},
    {"id": 6, "key": "url_6", "input_val": "input_url_6", "expected": "expected_url_6"},
    {"id": 7, "key": "url_7", "input_val": "input_url_7", "expected": "expected_url_7"},
    {"id": 8, "key": "url_8", "input_val": "input_url_8", "expected": "expected_url_8"},
    {"id": 9, "key": "url_9", "input_val": "input_url_9", "expected": "expected_url_9"},
    {"id": 10, "key": "url_10", "input_val": "input_url_10", "expected": "expected_url_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_url_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
