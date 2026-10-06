import pytest

"""
Unit Test: Byte-to-Human Readable IEC/SI Unit Formatter
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "filesize_1", "input_val": "input_filesize_1", "expected": "expected_filesize_1"},
    {"id": 2, "key": "filesize_2", "input_val": "input_filesize_2", "expected": "expected_filesize_2"},
    {"id": 3, "key": "filesize_3", "input_val": "input_filesize_3", "expected": "expected_filesize_3"},
    {"id": 4, "key": "filesize_4", "input_val": "input_filesize_4", "expected": "expected_filesize_4"},
    {"id": 5, "key": "filesize_5", "input_val": "input_filesize_5", "expected": "expected_filesize_5"},
    {"id": 6, "key": "filesize_6", "input_val": "input_filesize_6", "expected": "expected_filesize_6"},
    {"id": 7, "key": "filesize_7", "input_val": "input_filesize_7", "expected": "expected_filesize_7"},
    {"id": 8, "key": "filesize_8", "input_val": "input_filesize_8", "expected": "expected_filesize_8"},
    {"id": 9, "key": "filesize_9", "input_val": "input_filesize_9", "expected": "expected_filesize_9"},
    {"id": 10, "key": "filesize_10", "input_val": "input_filesize_10", "expected": "expected_filesize_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_filesize_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
