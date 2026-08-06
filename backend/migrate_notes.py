import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate_notes():
    print("Migrating notes table on Supabase...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);"))
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS icon VARCHAR(50);"))
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS color_theme VARCHAR(50);"))
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER;"))
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20);"))
            print("Successfully added columns to notes table!")
            
            # create_all handles the new tables note_blocks and note_sources!
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_notes())
