from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Union
from uuid import UUID
from datetime import datetime

class TutorSessionCreate(BaseModel):
    title: str
    subject_id: Optional[Union[str, UUID]] = None
    chapter: Optional[str] = None
    goal: Optional[str] = None
    difficulty: str = "intermediate"
    teaching_style: str = "teacher"

class TutorSessionResponse(BaseModel):
    id: Union[str, UUID]
    user_id: Union[str, UUID]
    subject_id: Optional[Union[str, UUID]] = None
    title: str
    chapter: Optional[str] = None
    goal: Optional[str] = None
    difficulty: str
    progress: int
    time_studied_seconds: int
    understanding_score: float
    confidence_score: float
    teaching_style: str
    status: str
    last_activity_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SessionAssetCreate(BaseModel):
    session_id: Union[str, UUID]
    asset_type: str
    title: str
    content: Optional[str] = None
    file_path: Optional[str] = None
    metadata_json: Optional[Any] = None

class SessionAssetResponse(BaseModel):
    id: Union[str, UUID]
    session_id: Union[str, UUID]
    asset_type: str
    title: str
    content: Optional[str] = None
    file_path: Optional[str] = None
    metadata_json: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)

class AcademicMemoryResponse(BaseModel):
    id: Union[str, UUID]
    user_id: Union[str, UUID]
    weak_topics: List[str] = []
    strong_topics: List[str] = []
    preferred_language: str
    preferred_teaching_style: str
    common_mistakes: List[str] = []
    mastery_scores: dict = {}

    model_config = ConfigDict(from_attributes=True)

class TutorChatMessage(BaseModel):
    session_id: Optional[Union[str, UUID]] = None
    message: str
    action: Optional[str] = None # e.g. "explain_better", "summarize", "notes", "quiz", "mindmap", "translate_tamil", "translate_tanglish"
    teaching_style: Optional[str] = None

class ActiveStudyStepRequest(BaseModel):
    session_id: Union[str, UUID]
    current_topic: str
    student_response: Optional[str] = None
    step_type: str = "explain" # "explain", "question", "evaluate", "quiz", "next"

class ConceptNodeResponse(BaseModel):
    id: Union[str, UUID]
    concept_name: str
    subject_name: str
    parent_concept_name: Optional[str] = None
    prerequisites: List[str] = []
    mastery_level: float

    model_config = ConfigDict(from_attributes=True)
