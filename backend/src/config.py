import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
BUNDLES_DIR = STORAGE_DIR / "bundles"
TEMP_DIR = STORAGE_DIR / "temp"
BIN_DIR = BASE_DIR / "bin"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
BUNDLES_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)
BIN_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = STORAGE_DIR / "app.db"
DB_URL = f"sqlite+aiosqlite:///{DB_FILE}"


class Settings(BaseSettings):
    APP_ENV: str = "development"
    JWT_SECRET_KEY: str = "super-secret-jwt-key-change-in-production-ytdlp-gui"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    BUNDLE_ENCRYPTION_KEY_RAW: str = "YTDL_PY_SEC_KEY_"
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    @property
    def BUNDLE_ENCRYPTION_KEY(self) -> bytes:
        return self.BUNDLE_ENCRYPTION_KEY_RAW.encode("utf-8")[:16].ljust(16, b"0")


settings = Settings()
APP_ENV = settings.APP_ENV
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
BUNDLE_ENCRYPTION_KEY = settings.BUNDLE_ENCRYPTION_KEY
