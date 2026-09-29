from fastapi import APIRouter
from .dependencies import get_current_user, oauth2_scheme
from .login import router as login_router
from .me import router as me_router
from .register import router as register_router
from .settings import router as settings_router

router = APIRouter(prefix="/api", tags=["Auth & User"])
router.include_router(login_router)
router.include_router(register_router)
router.include_router(me_router)
router.include_router(settings_router)

__all__ = [
    "router",
    "get_current_user",
    "oauth2_scheme",
]
