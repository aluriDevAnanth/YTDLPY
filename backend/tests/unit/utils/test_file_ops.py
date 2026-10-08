import pytest
from pathlib import Path
from src.utils.file_ops import safe_copy_file, safe_move_file, safe_rmtree

FILE_OP_DATASETS = [{"filename": f"file_{i}.tmp", "content": b"x" * (i * 100 + 1)} for i in range(10)]

@pytest.mark.parametrize("dataset", FILE_OP_DATASETS, ids=[f"fop_{i}" for i in range(10)])
def test_file_operations_10_datasets(tmp_path, dataset):
    src_file = tmp_path / dataset["filename"]
    src_file.write_bytes(dataset["content"])
    assert src_file.exists()
    
    dst_file = tmp_path / f"copied_{dataset['filename']}"
    safe_copy_file(src_file, dst_file)
    assert dst_file.exists()
    assert dst_file.stat().st_size == len(dataset["content"])
