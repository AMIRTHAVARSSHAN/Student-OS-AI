from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date

class FlashcardCreate(BaseModel):
    subject_id: Optional[UUID] = None
    front: str
    back: str
    source: str = "manual"
    tags: List[str] = []
    bloom_level: Optional[str] = None

class FlashcardReviewRequest(BaseModel):
    quality: int = Field(ge=1, le=4, description="1=Again, 2=Hard, 3=Good, 4=Easy")

class FlashcardResponse(BaseModel):
    id: UUID
    subject_id: Optional[UUID]
    front: str
    back: str
    source: str
    difficulty: float
    interval_days: int
    repetitions: int
    next_review_date: date
    tags: List[str]
    bloom_level: Optional[str]

    model_config = ConfigDict(from_attributes=True)
