"""
10-Dataset Unit Test Suite for Playlist Models.
"""
import pytest
from tests.fixtures.data_factories import PLAYLIST_DATASETS
from src.models import (
    Playlist,
    PlaylistCreate,
    PlaylistOut,
    PlaylistVideoLink,
)


@pytest.mark.parametrize("idx, data", list(enumerate(PLAYLIST_DATASETS)))
def test_playlist_model_instantiation(idx, data):
    """Verifies that Playlist model instantiates correctly for 10 distinct playlist datasets."""
    playlist = Playlist(
        id=data["id"],
        public_id=data["public_id"],
        userId=data["userId"],
        name=data["name"],
        description=data["description"],
        is_default=data["is_default"],
    )
    assert playlist.id == data["id"]
    assert playlist.public_id == data["public_id"]
    assert playlist.name == data["name"]
    assert playlist.is_default == data["is_default"]


@pytest.mark.parametrize("idx, data", list(enumerate(PLAYLIST_DATASETS)))
def test_playlist_create_and_out_serialization(idx, data):
    """Verifies PlaylistCreate and PlaylistOut serialization across 10 datasets."""
    create_dto = PlaylistCreate(
        name=data["name"],
        description=data["description"],
    )
    assert create_dto.name == data["name"]

    pl_out = PlaylistOut(
        id=data["id"],
        public_id=data["public_id"],
        userId=data["userId"],
        name=data["name"],
        description=data["description"],
        is_default=data["is_default"],
        created_at=data and user_date(),
        video_count=idx * 2,
        video_ids=[f"vid-00{i+1}" for i in range(idx)],
    )
    assert pl_out.id == data["id"]
    assert pl_out.video_count == idx * 2
    assert len(pl_out.video_ids) == idx


def user_date():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)

