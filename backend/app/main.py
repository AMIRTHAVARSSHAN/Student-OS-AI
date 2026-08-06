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
from app.models.note import Note
from app.models.subject import Subject
from sqlalchemy import select

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

    # Auto-seed & verify Admin user account (admin2009@gmail.com / admin200968)
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

            # Seed sample registered students so admin can view and inspect real multi-user data
            sample_students = [
                {
                    "email": "rahul.sharma@gmail.com",
                    "full_name": "Rahul Sharma",
                    "inst": "IIT Madras",
                    "field": "engineering",
                    "subjs": ["Python Programming", "Data Structures", "Digital Electronics"]
                },
                {
                    "email": "priya.venkat@gmail.com",
                    "full_name": "Priya Venkat",
                    "inst": "Anna University",
                    "field": "medical",
                    "subjs": ["Human Anatomy", "Biochemistry", "Pathology"]
                },
                {
                    "email": "alex.morgan@gmail.com",
                    "full_name": "Alex Morgan",
                    "inst": "Stanford University",
                    "field": "science",
                    "subjs": ["Machine Learning", "Linear Algebra", "Computer Vision"]
                }
            ]

            for s in sample_students:
                s_res = await db.execute(select(User).where(User.email == s["email"]))
                st_user = s_res.scalars().first()
                if not st_user:
                    logger.info(f"Seeding demo student: {s['email']}")
                    st_user = User(
                        email=s["email"],
                        password_hash=get_password_hash("student123"),
                        full_name=s["full_name"],
                        preferred_language="en",
                        subscription_tier="free",
                        is_admin=False,
                        onboarding_completed=True,
                        is_active=True
                    )
                    db.add(st_user)
                    await db.commit()
                    await db.refresh(st_user)

                    st_prof = AcademicProfile(
                        user_id=st_user.id,
                        education_level="college",
                        field=s["field"],
                        specialization="Computer Science & Engineering",
                        institution_name=s["inst"]
                    )
                    db.add(st_prof)

                    for subj_name in s["subjs"]:
                        subj_obj = Subject(user_id=st_user.id, name=subj_name)
                        db.add(subj_obj)

                    # Add sample note for student
                    sample_note = Note(
                        user_id=st_user.id,
                        title=f"{s['subjs'][0]} - Core Foundations & Unit 1",
                        content=f"# {s['subjs'][0]}\n\nOverview of foundational concepts and algorithmic complexity analysis for undergraduate examinations.",
                        plain_text=f"Overview of foundational concepts for {s['subjs'][0]}",
                        source="ai-generated",
                        word_count=120
                    )
                    db.add(sample_note)
                    await db.commit()

        except Exception as e:
            logger.error(f"Error seeding demo users: {e}")

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
