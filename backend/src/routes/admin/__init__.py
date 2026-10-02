"""Aggregated admin router module."""

from fastapi import APIRouter
from src.routes.admin.dependencies import require_admin
from src.routes.admin.metrics import router as metrics_router
from src.routes.admin.settings import router as settings_router
from src.routes.admin.users import router as users_router

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])
router.include_router(metrics_router)
router.include_router(users_router)
router.include_router(settings_router)

__all__ = ["router", "require_admin"]
