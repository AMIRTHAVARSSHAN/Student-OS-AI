from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(min_length=2, max_length=100)
    preferred_language: Optional[str] = Field(default="en")

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: UUID
    subscription_tier: str
    onboarding_completed: bool

class RefreshTokenRequest(BaseModel):
    refresh_token: str
