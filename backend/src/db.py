# Re-export all database functions and engine from modular db package for 100% backward compatibility
from src.db import (
    async_session_maker,
    engine,
    get_session,
    init_db,
)

__all__ = [
    "engine",
    "async_session_maker",
    "init_db",
    "get_session",
]
