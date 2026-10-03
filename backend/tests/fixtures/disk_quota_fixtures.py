"""
Backend Fixture: disk_quota_fixtures
Provides 10 distinct test datasets for backend unit and integration tests.
"""

DATASETS = [
    {"id": 1, "key": "disk_quota_fixtures_1", "data": "fixture_data_disk_quota_fixtures_1"},
    {"id": 2, "key": "disk_quota_fixtures_2", "data": "fixture_data_disk_quota_fixtures_2"},
    {"id": 3, "key": "disk_quota_fixtures_3", "data": "fixture_data_disk_quota_fixtures_3"},
    {"id": 4, "key": "disk_quota_fixtures_4", "data": "fixture_data_disk_quota_fixtures_4"},
    {"id": 5, "key": "disk_quota_fixtures_5", "data": "fixture_data_disk_quota_fixtures_5"},
    {"id": 6, "key": "disk_quota_fixtures_6", "data": "fixture_data_disk_quota_fixtures_6"},
    {"id": 7, "key": "disk_quota_fixtures_7", "data": "fixture_data_disk_quota_fixtures_7"},
    {"id": 8, "key": "disk_quota_fixtures_8", "data": "fixture_data_disk_quota_fixtures_8"},
    {"id": 9, "key": "disk_quota_fixtures_9", "data": "fixture_data_disk_quota_fixtures_9"},
    {"id": 10, "key": "disk_quota_fixtures_10", "data": "fixture_data_disk_quota_fixtures_10"}
]

def get_disk_quota_fixtures_dataset(index: int = 0):
    return DATASETS[index % len(DATASETS)]
