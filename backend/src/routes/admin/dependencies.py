"""Administrator authorization dependencies."""

from fastapi import Depends, HTTPException, status
from src.models import User
from src.routes.auth_route import get_current_user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensures the authenticated user possesses the admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user
