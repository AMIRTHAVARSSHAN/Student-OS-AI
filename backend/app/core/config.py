from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScholarOS"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")
    
    # Database & Cache (Supabase PostgreSQL / SQLite)
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres.iaykhpsrmptokiantgcc:amirtha2009%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres")
    SUPABASE_DB_URL: str = Field(default="postgresql+asyncpg://postgres.iaykhpsrmptokiantgcc:amirtha2009%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres")
    SUPABASE_URL: str = Field(default="https://iaykhpsrmptokiantgcc.supabase.co")
    SUPABASE_PUBLISHABLE_KEY: str = Field(default="sb_publishable_FcNSpk_X12a3e9rC0kqQjg_jIrjd7Q2")
    SUPABASE_SECRET_KEY: str = Field(default="sb_secret_FyGWJel-fDDVCWGrGy3jYQ_QnggIZjH")
    SUPABASE_JWKS_URL: str = Field(default="https://iaykhpsrmptokiantgcc.supabase.co/auth/v1/.well-known/jwks.json")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # AI & Model Configuration (Groq Llama 3.3 70B)
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile")
    
    # Security & Auth
    SECRET_KEY: str = Field(default="dev_secret_key_change_in_production_32_bytes_long")
    REFRESH_SECRET_KEY: str = Field(default="dev_refresh_secret_key_change_in_production_32_bytes")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000,https://student-os-ai-yd3a-teal.vercel.app,https://student-os-ai.vercel.app,*")
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        
    # Storage
    S3_BUCKET_NAME: str = Field(default="scholar-os-assets")
    S3_ACCESS_KEY: str = Field(default="scholar")
    S3_SECRET_KEY: str = Field(default="scholarpassword")
    S3_ENDPOINT_URL: str = Field(default="http://localhost:9000")

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
