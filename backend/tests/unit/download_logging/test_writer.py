import json
import pytest
from pathlib import Path
from src.download_logging.writer import write_ndjson_entry

WRITER_DATASETS = [
    {"index": i, "payload": {"str_key": f"value_{i}", "num_key": i * 10, "nested": {"sub": f"nested_{i}"}, "unicode": f"unicode_chars_🔥_🚀_{i}"}}
    for i in range(10)
]

@pytest.mark.parametrize("dataset", WRITER_DATASETS)
def test_write_ndjson_entry_10_datasets(tmp_path, dataset):
    target_file = tmp_path / "subdir" / f"log_{dataset['index']}.ndjson"
    
    write_ndjson_entry(target_file, dataset["payload"])
    assert target_file.exists()
    
    content = target_file.read_text(encoding="utf-8").strip()
    parsed = json.loads(content)
    assert parsed == dataset["payload"]
    
    # Append a second line
    write_ndjson_entry(target_file, {"append": True, "id": dataset["index"]})
    lines = target_file.read_text(encoding="utf-8").strip().split("\n")
    assert len(lines) == 2
    assert json.loads(lines[1])["append"] is True
