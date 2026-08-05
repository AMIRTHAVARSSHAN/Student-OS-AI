from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import date
from app.dependencies import get_current_user
from app.models.user import User
from app.models.attendance import AttendanceRecord
from app.models.subject import Subject
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceSubjectSummary
from app.core.database import get_db

router = APIRouter()

@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(
    req: AttendanceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    subj_id_str = str(req.subject_id)
    # Check if record already exists for date + period
    res = await db.execute(
        select(AttendanceRecord)
        .where(AttendanceRecord.user_id == current_user.id)
        .where(AttendanceRecord.subject_id == subj_id_str)
        .where(AttendanceRecord.date == req.date)
        .where(AttendanceRecord.period == req.period)
    )
    existing = res.scalars().first()

    if existing:
        existing.status = req.status
        record = existing
    else:
        record = AttendanceRecord(
            user_id=current_user.id,
            subject_id=subj_id_str,
            date=req.date,
            status=req.status,
            period=req.period
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return AttendanceResponse(
        id=record.id,
        subject_id=record.subject_id,
        date=record.date,
        status=record.status,
        period=record.period,
        marked_at=record.marked_at.isoformat()
    )

@router.get("/records")
async def get_attendance_records(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AttendanceRecord)
        .options(selectinload(AttendanceRecord.subject))
        .where(AttendanceRecord.user_id == current_user.id)
        .order_by(AttendanceRecord.date.desc(), AttendanceRecord.period.desc())
    )
    records = res.scalars().all()
    return [
        {
            "id": r.id,
            "subject_id": r.subject_id,
            "subject_name": r.subject.name if r.subject else "Subject",
            "date": str(r.date),
            "status": r.status,
            "period": r.period,
            "marked_at": r.marked_at.isoformat()
        }
        for r in records
    ]

@router.get("", response_model=List[AttendanceSubjectSummary])
async def get_attendance_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get ONLY subjects belonging to current user
    res_subjects = await db.execute(
        select(Subject).where(Subject.user_id == current_user.id)
    )
    subjects = res_subjects.scalars().all()

    if not subjects:
        return []

    summaries = []
    for subj in subjects:
        # Get total attendance records for this subject
        res_rec = await db.execute(
            select(AttendanceRecord)
            .where(AttendanceRecord.user_id == current_user.id)
            .where(AttendanceRecord.subject_id == subj.id)
        )
        records = res_rec.scalars().all()

        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        absent = sum(1 for r in records if r.status == "absent")

        pct = (present / total * 100.0) if total > 0 else 100.0
        
        if pct >= 75.0:
            indicator = "safe"
        elif pct >= 70.0:
            indicator = "warning"
        else:
            indicator = "danger"

        # Calculate how many classes user can safely miss (assuming 75% target requirement)
        min_required = 0.75 * total
        can_miss = max(0, int(present - min_required)) if total > 0 else 0

        summaries.append(AttendanceSubjectSummary(
            subject_id=subj.id,
            subject_name=subj.name,
            total_classes=total,
            present_count=present,
            absent_count=absent,
            percentage=round(pct, 2),
            status_indicator=indicator,
            can_miss_classes=can_miss
        ))

    return summaries

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AttendanceRecord)
        .where(AttendanceRecord.user_id == current_user.id)
        .where(AttendanceRecord.id == record_id)
    )
    rec = res.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    await db.delete(rec)
    await db.commit()
    return None
