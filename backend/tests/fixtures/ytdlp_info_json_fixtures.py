"""
Backend Fixture: ytdlp_info_json_fixtures
Provides 10 distinct test datasets for backend unit and integration tests.
"""

DATASETS = [
    {"id": 1, "key": "ytdlp_info_json_fixtures_1", "data": "fixture_data_ytdlp_info_json_fixtures_1"},
    {"id": 2, "key": "ytdlp_info_json_fixtures_2", "data": "fixture_data_ytdlp_info_json_fixtures_2"},
    {"id": 3, "key": "ytdlp_info_json_fixtures_3", "data": "fixture_data_ytdlp_info_json_fixtures_3"},
    {"id": 4, "key": "ytdlp_info_json_fixtures_4", "data": "fixture_data_ytdlp_info_json_fixtures_4"},
    {"id": 5, "key": "ytdlp_info_json_fixtures_5", "data": "fixture_data_ytdlp_info_json_fixtures_5"},
    {"id": 6, "key": "ytdlp_info_json_fixtures_6", "data": "fixture_data_ytdlp_info_json_fixtures_6"},
    {"id": 7, "key": "ytdlp_info_json_fixtures_7", "data": "fixture_data_ytdlp_info_json_fixtures_7"},
    {"id": 8, "key": "ytdlp_info_json_fixtures_8", "data": "fixture_data_ytdlp_info_json_fixtures_8"},
    {"id": 9, "key": "ytdlp_info_json_fixtures_9", "data": "fixture_data_ytdlp_info_json_fixtures_9"},
    {"id": 10, "key": "ytdlp_info_json_fixtures_10", "data": "fixture_data_ytdlp_info_json_fixtures_10"}
]

def get_ytdlp_info_json_fixtures_dataset(index: int = 0):
    return DATASETS[index % len(DATASETS)]
