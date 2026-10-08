"""
10-Dataset Unit Test Suite for Database Session Generator and Isolation.
"""
import pytest
from sqlmodel import select
from src.db.session import async_session_maker, get_session
from src.models import User


@pytest.mark.asyncio
async def test_session_generator_yields_valid_async_session():
    """Verifies that get_session async generator yields active session."""
    session_gen = get_session()
    session = await session_gen.__anext__()
    try:
        assert session is not None
        assert session.is_active is True
    finally:
        await session.close()


@pytest.mark.asyncio
@pytest.mark.parametrize("idx", list(range(10)))
async def test_session_isolation_and_rollback(idx):
    """Verifies that database session handles rollbacks cleanly across 10 iterations."""
    async with async_session_maker() as session:
        temp_user = User(
            id=f"temp-isolation-user-{idx}",
            username=f"isolation_{idx}",
            hashed_password="mock_password",
            role="user",
        )
        session.add(temp_user)
        # Rollback without committing
        await session.rollback()

    async with async_session_maker() as session:
        res = await session.exec(select(User).where(User.id == f"temp-isolation-user-{idx}"))
        assert res.first() is None
