from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config import DB_URL
from src.crypto import get_password_hash
from src.logger import log_success
from src.models import User, UserSettings

engine = create_async_engine(DB_URL, echo=False, future=True)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        from sqlalchemy import text

        for col_name, col_type in [
            ("cookies_source", "TEXT DEFAULT 'none'"),
            ("cookies_browser", "TEXT DEFAULT 'chrome'"),
            ("cookies_txt", "TEXT DEFAULT NULL"),
        ]:
            try:
                await conn.execute(
                    text(f"ALTER TABLE usersettings ADD COLUMN {col_name} {col_type}")
                )
            except Exception:
                pass
        try:
            await conn.execute(
                text("ALTER TABLE video ADD COLUMN bundleId TEXT DEFAULT ''")
            )
        except Exception:
            pass
    async with async_session_maker() as session:
        statement = select(User)
        result = await session.exec(statement)
        users = result.all()
        if not users:
            import os
            import secrets

            env_mode = os.getenv("APP_ENV", "development").lower()
            if env_mode in ["production", "prod"]:
                admin_password = secrets.token_urlsafe(16)
                log_success(
                    f"🔒 PRODUCTION MODE DETECTED: Created default 'admin' account with password: {admin_password}"
                )
            else:
                admin_password = "admin123"
                log_success(
                    "🛠️ DEV MODE DETECTED: Created default 'admin' account with password: admin123"
                )
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash(admin_password),
                role="admin",
            )
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            admin_settings = UserSettings(
                user_id=admin_user.id,
                default_format="BEST",
                max_concurrent_downloads=3,
                auto_generate_vtt=True,
                theme="dark",
            )
            session.add(admin_settings)
            await session.commit()
            log_success(
                "Initial Admin account bootstrapped: username='admin', password='admin123'"
            )


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
