import pytest
from src.ffmpeg_manager import format_size, format_eta

def test_format_size():
    assert format_size(0) == "0 B"
    assert format_size(512) == "0.5 KiB"
    assert format_size(1024 * 500) == "500.0 KiB"
    assert format_size(1024 * 1024 * 15.5) == "15.5 MiB"
    assert format_size(1024 * 1024 * 1024 * 2.1) == "2.1 GiB"

def test_format_eta():
    assert format_eta(0) == "0s"
    assert format_eta(45) == "45s"
    assert format_eta(125) == "2m 5s"
    assert format_eta(3665) == "1h 1m 5s"
