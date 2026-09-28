from fastapi import APIRouter
from .browsers import router as browsers_router
from .cookies import router as cookies_router

router = APIRouter(prefix="/api", tags=["System"])
router.include_router(browsers_router)
router.include_router(cookies_router)

__all__ = [
    "router",
]
