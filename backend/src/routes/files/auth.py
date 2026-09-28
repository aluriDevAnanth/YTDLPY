from typing import Optional
from fastapi import Request
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.crypto import decode_access_token
from src.models import User


async def authenticate_file_access(
    request: Request, session: AsyncSession
) -> Optional[User]:
    """Helper to authenticate JWT token from Bearer header or URL query param."""
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        token = request.query_params.get("token")
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    result = await session.exec(select(User).where(User.id == user_id))
    return result.first()
