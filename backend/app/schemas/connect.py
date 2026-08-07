from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class UserConnectionBase(BaseModel):
    addressee_id: str

class UserConnectionCreate(UserConnectionBase):
    pass

class UserConnectionResponse(BaseModel):
    id: str
    requester_id: str
    addressee_id: str
    status: str
    created_at: datetime
    requester_name: Optional[str] = None
    addressee_name: Optional[str] = None
    requester_avatar: Optional[str] = None
    addressee_avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ConnectGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subject_name: Optional[str] = None
    is_private: bool = False

class ConnectGroupResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str] = None
    subject_name: Optional[str] = None
    is_private: bool
    invite_code: str
    created_at: datetime
    member_count: int = 1

    model_config = ConfigDict(from_attributes=True)

class ConnectMessageCreate(BaseModel):
    channel_id: str
    content: str
    message_type: str = "text"
    attachment_metadata: Optional[Dict[str, Any]] = None

class ConnectMessageResponse(BaseModel):
    id: str
    channel_id: str
    sender_id: str
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    content: str
    message_type: str
    attachment_metadata: Optional[Dict[str, Any]] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PartnerRecommendationResponse(BaseModel):
    user_id: str
    full_name: str
    avatar_url: Optional[str] = None
    institution_name: Optional[str] = None
    field: Optional[str] = None
    specialization: Optional[str] = None
    matching_score: float
    common_subjects: List[str]
    complementary_topics: List[str]

class AcademicFeedItemResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    action_type: str
    points: int
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
