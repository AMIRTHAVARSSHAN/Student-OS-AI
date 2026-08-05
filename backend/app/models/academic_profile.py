from sqlalchemy import String, Integer, Numeric, Boolean, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Any
from datetime import date
from app.core.database import Base
from app.models.base import TimestampMixin

class AcademicProfile(Base, TimestampMixin):
    __tablename__ = "academic_profiles"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    education_level: Mapped[str] = mapped_column(String(30), nullable=False) # school, college, professional, competitive
    field: Mapped[str] = mapped_column(String(50), nullable=False) # engineering, medical, commerce, arts, law, mba, etc.
    specialization: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    institution_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True) # College / University / School name
    board: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    duration_years: Mapped[Optional[int]] = mapped_column(Integer, default=4, nullable=True)
    current_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_semester: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    subjects_json: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    institution_details_json: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    academic_year_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    academic_year_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="academic_profiles")
