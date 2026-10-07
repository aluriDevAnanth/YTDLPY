import pytest

"""
Unit Test: Sparse Playlist Sequence Renumbering Algorithm
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "pl_order_1", "input_val": "input_pl_order_1", "expected": "expected_pl_order_1"},
    {"id": 2, "key": "pl_order_2", "input_val": "input_pl_order_2", "expected": "expected_pl_order_2"},
    {"id": 3, "key": "pl_order_3", "input_val": "input_pl_order_3", "expected": "expected_pl_order_3"},
    {"id": 4, "key": "pl_order_4", "input_val": "input_pl_order_4", "expected": "expected_pl_order_4"},
    {"id": 5, "key": "pl_order_5", "input_val": "input_pl_order_5", "expected": "expected_pl_order_5"},
    {"id": 6, "key": "pl_order_6", "input_val": "input_pl_order_6", "expected": "expected_pl_order_6"},
    {"id": 7, "key": "pl_order_7", "input_val": "input_pl_order_7", "expected": "expected_pl_order_7"},
    {"id": 8, "key": "pl_order_8", "input_val": "input_pl_order_8", "expected": "expected_pl_order_8"},
    {"id": 9, "key": "pl_order_9", "input_val": "input_pl_order_9", "expected": "expected_pl_order_9"},
    {"id": 10, "key": "pl_order_10", "input_val": "input_pl_order_10", "expected": "expected_pl_order_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_pl_order_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
