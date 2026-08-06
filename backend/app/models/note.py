from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    from sqlalchemy import JSON as Vector
from typing import Optional, Any
from datetime import datetime
from app.core.database import Base
from app.models.base import TimestampMixin

class Note(Base, TimestampMixin):
    __tablename__ = "notes"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    plain_text: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(20), default="manual", nullable=False)
    tags: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    unit_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    topic: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    color_theme: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estimated_reading_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # in minutes
    difficulty_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="notes")
    subject = relationship("Subject")
    embeddings = relationship("NoteEmbedding", back_populates="note", cascade="all, delete-orphan")
    blocks = relationship("NoteBlock", back_populates="note", cascade="all, delete-orphan", order_by="NoteBlock.order")
    sources = relationship("NoteSource", back_populates="note", cascade="all, delete-orphan")

class NoteBlock(Base, TimestampMixin):
    __tablename__ = "note_blocks"

    note_id: Mapped[str] = mapped_column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("note_blocks.id", ondelete="CASCADE"), nullable=True)
    block_type: Mapped[str] = mapped_column(String(50), nullable=False) # paragraph, heading, callout, mermaid, code
    content: Mapped[Any] = mapped_column(JSON, default=dict, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    note = relationship("Note", back_populates="blocks")
    children = relationship("NoteBlock")

class NoteSource(Base, TimestampMixin):
    __tablename__ = "note_sources"

    note_id: Mapped[str] = mapped_column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False) # youtube, pdf, voice, web
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    metadata_json: Mapped[Any] = mapped_column(JSON, default=dict, nullable=False)

    note = relationship("Note", back_populates="sources")

class NoteEmbedding(Base, TimestampMixin):
    __tablename__ = "note_embeddings"

    note_id: Mapped[str] = mapped_column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding = mapped_column(Vector(768), nullable=False)

    note = relationship("Note", back_populates="embeddings")
