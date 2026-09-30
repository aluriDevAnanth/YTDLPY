import pytest
from src.models import UserSettings, UserSettingsUpdate

SETTINGS_CONTRACT_DATASETS = [
    {"user_id": "u1", "format": "BEST", "cookies_src": "browser", "browser": "chrome", "auto_sub": True},
    {"user_id": "u2", "format": "1080p", "cookies_src": "browser", "browser": "firefox", "auto_sub": False},
    {"user_id": "u3", "format": "720p", "cookies_src": "browser", "browser": "edge", "auto_sub": True},
    {"user_id": "u4", "format": "480p", "cookies_src": "browser", "browser": "brave", "auto_sub": False},
    {"user_id": "u5", "format": "360p", "cookies_src": "file", "browser": "none", "auto_sub": False},
    {"user_id": "u6", "format": "AUDIO_ONLY", "cookies_src": "none", "browser": "none", "auto_sub": True},
    {"user_id": "u7", "format": "BEST", "cookies_src": "browser", "browser": "opera", "auto_sub": True},
    {"user_id": "u8", "format": "1440p", "cookies_src": "browser", "browser": "vivaldi", "auto_sub": False},
    {"user_id": "u9", "format": "4k", "cookies_src": "browser", "browser": "safari", "auto_sub": True},
    {"user_id": "u10", "format": "BEST", "cookies_src": "browser", "browser": "chromium", "auto_sub": False},
]

@pytest.mark.parametrize("dataset", SETTINGS_CONTRACT_DATASETS, ids=[f"set_ds_{i}" for i in range(10)])
def test_user_settings_contract_10_datasets(dataset):
    settings = UserSettings(
        user_id=dataset["user_id"],
        default_format=dataset["format"],
        cookies_source=dataset["cookies_src"],
        cookies_browser=dataset["browser"],
    )
    assert settings.user_id == dataset["user_id"]
    assert settings.default_format == dataset["format"]
    assert settings.cookies_source == dataset["cookies_src"]
    assert settings.cookies_browser == dataset["browser"]

    update = UserSettingsUpdate(
        default_format=dataset["format"],
        cookies_source=dataset["cookies_src"],
        cookies_browser=dataset["browser"],
    )
    dumped = update.model_dump(exclude_unset=True)
    assert dumped["default_format"] == dataset["format"]
    assert dumped["cookies_source"] == dataset["cookies_src"]
