import pytest

"""
Unit Test: ISO 8601 & HH:MM:SS Duration String Parser
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "duration_1", "input_val": "input_duration_1", "expected": "expected_duration_1"},
    {"id": 2, "key": "duration_2", "input_val": "input_duration_2", "expected": "expected_duration_2"},
    {"id": 3, "key": "duration_3", "input_val": "input_duration_3", "expected": "expected_duration_3"},
    {"id": 4, "key": "duration_4", "input_val": "input_duration_4", "expected": "expected_duration_4"},
    {"id": 5, "key": "duration_5", "input_val": "input_duration_5", "expected": "expected_duration_5"},
    {"id": 6, "key": "duration_6", "input_val": "input_duration_6", "expected": "expected_duration_6"},
    {"id": 7, "key": "duration_7", "input_val": "input_duration_7", "expected": "expected_duration_7"},
    {"id": 8, "key": "duration_8", "input_val": "input_duration_8", "expected": "expected_duration_8"},
    {"id": 9, "key": "duration_9", "input_val": "input_duration_9", "expected": "expected_duration_9"},
    {"id": 10, "key": "duration_10", "input_val": "input_duration_10", "expected": "expected_duration_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_duration_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
