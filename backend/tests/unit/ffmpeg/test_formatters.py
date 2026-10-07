import pytest
from src.ffmpeg.formatters import format_size, format_eta

SIZE_DATASETS = [
    (0, "0 B"),
    (-50, "0 B"),
    (512, "0.5 KiB"),
    (1024, "1.0 KiB"),
    (1024 * 500, "500.0 KiB"),
    (1024 * 1024, "1.0 MiB"),
    (1024 * 1024 * 15.5, "15.5 MiB"),
    (1024 * 1024 * 1024, "1.0 GiB"),
    (1024 * 1024 * 1024 * 2.5, "2.5 GiB"),
    (1024 * 1024 * 1024 * 100, "100.0 GiB"),
]

@pytest.mark.parametrize("bytes_val, expected", SIZE_DATASETS)
def test_format_size_10_datasets(bytes_val, expected):
    assert format_size(bytes_val) == expected


ETA_DATASETS = [
    (0, "0s"),
    (-10, "0s"),
    (5, "5s"),
    (59, "59s"),
    (60, "1m 0s"),
    (125, "2m 5s"),
    (3599, "59m 59s"),
    (3600, "1h 0m 0s"),
    (3665, "1h 1m 5s"),
    (72000, "20h 0m 0s"),
]

@pytest.mark.parametrize("seconds, expected", ETA_DATASETS)
def test_format_eta_10_datasets(seconds, expected):
    assert format_eta(seconds) == expected
