from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date, time

class StudyBlockCreate(BaseModel):
    subject_id: UUID
    date: date
    start_time: time
    end_time: time
    topic: str
    block_type: str = "study" # study, revision, practice, break
    priority: str = "medium" # high, medium, low

class StudyBlockResponse(BaseModel):
    id: UUID
    plan_id: UUID
    subject_id: UUID
    date: date
    start_time: time
    end_time: time
    topic: str
    block_type: str
    priority: str
    is_completed: bool
    actual_duration_minutes: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class StudyPlanCreate(BaseModel):
    title: str
    start_date: date
    end_date: date
    plan_type: str = "weekly"
    focus_subjects: Optional[List[UUID]] = None

class StudyPlanResponse(BaseModel):
    id: UUID
    title: str
    start_date: date
    end_date: date
    plan_type: str
    status: str
    blocks: List[StudyBlockResponse] = []

    model_config = ConfigDict(from_attributes=True)
