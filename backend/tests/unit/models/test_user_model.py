"""
10-Dataset Unit Test Suite for User and UserSettings Models.
"""
import pytest
from tests.fixtures.data_factories import USER_DATASETS
from src.models import (
    User,
    UserCreate,
    UserOut,
    UserSettings,
    UserSettingsUpdate,
    UserUpdate,
)


@pytest.mark.parametrize("idx, data", list(enumerate(USER_DATASETS)))
def test_user_model_instantiation(idx, data):
    """Verifies that User model instantiates accurately for 10 distinct user datasets."""
    user = User(
        id=data["id"],
        username=data["username"],
        hashed_password="mock_hashed_pass_" + str(idx),
        role=data["role"],
    )
    assert user.id == data["id"]
    assert user.username == data["username"]
    assert user.role == data["role"]
    assert user.created_at is not None


@pytest.mark.parametrize("idx, data", list(enumerate(USER_DATASETS)))
def test_user_create_and_out_serialization(idx, data):
    """Verifies UserCreate schema and UserOut serialization across 10 datasets."""
    create_dto = UserCreate(
        username=data["username"],
        password=data["password"],
        role=data["role"],
    )
    assert create_dto.username == data["username"]
    assert create_dto.password == data["password"]

    settings = UserSettings(user_id=data["id"])
    user_out = UserOut(
        id=data["id"],
        username=data["username"],
        role=data["role"],
        created_at=settings.user_id and user_out_date(),
        settings=settings,
    )
    assert user_out.id == data["id"]
    assert user_out.settings.user_id == data["id"]


def user_out_date():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)

