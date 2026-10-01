"""Admin router facade exporting submodules for backward compatibility."""

from src.routes.admin import require_admin, router

__all__ = ["router", "require_admin"]
