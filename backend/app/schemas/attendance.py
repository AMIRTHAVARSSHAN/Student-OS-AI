from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Literal, Optional, List, Union
from uuid import UUID
from datetime import date

class AttendanceCreate(BaseModel):
    subject_id: str
    date: date
    status: Literal["present", "absent", "cancelled", "holiday"]
    period: Optional[int] = Field(default=1, ge=1, le=8)

    @field_validator("date")
    @classmethod
    def date_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Cannot mark attendance for future dates")
        return v

class AttendanceResponse(BaseModel):
    id: str
    subject_id: str
    date: date
    status: str
    period: Optional[int]
    marked_at: str

    model_config = ConfigDict(from_attributes=True)

class AttendanceSubjectSummary(BaseModel):
    subject_id: str
    subject_name: str
    total_classes: int
    present_count: int
    absent_count: int
    percentage: float
    status_indicator: Literal["safe", "warning", "danger"] # safe >=75%, warning 70-74%, danger <70%
    can_miss_classes: int
