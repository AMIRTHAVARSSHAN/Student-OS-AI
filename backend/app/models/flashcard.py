from sqlalchemy import String, Integer, Boolean, Text, Numeric, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Any
from datetime import date
from app.core.database import Base
from app.models.base import TimestampMixin

class Flashcard(Base, TimestampMixin):
    __tablename__ = "flashcards"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(20), default="manual", nullable=False)
    source_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    difficulty: Mapped[float] = mapped_column(Numeric(3, 2), default=2.50, nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    repetitions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    tags: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    bloom_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="flashcards")
    subject = relationship("Subject")
