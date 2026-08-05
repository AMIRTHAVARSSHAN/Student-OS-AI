from sqlalchemy import String, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Any
from app.core.database import Base
from app.models.base import TimestampMixin

class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    education_level: Mapped[str] = mapped_column(String(30), default="college", nullable=False, index=True)
    field: Mapped[str] = mapped_column(String(50), default="engineering", nullable=False, index=True)
    board_or_university: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    semester: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_units: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    credit_hours: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    is_lab: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    syllabus_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    user = relationship("User")
