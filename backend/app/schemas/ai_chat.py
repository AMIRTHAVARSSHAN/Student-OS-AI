from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class AIChatMessage(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None

class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    tool_name: Optional[str] = None
    tool_args: Optional[Any] = None
    tool_result: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: UUID
    title: Optional[str]
    message_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
