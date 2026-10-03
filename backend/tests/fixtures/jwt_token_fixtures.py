"""
Backend Fixture: jwt_token_fixtures
Provides 10 distinct test datasets for backend unit and integration tests.
"""

DATASETS = [
    {"id": 1, "key": "jwt_token_fixtures_1", "data": "fixture_data_jwt_token_fixtures_1"},
    {"id": 2, "key": "jwt_token_fixtures_2", "data": "fixture_data_jwt_token_fixtures_2"},
    {"id": 3, "key": "jwt_token_fixtures_3", "data": "fixture_data_jwt_token_fixtures_3"},
    {"id": 4, "key": "jwt_token_fixtures_4", "data": "fixture_data_jwt_token_fixtures_4"},
    {"id": 5, "key": "jwt_token_fixtures_5", "data": "fixture_data_jwt_token_fixtures_5"},
    {"id": 6, "key": "jwt_token_fixtures_6", "data": "fixture_data_jwt_token_fixtures_6"},
    {"id": 7, "key": "jwt_token_fixtures_7", "data": "fixture_data_jwt_token_fixtures_7"},
    {"id": 8, "key": "jwt_token_fixtures_8", "data": "fixture_data_jwt_token_fixtures_8"},
    {"id": 9, "key": "jwt_token_fixtures_9", "data": "fixture_data_jwt_token_fixtures_9"},
    {"id": 10, "key": "jwt_token_fixtures_10", "data": "fixture_data_jwt_token_fixtures_10"}
]

def get_jwt_token_fixtures_dataset(index: int = 0):
    return DATASETS[index % len(DATASETS)]
