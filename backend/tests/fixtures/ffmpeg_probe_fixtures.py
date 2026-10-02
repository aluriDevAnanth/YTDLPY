"""
Backend Fixture: ffmpeg_probe_fixtures
Provides 10 distinct test datasets for backend unit and integration tests.
"""

DATASETS = [
    {"id": 1, "key": "ffmpeg_probe_fixtures_1", "data": "fixture_data_ffmpeg_probe_fixtures_1"},
    {"id": 2, "key": "ffmpeg_probe_fixtures_2", "data": "fixture_data_ffmpeg_probe_fixtures_2"},
    {"id": 3, "key": "ffmpeg_probe_fixtures_3", "data": "fixture_data_ffmpeg_probe_fixtures_3"},
    {"id": 4, "key": "ffmpeg_probe_fixtures_4", "data": "fixture_data_ffmpeg_probe_fixtures_4"},
    {"id": 5, "key": "ffmpeg_probe_fixtures_5", "data": "fixture_data_ffmpeg_probe_fixtures_5"},
    {"id": 6, "key": "ffmpeg_probe_fixtures_6", "data": "fixture_data_ffmpeg_probe_fixtures_6"},
    {"id": 7, "key": "ffmpeg_probe_fixtures_7", "data": "fixture_data_ffmpeg_probe_fixtures_7"},
    {"id": 8, "key": "ffmpeg_probe_fixtures_8", "data": "fixture_data_ffmpeg_probe_fixtures_8"},
    {"id": 9, "key": "ffmpeg_probe_fixtures_9", "data": "fixture_data_ffmpeg_probe_fixtures_9"},
    {"id": 10, "key": "ffmpeg_probe_fixtures_10", "data": "fixture_data_ffmpeg_probe_fixtures_10"}
]

def get_ffmpeg_probe_fixtures_dataset(index: int = 0):
    return DATASETS[index % len(DATASETS)]
