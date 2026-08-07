from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.v1.router import api_router
from app.core.security import get_password_hash
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from sqlalchemy import select

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("scholar_os")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ScholarOS Backend Engine...")
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            is_postgres = "postgresql" in str(engine.url)
            if is_postgres:
                try:
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    await conn.execute(text("ALTER TABLE study_blocks ADD COLUMN IF NOT EXISTS note_id VARCHAR(36);"))
                except Exception as e:
                    logger.warning(f"Postgres extension notice: {e}")
            try:
                await conn.run_sync(Base.metadata.create_all)
            except Exception as e:
                logger.error(f"Error creating tables: {e}")
        logger.info("Database schemas initialized successfully.")
    except Exception as db_err:
        logger.error(f"Database connection notice during startup: {db_err}")

    # Auto-seed & verify ONLY the Admin user account (admin2009@gmail.com / admin200968)
    try:
        async with AsyncSessionLocal() as db:
            try:
                res = await db.execute(select(User).where(User.email == "admin2009@gmail.com"))
                admin_user = res.scalars().first()
                
                hashed_pw = get_password_hash("admin200968")
                if not admin_user:
                    logger.info("Seeding Admin account: admin2009@gmail.com")
                    admin_user = User(
                        email="admin2009@gmail.com",
                        password_hash=hashed_pw,
                        full_name="System Admin",
                        preferred_language="en",
                        subscription_tier="scholar_pro",
                        is_admin=True,
                        onboarding_completed=True,
                        is_active=True
                    )
                    db.add(admin_user)
                    await db.commit()
                    await db.refresh(admin_user)
                    
                    admin_prof = AcademicProfile(
                        user_id=admin_user.id,
                        education_level="professional",
                        field="engineering",
                        specialization="System Administration & AI Control",
                        institution_name="ScholarOS Global Control Center"
                    )
                    db.add(admin_prof)
                    await db.commit()
                else:
                    admin_user.is_admin = True
                    admin_user.password_hash = hashed_pw
                    admin_user.onboarding_completed = True
                    await db.commit()
                    logger.info("Admin account admin2009@gmail.com verified and updated.")

            except Exception as e:
                logger.error(f"Error initializing admin user: {e}")
    except Exception as err:
        logger.error(f"Session initialization notice: {err}")

    yield
    logger.info("Shutting down ScholarOS Backend Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration supporting Vercel deployment origins and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
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
