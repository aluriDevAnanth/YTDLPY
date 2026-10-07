"""
10-Dataset Unit Test Suite for Token and LoginRequest Models.
"""
import pytest
from tests.fixtures.data_factories import USER_DATASETS
from src.models import LoginRequest, Token


@pytest.mark.parametrize("idx, data", list(enumerate(USER_DATASETS)))
def test_login_request_and_token_datasets(idx, data):
    """Verifies LoginRequest and Token models across 10 distinct credential sets."""
    req = LoginRequest(
        username=data["username"],
        password=data["password"],
    )
    assert req.username == data["username"]
    assert req.password == data["password"]

    dummy_token = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_payload_{idx}"
    token_obj = Token(
        access_token=dummy_token,
        token_type="bearer",
    )
    assert token_obj.access_token == dummy_token
    assert token_obj.token_type == "bearer"
