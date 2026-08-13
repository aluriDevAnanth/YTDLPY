import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from main import app
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.crypto import create_access_token, get_password_hash
from src.db import get_session
from src.models import User, UserSettings

TEST_DB_URL = "sqlite+aiosqlite:///file:testmemdb?mode=memory&cache=shared"
test_engine = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False, "uri": True},
    poolclass=StaticPool,
    echo=False,
    future=True,
)
test_async_session = sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)
import tempfile
from pathlib import Path

_test_temp_bundles = tempfile.TemporaryDirectory()
_test_temp_dir = tempfile.TemporaryDirectory()

import src.config
import src.db
import src.VideoDownloader
import src.cleanup_worker

src.config.BUNDLES_DIR = Path(_test_temp_bundles.name)
src.config.TEMP_DIR = Path(_test_temp_dir.name)
src.cleanup_worker.BUNDLES_DIR = Path(_test_temp_bundles.name)
src.cleanup_worker.TEMP_DIR = Path(_test_temp_dir.name)

src.db.engine = test_engine
src.db.async_session_maker = test_async_session


@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


async def override_get_session():
    async with test_async_session() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def seed_users():
    async with test_async_session() as session:
        admin_user = User(
            id="admin-uuid-1",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin",
        )
        regular_user = User(
            id="user-uuid-1",
            username="testuser",
            hashed_password=get_password_hash("user123"),
            role="user",
        )
        user_two = User(
            id="user-uuid-2",
            username="user2",
            hashed_password=get_password_hash("user123"),
            role="user",
        )
        session.add(admin_user)
        session.add(regular_user)
        session.add(user_two)
        await session.commit()
        s1 = UserSettings(user_id=admin_user.id, default_format="BEST")
        s2 = UserSettings(user_id=regular_user.id, default_format="BESTAUDIO")
        s3 = UserSettings(user_id=user_two.id, default_format="WORST")
        session.add_all([s1, s2, s3])
        await session.commit()
        return {"admin": admin_user, "user1": regular_user, "user2": user_two}


@pytest_asyncio.fixture
async def admin_token(seed_users):
    user = seed_users["admin"]
    return create_access_token({"sub": user.id, "role": user.role})


@pytest_asyncio.fixture
async def user1_token(seed_users):
    user = seed_users["user1"]
    return create_access_token({"sub": user.id, "role": user.role})


@pytest_asyncio.fixture
async def user2_token(seed_users):
    user = seed_users["user2"]
    return create_access_token({"sub": user.id, "role": user.role})
