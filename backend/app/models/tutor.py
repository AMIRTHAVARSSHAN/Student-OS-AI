from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, Any
from datetime import datetime
from app.core.database import Base
from app.models.base import TimestampMixin

class TutorSession(Base, TimestampMixin):
    __tablename__ = "tutor_sessions"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    chapter: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="intermediate", nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    time_studied_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    understanding_score: Mapped[float] = mapped_column(Float, default=7.5, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=7.5, nullable=False)
    teaching_style: Mapped[str] = mapped_column(String(30), default="teacher", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    subject = relationship("Subject")
    assets = relationship("SessionAsset", back_populates="session", cascade="all, delete-orphan")

class AcademicMemory(Base, TimestampMixin):
    __tablename__ = "academic_memories"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    weak_topics: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    strong_topics: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(20), default="en", nullable=False)
    preferred_teaching_style: Mapped[str] = mapped_column(String(30), default="teacher", nullable=False)
    asked_questions_history: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    common_mistakes: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    learning_habits: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    mastery_scores: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)

    user = relationship("User")

class SessionAsset(Base, TimestampMixin):
    __tablename__ = "session_assets"

    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("tutor_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type: Mapped[str] = mapped_column(String(30), nullable=False) # note, pdf, teacher_note, quiz, flashcard, mindmap, voice, bookmark
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    metadata_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    session = relationship("TutorSession", back_populates="assets")

class NoteVersion(Base, TimestampMixin):
    __tablename__ = "note_versions"

    note_id: Mapped[str] = mapped_column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    change_summary: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)

    note = relationship("Note")

class ConceptNode(Base, TimestampMixin):
    __tablename__ = "concept_nodes"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_concept_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prerequisites: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    mastery_level: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)

    user = relationship("User")
