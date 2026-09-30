# Re-export all crypto functions from modular crypto package for 100% backward compatibility
from src.crypto import (
    apply_stream_cipher_mask,
    create_access_token,
    decode_access_token,
    decrypt_header_index,
    encrypt_header_index,
    get_password_hash,
    verify_password,
)

__all__ = [
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "decode_access_token",
    "encrypt_header_index",
    "decrypt_header_index",
    "apply_stream_cipher_mask",
]
