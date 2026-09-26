import os
import secrets
from sqlalchemy import text
from sqlmodel import SQLModel, select
from src.crypto import get_password_hash
from src.logger import log_success
from src.models import User, UserSettings
from .session import async_session_maker, engine


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

        for col_name, col_type in [
            ("default_view_mode", "TEXT DEFAULT 'grid'"),
            ("cookies_source", "TEXT DEFAULT 'inherit'"),
            ("cookies_browser", "TEXT DEFAULT 'firefox'"),
            ("cookies_profile", "TEXT DEFAULT NULL"),
            ("cookies_txt", "TEXT DEFAULT NULL"),
            ("auth_storage_mode", "TEXT DEFAULT 'local'"),
        ]:
            try:
                await conn.execute(
                    text(f"ALTER TABLE usersettings ADD COLUMN {col_name} {col_type}")
                )
            except Exception:
                pass
        try:
            await conn.execute(
                text(
                    "UPDATE usersettings SET cookies_source = 'browser', cookies_browser = 'firefox' WHERE cookies_source = 'none' OR cookies_source IS NULL OR cookies_browser = 'chrome' OR cookies_browser = 'edge'"
                )
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
                cookies_source="browser",
                cookies_browser="firefox",
            )
            session.add(admin_settings)
            await session.commit()
            log_success(
                "Initial Admin account bootstrapped: username='admin', password='admin123'"
            )
