"""
Mock generator for ffmpeg and ffprobe subprocess commands.
"""
from unittest.mock import MagicMock


def create_mock_ffmpeg_proc(return_code: int = 0, stderr_lines: list[bytes] = None):
    mock_proc = MagicMock()
    mock_proc.returncode = return_code
    mock_proc.stderr = stderr_lines or []
    mock_proc.wait.return_value = return_code
    mock_proc.communicate.return_value = (b"", b"")
    return mock_proc
