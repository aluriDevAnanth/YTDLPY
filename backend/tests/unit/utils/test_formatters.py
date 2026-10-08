import pytest
from src.utils.formatters import format_size, format_duration, format_eta, format_vtt_timestamp

FORMATTER_DATASETS = [
    {"bytes": 0, "seconds": 0, "exp_size": "0 MiB", "exp_dur": "00:00"},
    {"bytes": 1024, "seconds": 65, "exp_size": "1.0 KiB", "exp_dur": "01:05"},
    {"bytes": 1024 * 1024, "seconds": 3600, "exp_size": "1.0 MiB", "exp_dur": "1:00:00"},
    {"bytes": 500 * 1024 * 1024, "seconds": 7245, "exp_size": "500.0 MiB", "exp_dur": "2:00:45"},
    {"bytes": 1024 * 1024 * 1024, "seconds": 120, "exp_size": "1.0 GiB", "exp_dur": "02:00"},
    {"bytes": 5 * 1024 * 1024 * 1024, "seconds": 540, "exp_size": "5.0 GiB", "exp_dur": "09:00"},
    {"bytes": 512, "seconds": 15, "exp_size": "0.5 KiB", "exp_dur": "00:15"},
    {"bytes": 2048, "seconds": 90, "exp_size": "2.0 KiB", "exp_dur": "01:30"},
    {"bytes": 10000000, "seconds": 500, "exp_size": "9.5 MiB", "exp_dur": "08:20"},
    {"bytes": 50000000000, "seconds": 86400, "exp_size": "46.6 GiB", "exp_dur": "24:00:00"},
]

@pytest.mark.parametrize("dataset", FORMATTER_DATASETS, ids=[f"fmt_{i}" for i in range(10)])
def test_formatters_10_datasets(dataset):
    s_res = format_size(dataset["bytes"])
    d_res = format_duration(dataset["seconds"])
    eta_res = format_eta(dataset["seconds"])
    vtt_res = format_vtt_timestamp(float(dataset["seconds"]))
    assert isinstance(s_res, str)
    assert isinstance(d_res, str)
    assert isinstance(eta_res, str)
    assert isinstance(vtt_res, str)
