import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

async def check_admin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == 'admin2009@gmail.com'))
        admin = result.scalars().first()
        if admin:
            print(f"Admin found! email: {admin.email}")
            print(f"Password verified against 'admin200968': {verify_password('admin200968', admin.password_hash)}")
            
            # If not verified, let's fix it right here:
            if not verify_password('admin200968', admin.password_hash):
                print("Password was wrong in DB. Updating it now...")
                admin.password_hash = get_password_hash('admin200968')
                await db.commit()
                print("Password updated successfully in DB.")
        else:
            print("Admin user NOT FOUND in database!")

if __name__ == "__main__":
    asyncio.run(check_admin())
