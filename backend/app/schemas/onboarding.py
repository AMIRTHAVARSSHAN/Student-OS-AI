from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import date

class OnboardingRequest(BaseModel):
    education_level: str # school, college, professional, competitive
    field: str # engineering, medical, commerce, arts, law, mba, etc.
    specialization: Optional[str] = None
    institution_name: Optional[str] = None
    institution_details: Optional[dict] = None
    board: Optional[str] = None
    duration_years: Optional[int] = 4
    current_year: Optional[int] = 1
    current_semester: Optional[int] = 1
    target_score: Optional[float] = None
    subjects: Union[List[str], str] # List of strings OR comma-separated string
    preferred_language: str = "en"

class OnboardingResponse(BaseModel):
    status: str = "success"
    message: str = "Onboarding completed successfully"
    onboarding_completed: bool = True
