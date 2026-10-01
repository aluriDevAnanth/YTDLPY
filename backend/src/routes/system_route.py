# Re-export system route from modular routes.system package for 100% backward compatibility
from src.routes.system import (
    router,
)

__all__ = [
    "router",
]
