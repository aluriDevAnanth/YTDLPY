import json
from Crypto.Cipher import AES
from Crypto.Util import Counter
from src.config import BUNDLE_ENCRYPTION_KEY


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
        _ = cipher.encrypt(b"\x00" * block_offset)
    return cipher.encrypt(data)
