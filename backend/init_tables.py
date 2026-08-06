import asyncio
from app.core.database import engine, Base
from app.models.note import NoteBlock, NoteSource

async def init_tables():
    print("Creating new tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("Successfully initialized missing tables!")
    except Exception as e:
        print(f"Error during table creation: {e}")

if __name__ == "__main__":
    asyncio.run(init_tables())
