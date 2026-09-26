import json
from pathlib import Path
from typing import Any, Dict


def write_ndjson_entry(log_file_path: Path, entry: Dict[str, Any]) -> None:
    """Appends a Newline-Delimited JSON entry to file."""
    try:
        line = json.dumps(entry, ensure_ascii=False) + "\n"
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception as e:
        print(f"[DownloadLogger Error] Failed to write log entry: {e}")
