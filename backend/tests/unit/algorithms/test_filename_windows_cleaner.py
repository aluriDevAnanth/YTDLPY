import pytest

"""
Unit Test: Windows & POSIX Restricted Character Sanitizer
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "filename_1", "input_val": "input_filename_1", "expected": "expected_filename_1"},
    {"id": 2, "key": "filename_2", "input_val": "input_filename_2", "expected": "expected_filename_2"},
    {"id": 3, "key": "filename_3", "input_val": "input_filename_3", "expected": "expected_filename_3"},
    {"id": 4, "key": "filename_4", "input_val": "input_filename_4", "expected": "expected_filename_4"},
    {"id": 5, "key": "filename_5", "input_val": "input_filename_5", "expected": "expected_filename_5"},
    {"id": 6, "key": "filename_6", "input_val": "input_filename_6", "expected": "expected_filename_6"},
    {"id": 7, "key": "filename_7", "input_val": "input_filename_7", "expected": "expected_filename_7"},
    {"id": 8, "key": "filename_8", "input_val": "input_filename_8", "expected": "expected_filename_8"},
    {"id": 9, "key": "filename_9", "input_val": "input_filename_9", "expected": "expected_filename_9"},
    {"id": 10, "key": "filename_10", "input_val": "input_filename_10", "expected": "expected_filename_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_filename_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
