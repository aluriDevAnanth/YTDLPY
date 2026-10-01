# Re-export files route and symbols from modular routes.files package for 100% backward compatibility
from src.routes.files import (
    MEDIA_TYPES,
    authenticate_file_access,
    router,
)

__all__ = [
    "router",
    "MEDIA_TYPES",
    "authenticate_file_access",
]
