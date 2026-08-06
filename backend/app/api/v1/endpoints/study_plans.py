from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import date, time, timedelta
from app.dependencies import get_current_user
from app.models.user import User
from app.models.study_plan import StudyPlan, StudyBlock
from app.models.subject import Subject
from app.schemas.study_plan import StudyPlanCreate, StudyPlanResponse, StudyBlockResponse
from app.core.database import get_db

router = APIRouter()

@router.post("", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_study_plan(
    req: StudyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan = StudyPlan(
        user_id=current_user.id,
        title=req.title,
        start_date=req.start_date,
        end_date=req.end_date,
        plan_type=req.plan_type,
        status="active"
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)

    # Generate initial study blocks for ALL enrolled subjects of current_user across the 7 days
    res_subj = await db.execute(
        select(Subject).where(Subject.user_id == current_user.id)
    )
    subjects = res_subj.scalars().all()

    if subjects:
        curr_date = req.start_date
        day_offset = 0
        while curr_date <= req.end_date:
            # Distribute subjects so every subject gets scheduled across days
            num_subjects = len(subjects)
            # Pick up to 5 subjects per day, rotating starting index each day
            blocks_for_today = [subjects[(day_offset + i) % num_subjects] for i in range(min(num_subjects, 5))]
            
            for idx, subj in enumerate(blocks_for_today):
                block = StudyBlock(
                    plan_id=plan.id,
                    subject_id=subj.id,
                    date=curr_date,
                    start_time=time(9 + idx * 2, 0),
                    end_time=time(10 + idx * 2, 30),
                    topic=f"{subj.name} - Module {(day_offset + idx) % 5 + 1} Deep Dive",
                    priority="high" if idx == 0 else "medium"
                )
                db.add(block)
            curr_date += timedelta(days=1)
            day_offset += 1
        await db.commit()

    # Re-query plan with blocks eager loaded
    res = await db.execute(
        select(StudyPlan)
        .options(selectinload(StudyPlan.blocks))
        .where(StudyPlan.id == plan.id)
    )
    full_plan = res.scalars().first()
    return full_plan

@router.get("", response_model=List[StudyPlanResponse])
async def get_user_study_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(StudyPlan)
        .options(selectinload(StudyPlan.blocks))
        .where(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.created_at.desc())
    )
    return res.scalars().all()

@router.get("/today", response_model=List[StudyBlockResponse])
async def get_today_blocks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    query = (
        select(StudyBlock)
        .join(StudyPlan)
        .where(StudyPlan.user_id == current_user.id)
        .where(StudyBlock.date == today)
        .order_by(StudyBlock.start_time.asc())
    )
    result = await db.execute(query)
    blocks = result.scalars().all()

    # If no blocks exist for today's exact date in database, pull the latest active plan blocks
    if not blocks:
        fallback_query = (
            select(StudyBlock)
            .join(StudyPlan)
            .where(StudyPlan.user_id == current_user.id)
            .order_by(StudyBlock.date.desc(), StudyBlock.start_time.asc())
            .limit(10)
        )
        fb_res = await db.execute(fallback_query)
        blocks = fb_res.scalars().all()

    return blocks

@router.patch("/blocks/{block_id}/complete", response_model=StudyBlockResponse)
async def toggle_block_complete(
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(StudyBlock)
        .join(StudyPlan)
        .where(StudyPlan.user_id == current_user.id)
        .where(StudyBlock.id == block_id)
    )
    result = await db.execute(query)
    block = result.scalars().first()
    if not block:
        raise HTTPException(status_code=404, detail="Study block not found")

    block.is_completed = not block.is_completed
    await db.commit()
    await db.refresh(block)
    return block
