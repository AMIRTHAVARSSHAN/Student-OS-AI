from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
from app.core.database import get_db
from app.dependencies import get_current_admin_user
from app.models.user import User
from app.models.note import Note
from app.models.pdf_document import PDFDocument
from app.models.study_plan import StudyPlan, StudyBlock
from app.models.academic_profile import AcademicProfile
from app.models.attendance import AttendanceRecord
from app.models.subject import Subject

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_notes = (await db.execute(select(func.count(Note.id)))).scalar() or 0
    total_pdfs = (await db.execute(select(func.count(PDFDocument.id)))).scalar() or 0
    total_study_plans = (await db.execute(select(func.count(StudyPlan.id)))).scalar() or 0
    total_subjects = (await db.execute(select(func.count(Subject.id)))).scalar() or 0

    return {
        "total_users": total_users,
        "total_notes": total_notes,
        "total_pdfs": total_pdfs,
        "total_study_plans": total_study_plans,
        "total_subjects": total_subjects,
    }

@router.get("/users")
async def get_all_users(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(User)
        .options(selectinload(User.academic_profiles))
        .order_by(User.created_at.desc())
    )
    users = res.scalars().all()

    user_list = []
    for u in users:
        notes_cnt = (await db.execute(select(func.count(Note.id)).where(Note.user_id == u.id))).scalar() or 0
        pdfs_cnt = (await db.execute(select(func.count(PDFDocument.id)).where(PDFDocument.user_id == u.id))).scalar() or 0
        plans_cnt = (await db.execute(select(func.count(StudyPlan.id)).where(StudyPlan.user_id == u.id))).scalar() or 0
        
        prof = u.academic_profiles[0] if u.academic_profiles else None
        
        user_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "subscription_tier": u.subscription_tier,
            "onboarding_completed": u.onboarding_completed,
            "institution_name": prof.institution_name if prof else None,
            "education_level": prof.education_level if prof else None,
            "notes_count": notes_cnt,
            "pdfs_count": pdfs_cnt,
            "study_plans_count": plans_cnt,
            "created_at": u.created_at,
            "last_login_at": u.last_login_at,
        })

    return user_list

@router.get("/users/{user_id}/inspect")
async def inspect_user_full_data(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(User)
        .options(
            selectinload(User.academic_profiles),
            selectinload(User.notes),
            selectinload(User.study_plans).selectinload(StudyPlan.blocks),
            selectinload(User.attendance_records)
        )
        .where(User.id == user_id)
    )
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch user's PDFs
    pdf_res = await db.execute(select(PDFDocument).where(PDFDocument.user_id == user_id))
    user_pdfs = pdf_res.scalars().all()

    # Fetch user's subjects
    subj_res = await db.execute(select(Subject).where(Subject.user_id == user_id))
    user_subjs = [s.name for s in subj_res.scalars().all()]

    prof = target_user.academic_profiles[0] if target_user.academic_profiles else None

    return {
        "user_info": {
            "id": target_user.id,
            "email": target_user.email,
            "full_name": target_user.full_name,
            "is_admin": target_user.is_admin,
            "subscription_tier": target_user.subscription_tier,
            "created_at": target_user.created_at,
            "onboarding_completed": target_user.onboarding_completed,
            "institution_name": prof.institution_name if prof else None,
            "education_level": prof.education_level if prof else None,
            "field": prof.field if prof else None,
            "specialization": prof.specialization if prof else None,
            "subjects": user_subjs,
        },
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "source": n.source,
                "word_count": n.word_count,
                "created_at": n.created_at,
            }
            for n in target_user.notes
        ],
        "pdfs": [
            {
                "id": p.id,
                "filename": p.filename,
                "page_count": p.page_count,
                "file_size": p.file_size,
                "created_at": p.created_at,
            }
            for p in user_pdfs
        ],
        "study_plans": [
            {
                "id": sp.id,
                "title": sp.title,
                "start_date": sp.start_date,
                "end_date": sp.end_date,
                "blocks_count": len(sp.blocks),
            }
            for sp in target_user.study_plans
        ],
    }

@router.delete("/users/{user_id}")
async def delete_user_by_admin(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if str(admin_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    res = await db.execute(select(User).where(User.id == user_id))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(target_user)
    await db.commit()

    return {"message": f"User {target_user.email} and all associated data deleted successfully"}
