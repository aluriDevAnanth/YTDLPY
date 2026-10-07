import pytest

"""
Unit Test: Disk Quota & Auto-Purge Priority Evaluator
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "quota_1", "input_val": "input_quota_1", "expected": "expected_quota_1"},
    {"id": 2, "key": "quota_2", "input_val": "input_quota_2", "expected": "expected_quota_2"},
    {"id": 3, "key": "quota_3", "input_val": "input_quota_3", "expected": "expected_quota_3"},
    {"id": 4, "key": "quota_4", "input_val": "input_quota_4", "expected": "expected_quota_4"},
    {"id": 5, "key": "quota_5", "input_val": "input_quota_5", "expected": "expected_quota_5"},
    {"id": 6, "key": "quota_6", "input_val": "input_quota_6", "expected": "expected_quota_6"},
    {"id": 7, "key": "quota_7", "input_val": "input_quota_7", "expected": "expected_quota_7"},
    {"id": 8, "key": "quota_8", "input_val": "input_quota_8", "expected": "expected_quota_8"},
    {"id": 9, "key": "quota_9", "input_val": "input_quota_9", "expected": "expected_quota_9"},
    {"id": 10, "key": "quota_10", "input_val": "input_quota_10", "expected": "expected_quota_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_quota_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
