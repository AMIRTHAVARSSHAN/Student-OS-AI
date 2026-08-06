import os
import re
import ssl
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

# Convert Direct Supabase Host (db.[ref].supabase.co:5432) -> Exact verified Supabase IPv4 Pooler Host for Render
supabase_direct_match = re.search(
    r'postgresql\+asyncpg://([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?/(.+)', 
    db_url
)
if supabase_direct_match:
    user, password, ref, dbname = supabase_direct_match.groups()
    if not user.endswith(f".{ref}"):
        pooler_user = f"{user}.{ref}"
    else:
        pooler_user = user
    
    # Use verified Supabase Pooler region host (ap-southeast-1)
    db_url = f"postgresql+asyncpg://{pooler_user}:{password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/{dbname}"

# Fallback to local SQLite if no valid database URL is specified
if not db_url:
    db_url = "sqlite+aiosqlite:///./scholar_os_dev.db"

connect_args = {}
engine_kwargs = {
    "echo": False,
    "future": True,
}

if "postgresql+asyncpg" in db_url:
    # Supabase Cloud PostgreSQL SSL Context
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    connect_args = {
        "ssl": ssl_ctx,
        "command_timeout": 15,
        "server_settings": {"jit": "off"}
    }
    # Disable prepared statement cache for PgBouncer / Supavisor pooler compatibility
    if "pooler.supabase.com" in db_url or ":6543" in db_url:
        connect_args["prepared_statement_cache_size"] = 0

    engine_kwargs["connect_args"] = connect_args
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_async_engine(db_url, **engine_kwargs)

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
