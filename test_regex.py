import re

db_url = "postgresql+asyncpg://postgres:amirtha2009%40@db.iaykhpsrmptokiantgcc.supabase.co:5432/postgres"

if "supabase.co" in db_url or "pooler.supabase.com" in db_url:
    db_url = re.sub(r'://postgres:', '://postgres.iaykhpsrmptokiantgcc:', db_url)
    db_url = re.sub(
        r'@(db\.[a-z0-9]+\.supabase\.co|aws-0-[a-z0-9-]+\.pooler\.supabase\.com)(?::\d+)?', 
        '@aws-0-ap-southeast-1.pooler.supabase.com:6543', 
        db_url
    )

print("REWRITTEN URL:", db_url)
