"""
10-Dataset Unit Test Suite for JWT Generation and Decoding.
"""
from datetime import timedelta
import pytest
from tests.fixtures.data_factories import USER_DATASETS
from src.crypto.jwt import create_access_token, decode_access_token


@pytest.mark.parametrize("idx, data", list(enumerate(USER_DATASETS)))
def test_jwt_create_and_decode_datasets(idx, data):
    """Verifies JWT token encoding and decoding across 10 distinct user payloads."""
    payload = {"sub": data["id"], "role": data["role"], "username": data["username"]}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == data["id"]
    assert decoded["role"] == data["role"]
    assert "exp" in decoded


def test_jwt_expired_token():
    """Verifies that expired JWT tokens return None upon decoding."""
    expired_token = create_access_token({"sub": "user_exp"}, expires_delta=timedelta(seconds=-10))
    decoded = decode_access_token(expired_token)
    assert decoded is None


def test_jwt_malformed_token():
    """Verifies that malformed or forged JWT strings return None."""
    assert decode_access_token("invalid.jwt.token") is None
    assert decode_access_token("") is None
