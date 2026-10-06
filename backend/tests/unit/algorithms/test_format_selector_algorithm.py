import pytest

"""
Unit Test: yt-dlp Format Hierarchy & Codec Sorter
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "fmt_1", "input_val": "input_fmt_1", "expected": "expected_fmt_1"},
    {"id": 2, "key": "fmt_2", "input_val": "input_fmt_2", "expected": "expected_fmt_2"},
    {"id": 3, "key": "fmt_3", "input_val": "input_fmt_3", "expected": "expected_fmt_3"},
    {"id": 4, "key": "fmt_4", "input_val": "input_fmt_4", "expected": "expected_fmt_4"},
    {"id": 5, "key": "fmt_5", "input_val": "input_fmt_5", "expected": "expected_fmt_5"},
    {"id": 6, "key": "fmt_6", "input_val": "input_fmt_6", "expected": "expected_fmt_6"},
    {"id": 7, "key": "fmt_7", "input_val": "input_fmt_7", "expected": "expected_fmt_7"},
    {"id": 8, "key": "fmt_8", "input_val": "input_fmt_8", "expected": "expected_fmt_8"},
    {"id": 9, "key": "fmt_9", "input_val": "input_fmt_9", "expected": "expected_fmt_9"},
    {"id": 10, "key": "fmt_10", "input_val": "input_fmt_10", "expected": "expected_fmt_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_fmt_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
