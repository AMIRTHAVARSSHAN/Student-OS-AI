import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else ""

# Normalize Postgres dialect for SQLAlchemy 2.0 asyncpg driver
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# On Render / cloud deployments, if DATABASE_URL points to localhost/127.0.0.1 or is invalid, fallback to SQLite
is_cloud = os.getenv("RENDER") or os.getenv("PORT") or os.getenv("RENDER_SERVICE_ID")
if is_cloud and ("localhost" in db_url or "127.0.0.1" in db_url):
    db_url = "sqlite+aiosqlite:///./scholar_os_dev.db"

if not db_url:
    db_url = "sqlite+aiosqlite:///./scholar_os_dev.db"

engine = create_async_engine(
    db_url,
    echo=False,
    future=True
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
