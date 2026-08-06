import os
import re
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# 1. Prefer SUPABASE_DB_URL if present, otherwise DATABASE_URL
raw_url = settings.SUPABASE_DB_URL.strip() or settings.DATABASE_URL.strip()

db_url = raw_url

# Normalize Postgres dialect for SQLAlchemy 2.0 asyncpg driver
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Clean up sslmode parameter for asyncpg compatibility if present in query string
if "postgresql+asyncpg" in db_url and "sslmode=" in db_url:
    db_url = re.sub(r'[?&]sslmode=[^&]+', '', db_url)

# Fallback to local SQLite if no valid database URL is specified
if not db_url or db_url == "sqlite+aiosqlite:///./scholar_os_dev.db":
    # On cloud servers like Render, warn if using local SQLite
    is_cloud = os.getenv("RENDER") or os.getenv("PORT") or os.getenv("RENDER_SERVICE_ID")
    db_url = "sqlite+aiosqlite:///./scholar_os_dev.db"

connect_args = {}
if "postgresql+asyncpg" in db_url:
    # Disable SSL requirement enforcement in asyncpg connection args for cloud poolers if needed
    connect_args = {"ssl": False}

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args if "postgresql+asyncpg" in db_url else {}
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

AsyncSessionLocal = async_session_factory

async def get_db() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
