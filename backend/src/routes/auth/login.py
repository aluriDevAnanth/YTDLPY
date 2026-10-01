from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.crypto import create_access_token, verify_password
from src.db import get_session
from src.models import LoginRequest, Token, User

router = APIRouter()


@router.post("/auth/login", response_model=Token)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.username == req.username))
    user = result.first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return Token(access_token=access_token, token_type="bearer")
