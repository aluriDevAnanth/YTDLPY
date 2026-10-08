import pytest
from src.cookies.detector import detect_installed_browsers, get_available_browsers, get_installed_browser_ids

COOKIE_DETECTOR_DATASETS = [{"dataset_id": f"ds_{i}", "mock_platform": "win32"} for i in range(10)]

@pytest.mark.parametrize("dataset", COOKIE_DETECTOR_DATASETS, ids=[f"det_{i}" for i in range(10)])
def test_detect_installed_browsers_10_datasets(dataset):
    browsers = detect_installed_browsers()
    assert isinstance(browsers, list)
    for b in browsers:
        assert isinstance(b, dict)
        assert "id" in b
        assert "name" in b
        assert "installed" in b
