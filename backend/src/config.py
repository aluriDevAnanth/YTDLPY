import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
BUNDLES_DIR = STORAGE_DIR / "bundles"
TEMP_DIR = STORAGE_DIR / "temp"
BIN_DIR = BASE_DIR / "bin"

# Create directories
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
BUNDLES_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)
BIN_DIR.mkdir(parents=True, exist_ok=True)

# Database
DB_FILE = STORAGE_DIR / "app.db"
DB_URL = f"sqlite+aiosqlite:///{DB_FILE}"

# JWT & Crypto Settings
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-jwt-key-change-in-production-ytdlp-gui")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Master 16-byte key for AES-128 index and DB field encryption
MASTER_ENCRYPTION_KEY = os.getenv("MASTER_ENCRYPTION_KEY", "YTDL_PY_SEC_KEY_").encode('utf-8')[:16].ljust(16, b'0')
