import pytest
from pydantic import BaseModel
from src.models import (
    User,
    UserOut,
    UserSettings,
    UserSettingsUpdate,
    LoginRequest,
    Token,
    Video,
    Playlist,
)

SCHEMA_CONTRACT_DATASETS = [
    {
        "index": i,
        "user_id": f"contract_usr_{i}",
        "username": f"contract_user_{i}",
        "video_id": f"contract_vid_{i}",
        "playlist_id": f"contract_pl_{i}",
    }
    for i in range(10)
]

@pytest.mark.parametrize("dataset", SCHEMA_CONTRACT_DATASETS, ids=[f"schema_ds_{i}" for i in range(10)])
def test_pydantic_sqlmodel_schema_contracts_10_datasets(dataset):
    # 1. LoginRequest & Token contract
    login_req = LoginRequest(username=dataset["username"], password="Password123!")
    assert login_req.username == dataset["username"]
    assert login_req.password == "Password123!"

    token = Token(access_token="mock_token_jwt", token_type="bearer")
    assert token.access_token == "mock_token_jwt"
    assert token.token_type == "bearer"

    # 2. UserSettings contract
    settings = UserSettings(
        user_id=dataset["user_id"],
        default_format="BEST",
        cookies_source="browser",
        cookies_browser="chrome",
    )
    assert settings.user_id == dataset["user_id"]
    assert settings.default_format == "BEST"

    # 3. UserOut contract
    from datetime import datetime, timezone
    user_out = UserOut(
        id=dataset["user_id"],
        username=dataset["username"],
        role="user",
        created_at=datetime.now(timezone.utc),
        settings=settings,
    )
    assert user_out.id == dataset["user_id"]
    assert user_out.username == dataset["username"]
    assert user_out.settings.default_format == "BEST"

    # 4. Video contract
    video = Video(
        id=dataset["video_id"],
        userId=dataset["user_id"],
        url=f"https://www.youtube.com/watch?v={dataset['video_id']}",
        title=f"Contract Video #{dataset['index']}",
        downloadStatus="completed",
        downloaded=True,
    )
    assert video.id == dataset["video_id"]
    assert video.userId == dataset["user_id"]
    assert video.downloadStatus == "completed"

    # 5. Playlist contract
    playlist = Playlist(
        id=dataset["playlist_id"],
        name=f"Contract Playlist #{dataset['index']}",
        userId=dataset["user_id"],
    )
    assert playlist.id == dataset["playlist_id"]
    assert playlist.userId == dataset["user_id"]
