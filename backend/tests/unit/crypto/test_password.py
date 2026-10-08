"""
10-Dataset Unit Test Suite for Password Hashing and Verification.
"""
import pytest
from tests.fixtures.data_factories import USER_DATASETS
from src.crypto.password import get_password_hash, verify_password


@pytest.mark.parametrize("idx, data", list(enumerate(USER_DATASETS)))
def test_password_hashing_and_verification_datasets(idx, data):
    """Verifies that password hashing produces valid bcrypt hashes and verifies accurately."""
    pwd = data["password"]
    hashed = get_password_hash(pwd)
    assert hashed.startswith("$2b$")
    assert verify_password(pwd, hashed) is True
    assert verify_password(pwd + "_wrong", hashed) is False
    assert verify_password("", hashed) is False


def test_password_long_truncation_safety():
    """Verifies bcrypt 72-byte safe truncation behavior for passwords longer than 72 bytes."""
    long_pass = "secure_enterprise_password_" * 10
    hashed = get_password_hash(long_pass)
    assert verify_password(long_pass, hashed) is True


def test_verify_password_invalid_hash():
    """Verifies error resilience when given corrupted hash strings."""
    assert verify_password("test", "not_a_valid_bcrypt_hash") is False
    assert verify_password("test", "") is False
