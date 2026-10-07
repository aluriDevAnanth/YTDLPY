import os
from unittest.mock import patch
from pathlib import Path
import pytest
from src.ffmpeg.paths import get_ffmpeg_path, get_ffprobe_path
import src.config as config

PATH_SCENARIOS = [
    {"index": i, "has_bin": bool(i % 2 == 0), "system_path": f"/usr/bin/tool_{i}" if i % 3 == 0 else None}
    for i in range(10)
]

@pytest.mark.parametrize("scenario", PATH_SCENARIOS)
def test_ffmpeg_probe_paths_10_scenarios(tmp_path, scenario):
    bin_dir = tmp_path / f"bin_{scenario['index']}"
    bin_dir.mkdir(parents=True, exist_ok=True)
    
    ffmpeg_name = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
    ffprobe_name = "ffprobe.exe" if os.name == "nt" else "ffprobe"
    
    if scenario["has_bin"]:
        (bin_dir / ffmpeg_name).write_bytes(b"dummy")
        (bin_dir / ffprobe_name).write_bytes(b"dummy")
        
    with patch("src.ffmpeg.paths.BIN_DIR", bin_dir), \
         patch("shutil.which", return_value=scenario["system_path"]):
        
        ffmpeg_res = get_ffmpeg_path()
        ffprobe_res = get_ffprobe_path()
        
        if scenario["has_bin"]:
            assert str(bin_dir / ffmpeg_name) == ffmpeg_res
            assert str(bin_dir / ffprobe_name) == ffprobe_res
        elif scenario["system_path"]:
            assert scenario["system_path"] == ffmpeg_res
            assert scenario["system_path"] == ffprobe_res
        else:
            assert str(bin_dir / ffmpeg_name) == ffmpeg_res
            assert str(bin_dir / ffprobe_name) == ffprobe_res
