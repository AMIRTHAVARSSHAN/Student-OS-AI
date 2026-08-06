from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union
from uuid import UUID
from datetime import date, time

class StudyBlockCreate(BaseModel):
    subject_id: Optional[Union[str, UUID]] = None
    date: date
    start_time: time
    end_time: time
    topic: str
    block_type: str = "study" # study, revision, practice, break
    priority: str = "medium" # high, medium, low
    note_id: Optional[Union[str, UUID]] = None

class StudyBlockResponse(BaseModel):
    id: Union[str, UUID]
    plan_id: Union[str, UUID]
    subject_id: Optional[Union[str, UUID]] = None
    date: date
    start_time: time
    end_time: time
    topic: str
    block_type: str
    priority: str
    is_completed: bool
    actual_duration_minutes: Optional[int] = None
    note_id: Optional[Union[str, UUID]] = None

    model_config = ConfigDict(from_attributes=True)

class StudyPlanCreate(BaseModel):
    title: str
    start_date: date
    end_date: date
    plan_type: str = "weekly"
    focus_subjects: Optional[List[Union[str, UUID]]] = None

class StudyPlanResponse(BaseModel):
    id: Union[str, UUID]
    title: str
    start_date: date
    end_date: date
    plan_type: str
    status: str
    blocks: List[StudyBlockResponse] = []

    model_config = ConfigDict(from_attributes=True)
