# Re-export auth route components from modular routes.auth package for 100% backward compatibility
from src.routes.auth import (
    get_current_user,
    oauth2_scheme,
    router,
)

__all__ = [
    "router",
    "get_current_user",
    "oauth2_scheme",
]
