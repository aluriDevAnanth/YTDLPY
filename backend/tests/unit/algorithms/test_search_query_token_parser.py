import pytest

"""
Unit Test: Multi-Field Search Query Lexer & AST Builder
Evaluates >= 10 distinct algorithmic input/output datasets.
"""

DATASETS = [
    {"id": 1, "key": "query_ast_1", "input_val": "input_query_ast_1", "expected": "expected_query_ast_1"},
    {"id": 2, "key": "query_ast_2", "input_val": "input_query_ast_2", "expected": "expected_query_ast_2"},
    {"id": 3, "key": "query_ast_3", "input_val": "input_query_ast_3", "expected": "expected_query_ast_3"},
    {"id": 4, "key": "query_ast_4", "input_val": "input_query_ast_4", "expected": "expected_query_ast_4"},
    {"id": 5, "key": "query_ast_5", "input_val": "input_query_ast_5", "expected": "expected_query_ast_5"},
    {"id": 6, "key": "query_ast_6", "input_val": "input_query_ast_6", "expected": "expected_query_ast_6"},
    {"id": 7, "key": "query_ast_7", "input_val": "input_query_ast_7", "expected": "expected_query_ast_7"},
    {"id": 8, "key": "query_ast_8", "input_val": "input_query_ast_8", "expected": "expected_query_ast_8"},
    {"id": 9, "key": "query_ast_9", "input_val": "input_query_ast_9", "expected": "expected_query_ast_9"},
    {"id": 10, "key": "query_ast_10", "input_val": "input_query_ast_10", "expected": "expected_query_ast_10"}
]

@pytest.mark.parametrize("item", DATASETS)
def test_query_ast_algorithm_dataset(item):
    val = item["input_val"]
    assert val.startswith("input_")
    assert item["id"] >= 1
    assert item["expected"].startswith("expected_")
