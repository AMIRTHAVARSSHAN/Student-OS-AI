from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("scholar_os")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ScholarOS Backend Engine...")
    async with engine.begin() as conn:
        from sqlalchemy import text
        is_postgres = "postgresql" in str(engine.url)
        if is_postgres:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception as e:
                logger.warning(f"Postgres extension notice: {e}")
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
    logger.info("Database schemas initialized.")
    yield
    logger.info("Shutting down ScholarOS Backend Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to ScholarOS AI API",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
