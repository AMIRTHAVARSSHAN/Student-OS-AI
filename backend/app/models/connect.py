from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, Any
from datetime import datetime
from app.core.database import Base
from app.models.base import TimestampMixin

class UserConnection(Base, TimestampMixin):
    __tablename__ = "user_connections"

    requester_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    addressee_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False) # pending, accepted, declined, blocked

    requester = relationship("User", foreign_keys=[requester_id])
    addressee = relationship("User", foreign_keys=[addressee_id])

class ConnectGroup(Base, TimestampMixin):
    __tablename__ = "connect_groups"

    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    subject_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    invite_code: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, index=True)

    owner = relationship("User")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")

class GroupMember(Base, TimestampMixin):
    __tablename__ = "group_members"

    group_id: Mapped[str] = mapped_column(String(36), ForeignKey("connect_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), default="collaborator", nullable=False) # owner, admin, collaborator, viewer

    group = relationship("ConnectGroup", back_populates="members")
    user = relationship("User")

class ConnectMessage(Base, TimestampMixin):
    __tablename__ = "connect_messages"

    channel_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # group_id or pairing key "userA_userB"
    sender_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(30), default="text", nullable=False) 
    # text, voice_note, shared_note, shared_pdf, shared_flashcard, shared_mindmap, shared_quiz, shared_tutor_session
    attachment_metadata: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sender = relationship("User")

class CollaborativeNoteState(Base, TimestampMixin):
    __tablename__ = "collaborative_note_states"

    note_id: Mapped[str] = mapped_column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    yjs_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Base64 encoded CRDT state
    active_users: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)

class AcademicReputationLog(Base, TimestampMixin):
    __tablename__ = "academic_reputation_logs"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False) 
    # note_shared, peer_helped, quiz_created, study_streak_milestone
    points: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    user = relationship("User")
