import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from app.core.security import get_password_hash

async def seed_admin():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == "admin2009@gmail.com"))
        admin_user = res.scalars().first()
        
        hashed_pw = get_password_hash("admin200968")
        if not admin_user:
            print("Seeding Admin account: admin2009@gmail.com")
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
            print("Admin account successfully created!")
        else:
            print("Admin already exists. Updating password...")
            admin_user.is_admin = True
            admin_user.password_hash = hashed_pw
            admin_user.onboarding_completed = True
            await db.commit()
            print("Admin account updated.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
