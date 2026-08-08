from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union, Any, Dict
from uuid import UUID
from datetime import datetime

class NoteBlockBase(BaseModel):
    block_type: str
    content: Dict[str, Any]
    order: int
    parent_id: Optional[str] = None

class NoteBlockCreate(NoteBlockBase):
    pass

class NoteBlockResponse(NoteBlockBase):
    id: str
    note_id: str
    
    model_config = ConfigDict(from_attributes=True)

class NoteSourceBase(BaseModel):
    source_type: str
    url: Optional[str] = None
    metadata_json: Dict[str, Any] = {}

class NoteSourceCreate(NoteSourceBase):
    pass

class NoteSourceResponse(NoteSourceBase):
    id: str
    note_id: str

    model_config = ConfigDict(from_attributes=True)

class NoteCreate(BaseModel):
    subject_id: Optional[str] = None
    title: str
    content: str
    tiptap_json: Optional[Any] = None
    source: str = "manual"
    tags: List[str] = []
    unit_number: Optional[int] = None
    topic: Optional[str] = None
    cover_image: Optional[str] = None
    icon: Optional[str] = None
    color_theme: Optional[str] = None
    estimated_reading_time: Optional[int] = None
    difficulty_level: Optional[str] = None

class NoteUpdate(BaseModel):
    subject_id: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    tiptap_json: Optional[Any] = None
    tags: Optional[List[str]] = None
    unit_number: Optional[int] = None
    topic: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    cover_image: Optional[str] = None
    icon: Optional[str] = None
    color_theme: Optional[str] = None
    estimated_reading_time: Optional[int] = None
    difficulty_level: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    subject_id: Optional[str] = None
    title: str
    content: str
    tiptap_json: Optional[Any] = None
    plain_text: str
    source: str
    tags: List[str] = []
    unit_number: Optional[int] = None
    topic: Optional[str] = None
    cover_image: Optional[str] = None
    icon: Optional[str] = None
    color_theme: Optional[str] = None
    estimated_reading_time: Optional[int] = None
    difficulty_level: Optional[str] = None
    is_pinned: bool
    is_archived: bool
    word_count: int
    created_at: datetime
    updated_at: datetime
    blocks: Optional[List[NoteBlockResponse]] = None
    sources: Optional[List[NoteSourceResponse]] = None

    model_config = ConfigDict(from_attributes=True)

class AINoteGenerateRequest(BaseModel):
    topic: str
    subject_name: Optional[str] = None
    language: Optional[str] = "en"
    source_type: str = "manual"
    source_url: Optional[str] = None
    source_text: Optional[str] = None
