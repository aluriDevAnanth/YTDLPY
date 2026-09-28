"""Aggregated video router module."""

from fastapi import APIRouter
from src.routes.video.control import router as control_router
from src.routes.video.delete import router as delete_router
from src.routes.video.enqueue import router as enqueue_router
from src.routes.video.query import router as query_router
from src.routes.video.storage import router as storage_router

router = APIRouter(prefix="/api", tags=["Videos"])
router.include_router(query_router)
router.include_router(enqueue_router)
router.include_router(control_router)
router.include_router(delete_router)
router.include_router(storage_router)

__all__ = ["router"]
