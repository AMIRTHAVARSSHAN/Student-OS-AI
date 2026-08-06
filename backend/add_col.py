import asyncio
from sqlalchemy import text
from app.core.database import engine

async def add_col():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255);"))
        print("Column added!")

asyncio.run(add_col())
