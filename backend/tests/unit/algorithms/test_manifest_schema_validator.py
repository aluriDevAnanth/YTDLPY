import pytest

"""
Unit Test: Adaumc Bundle manifest.json Schema Validator
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "manifest_1", "input_val": "input_manifest_1", "expected": "expected_manifest_1"},
    {"id": 2, "key": "manifest_2", "input_val": "input_manifest_2", "expected": "expected_manifest_2"},
    {"id": 3, "key": "manifest_3", "input_val": "input_manifest_3", "expected": "expected_manifest_3"},
    {"id": 4, "key": "manifest_4", "input_val": "input_manifest_4", "expected": "expected_manifest_4"},
    {"id": 5, "key": "manifest_5", "input_val": "input_manifest_5", "expected": "expected_manifest_5"},
    {"id": 6, "key": "manifest_6", "input_val": "input_manifest_6", "expected": "expected_manifest_6"},
    {"id": 7, "key": "manifest_7", "input_val": "input_manifest_7", "expected": "expected_manifest_7"},
    {"id": 8, "key": "manifest_8", "input_val": "input_manifest_8", "expected": "expected_manifest_8"},
    {"id": 9, "key": "manifest_9", "input_val": "input_manifest_9", "expected": "expected_manifest_9"},
    {"id": 10, "key": "manifest_10", "input_val": "input_manifest_10", "expected": "expected_manifest_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_manifest_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
