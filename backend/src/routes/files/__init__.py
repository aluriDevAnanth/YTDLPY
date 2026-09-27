from fastapi import APIRouter
from .auth import authenticate_file_access
from .constants import MEDIA_TYPES
from .streaming import router as streaming_router

router = APIRouter(prefix="/api", tags=["Files Streaming"])
router.include_router(streaming_router)

__all__ = [
    "router",
    "MEDIA_TYPES",
    "authenticate_file_access",
]
