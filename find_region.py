import asyncio
import asyncpg
import sys

REGIONS = [
    "ap-southeast-1", # Singapore
    "ap-south-1",     # Mumbai
    "us-east-1",      # N. Virginia
    "us-west-1",      # N. California
    "eu-west-1",      # Ireland
    "eu-central-1",   # Frankfurt
]

async def check():
    password = "amirtha2009%40"
    project = "iaykhpsrmptokiantgcc"
    for r in REGIONS:
        url = f"postgresql://postgres.{project}:{password}@aws-0-{r}.pooler.supabase.com:6543/postgres"
        print(f"Trying region {r}...")
        try:
            conn = await asyncpg.connect(url, timeout=3)
            print(f"SUCCESS in region {r}!")
            await conn.close()
            return
        except Exception as e:
            print(f"FAILED in {r}: {e}")

if __name__ == "__main__":
    asyncio.run(check())
