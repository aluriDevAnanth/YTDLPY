from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.crypto import create_access_token, get_password_hash
from src.db import get_session
from src.models import LoginRequest, Token, User, UserSettings
from src.sio import send_admin_event

router = APIRouter()


@router.post("/auth/register", response_model=Token)
async def register(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.username == req.username))
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already registered. Please choose another username or sign in.",
        )
    new_user = User(
        username=req.username,
        hashed_password=get_password_hash(req.password),
        role="user",
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    settings = UserSettings(user_id=new_user.id)
    session.add(settings)
    await session.commit()
    await send_admin_event("admin_stats_update")
    access_token = create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return Token(access_token=access_token, token_type="bearer")
