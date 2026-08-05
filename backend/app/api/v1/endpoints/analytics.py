from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import date, timedelta
from app.dependencies import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.attendance import AttendanceRecord
from app.models.study_plan import StudyPlan, StudyBlock
from app.models.flashcard import Flashcard
from app.services.exam_predictor_service import exam_predictor_service
from app.core.database import get_db

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    # 1. Fetch study blocks for this week
    res_blocks = await db.execute(
        select(StudyBlock)
        .join(StudyPlan)
        .where(StudyPlan.user_id == current_user.id)
        .where(StudyBlock.date >= start_of_week)
        .where(StudyBlock.date <= end_of_week)
    )
    blocks = res_blocks.scalars().all()

    total_blocks = len(blocks)
    completed_blocks = sum(1 for b in blocks if b.is_completed)

    # Calculate total study hours this week
    study_minutes = 0
    for b in blocks:
        if b.is_completed:
            if b.actual_duration_minutes:
                study_minutes += b.actual_duration_minutes
            else:
                dur = (b.end_time.hour * 60 + b.end_time.minute) - (b.start_time.hour * 60 + b.start_time.minute)
                study_minutes += max(0, dur)

    study_hours_this_week = round(study_minutes / 60.0, 1)
    weekly_completion_rate = round((completed_blocks / total_blocks * 100.0), 1) if total_blocks > 0 else 0.0

    # 2. Flashcard retention rate from user flashcards
    res_fc = await db.execute(
        select(Flashcard)
        .where(Flashcard.user_id == current_user.id)
        .where(Flashcard.is_archived == False)
    )
    cards = res_fc.scalars().all()
    if cards:
        avg_difficulty = sum(c.difficulty for c in cards) / len(cards)
        flashcard_retention_rate = round(min(100.0, max(50.0, (avg_difficulty / 2.5) * 100.0)), 1)
    else:
        flashcard_retention_rate = 0.0

    # 3. Calculate study streak (days with at least 1 completed block in past 30 days)
    res_streak = await db.execute(
        select(StudyBlock.date)
        .join(StudyPlan)
        .where(StudyPlan.user_id == current_user.id)
        .where(StudyBlock.is_completed == True)
        .distinct()
        .order_by(StudyBlock.date.desc())
    )
    completed_dates = res_streak.scalars().all()
    
    streak = 0
    dates_set = set(completed_dates)
    
    if today in dates_set or (today - timedelta(days=1)) in dates_set:
        curr = today if today in dates_set else (today - timedelta(days=1))
        while curr in dates_set:
            streak += 1
            curr -= timedelta(days=1)

    return {
        "study_hours_this_week": study_hours_this_week,
        "study_streak": streak,
        "flashcard_retention_rate": flashcard_retention_rate,
        "completed_study_blocks": completed_blocks,
        "total_study_blocks": total_blocks,
        "weekly_completion_rate": weekly_completion_rate
    }

@router.get("/predictions")
async def get_exam_predictions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch ONLY subjects added by current user
    res_subj = await db.execute(
        select(Subject).where(Subject.user_id == current_user.id)
    )
    subjects = res_subj.scalars().all()

    if not subjects:
        return []

    results = []
    for subj in subjects:
        # 1. Real Attendance % for this subject
        res_att = await db.execute(
            select(AttendanceRecord)
            .where(AttendanceRecord.user_id == current_user.id)
            .where(AttendanceRecord.subject_id == subj.id)
        )
        records = res_att.scalars().all()
        tot_att = len(records)
        pres_att = sum(1 for r in records if r.status == "present")
        att_pct = (pres_att / tot_att * 100.0) if tot_att > 0 else 75.0

        # 2. Real Flashcard retention for subject
        res_fc = await db.execute(
            select(Flashcard)
            .where(Flashcard.user_id == current_user.id)
            .where(Flashcard.subject_id == subj.id)
        )
        fc_list = res_fc.scalars().all()
        retention = (sum(c.difficulty for c in fc_list) / len(fc_list) / 2.5 * 100.0) if fc_list else 75.0

        # 3. Study Hours Ratio for subject
        res_blocks = await db.execute(
            select(StudyBlock)
            .join(StudyPlan)
            .where(StudyPlan.user_id == current_user.id)
            .where(StudyBlock.subject_id == subj.id)
        )
        s_blocks = res_blocks.scalars().all()
        tot_b = len(s_blocks)
        comp_b = sum(1 for b in s_blocks if b.is_completed)
        hours_ratio = (comp_b / tot_b) if tot_b > 0 else 1.0

        pred = exam_predictor_service.calculate_prediction(
            quiz_average=75.0,
            topic_coverage_pct=round(min(100.0, (comp_b / max(1, subj.total_units or 5)) * 100.0), 1),
            flashcard_retention=round(min(100.0, retention), 1),
            study_hours_ratio=round(hours_ratio, 2),
            attendance_pct=round(att_pct, 1)
        )

        results.append({
            "subject_id": subj.id,
            "subject_name": subj.name,
            "predicted_score": pred["predicted_score"],
            "confidence_interval": pred["confidence_interval"],
            "breakdown": pred["breakdown"]
        })

    return results
