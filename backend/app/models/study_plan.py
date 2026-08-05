from sqlalchemy import String, Integer, Boolean, Date, Time, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, Any
from datetime import date, time
from app.core.database import Base
from app.models.base import TimestampMixin

class StudyPlan(Base, TimestampMixin):
    __tablename__ = "study_plans"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    plan_type: Mapped[str] = mapped_column(String(20), default="weekly", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    generation_context: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    user = relationship("User", back_populates="study_plans")
    blocks = relationship("StudyBlock", back_populates="plan", cascade="all, delete-orphan")

class StudyBlock(Base, TimestampMixin):
    __tablename__ = "study_blocks"

    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    block_type: Mapped[str] = mapped_column(String(20), default="study", nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    actual_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    plan = relationship("StudyPlan", back_populates="blocks")
    subject = relationship("Subject")
