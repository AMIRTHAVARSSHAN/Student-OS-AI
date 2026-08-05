from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str
    preferred_language: str = "en"
    avatar_url: Optional[str] = None
    subscription_tier: str = "free"
    onboarding_completed: bool = False
    timezone: str = "Asia/Kolkata"

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    institution_name: Optional[str] = None
    education_level: Optional[str] = None
    field: Optional[str] = None
    specialization: Optional[str] = None
    duration_years: Optional[int] = None
    current_year: Optional[int] = None
    current_semester: Optional[int] = None
    subjects: Optional[List[str]] = None

class UserProfileResponse(BaseModel):
    """Full user profile including academic memory — used by dashboard and settings."""
    id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    preferred_language: str = "en"
    subscription_tier: str = "free"
    onboarding_completed: bool = False
    # Academic profile fields
    education_level: Optional[str] = None
    field: Optional[str] = None
    specialization: Optional[str] = None
    institution_name: Optional[str] = None
    institution_details: Optional[Dict[str, Any]] = None
    duration_years: Optional[int] = None
    current_year: Optional[int] = None
    current_semester: Optional[int] = None
    subjects: List[str] = []

    model_config = ConfigDict(from_attributes=True)
