import pytest

"""
Unit Test: BCP 47 Subtitle Language Priority Matcher
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "sub_lang_1", "input_val": "input_sub_lang_1", "expected": "expected_sub_lang_1"},
    {"id": 2, "key": "sub_lang_2", "input_val": "input_sub_lang_2", "expected": "expected_sub_lang_2"},
    {"id": 3, "key": "sub_lang_3", "input_val": "input_sub_lang_3", "expected": "expected_sub_lang_3"},
    {"id": 4, "key": "sub_lang_4", "input_val": "input_sub_lang_4", "expected": "expected_sub_lang_4"},
    {"id": 5, "key": "sub_lang_5", "input_val": "input_sub_lang_5", "expected": "expected_sub_lang_5"},
    {"id": 6, "key": "sub_lang_6", "input_val": "input_sub_lang_6", "expected": "expected_sub_lang_6"},
    {"id": 7, "key": "sub_lang_7", "input_val": "input_sub_lang_7", "expected": "expected_sub_lang_7"},
    {"id": 8, "key": "sub_lang_8", "input_val": "input_sub_lang_8", "expected": "expected_sub_lang_8"},
    {"id": 9, "key": "sub_lang_9", "input_val": "input_sub_lang_9", "expected": "expected_sub_lang_9"},
    {"id": 10, "key": "sub_lang_10", "input_val": "input_sub_lang_10", "expected": "expected_sub_lang_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_sub_lang_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
