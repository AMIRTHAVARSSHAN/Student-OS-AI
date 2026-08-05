from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime

class NoteCreate(BaseModel):
    subject_id: Optional[str] = None
    title: str
    content: str
    source: str = "manual"
    tags: List[str] = []
    unit_number: Optional[int] = None
    topic: Optional[str] = None

class NoteUpdate(BaseModel):
    subject_id: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    unit_number: Optional[int] = None
    topic: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None

class NoteResponse(BaseModel):
    id: str
    subject_id: Optional[str] = None
    title: str
    content: str
    plain_text: str
    source: str
    tags: List[str] = []
    unit_number: Optional[int] = None
    topic: Optional[str] = None
    is_pinned: bool
    is_archived: bool
    word_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AINoteGenerateRequest(BaseModel):
    topic: str
    subject_name: Optional[str] = None
    language: Optional[str] = "en"
