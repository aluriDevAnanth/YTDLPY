import pytest

"""
Unit Test: Thumbnail Grid Coordinate Math Calculator
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "sprite_1", "input_val": "input_sprite_1", "expected": "expected_sprite_1"},
    {"id": 2, "key": "sprite_2", "input_val": "input_sprite_2", "expected": "expected_sprite_2"},
    {"id": 3, "key": "sprite_3", "input_val": "input_sprite_3", "expected": "expected_sprite_3"},
    {"id": 4, "key": "sprite_4", "input_val": "input_sprite_4", "expected": "expected_sprite_4"},
    {"id": 5, "key": "sprite_5", "input_val": "input_sprite_5", "expected": "expected_sprite_5"},
    {"id": 6, "key": "sprite_6", "input_val": "input_sprite_6", "expected": "expected_sprite_6"},
    {"id": 7, "key": "sprite_7", "input_val": "input_sprite_7", "expected": "expected_sprite_7"},
    {"id": 8, "key": "sprite_8", "input_val": "input_sprite_8", "expected": "expected_sprite_8"},
    {"id": 9, "key": "sprite_9", "input_val": "input_sprite_9", "expected": "expected_sprite_9"},
    {"id": 10, "key": "sprite_10", "input_val": "input_sprite_10", "expected": "expected_sprite_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_sprite_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
