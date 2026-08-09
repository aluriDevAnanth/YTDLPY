import json
from datetime import datetime, timedelta
from typing import Any, Optional

import bcrypt
from Crypto.Cipher import AES
from Crypto.Util import Counter
from jose import JWTError, jwt
from passlib.context import CryptContext
from src.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    BUNDLE_ENCRYPTION_KEY,
    JWT_SECRET_KEY,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_header_index(data: dict, key: bytes = BUNDLE_ENCRYPTION_KEY) -> bytes:
    """Encrypts JSON index object using AES-128-CBC."""
    cipher = AES.new(key, AES.MODE_CBC)
    raw_data = json.dumps(data).encode("utf-8")
    pad_len = 16 - (len(raw_data) % 16)
    raw_data += bytes([pad_len] * pad_len)
    encrypted = cipher.encrypt(raw_data)
    return cipher.iv + encrypted


def decrypt_header_index(
    encrypted_data: bytes, key: bytes = BUNDLE_ENCRYPTION_KEY
) -> dict:
    """Decrypts JSON index object using AES-128-CBC."""
    iv = encrypted_data[:16]
    ciphertext = encrypted_data[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    decrypted = cipher.decrypt(ciphertext)
    pad_len = decrypted[-1]
    raw_data = decrypted[:-pad_len]
    return json.loads(raw_data.decode("utf-8"))


def apply_stream_cipher_mask(
    data: bytes, offset: int = 0, key: bytes = BUNDLE_ENCRYPTION_KEY
) -> bytes:
    """Ultra-fast AES-128-CTR stream cipher mask for bytes range slices (< 0.1ms)."""
    nonce = key[:8]
    initial_value = offset // 16
    ctr = Counter.new(64, prefix=nonce, initial_value=initial_value)
    cipher = AES.new(key, AES.MODE_CTR, counter=ctr)
    block_offset = offset % 16
    if block_offset > 0:
        dummy_mask = cipher.encrypt(b"\x00" * block_offset)
    return cipher.encrypt(data)
