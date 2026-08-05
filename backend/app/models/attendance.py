from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import date, datetime, timezone
from app.core.database import Base
from app.models.base import TimestampMixin

class AttendanceRecord(Base, TimestampMixin):
    __tablename__ = "attendance_records"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False) # present, absent, cancelled, holiday
    period: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=True)
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    is_synced: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="attendance_records")
    subject = relationship("Subject")

    __table_args__ = (
        Index("idx_attendance_user_subject_date_period", "user_id", "subject_id", "date", "period", unique=True),
    )
