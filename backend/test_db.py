import asyncio
from app.core.database import get_db, engine
from sqlalchemy import text

async def test_conn():
    try:
        async with engine.begin() as conn:
            res = await conn.execute(text("SELECT 1;"))
            print("SUCCESS! DB Connected:", res.scalar())
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(test_conn())
