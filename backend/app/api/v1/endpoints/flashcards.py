from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date, timedelta
from app.dependencies import get_current_user
from app.models.user import User
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardCreate, FlashcardReviewRequest, FlashcardResponse
from app.core.database import get_db

router = APIRouter()

def sm2_algorithm(quality: int, repetitions: int, easiness: float, interval: int) -> tuple[int, float, int]:
    # Map 1-4 UI to 0-5 SM2 quality
    q_map = {1: 0, 2: 2, 3: 4, 4: 5}
    q = q_map.get(quality, 4)

    if q >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * easiness)
        new_repetitions = repetitions + 1
    else:
        new_repetitions = 0
        new_interval = 1

    new_easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_easiness = max(1.3, new_easiness)
    return new_repetitions, new_easiness, new_interval

@router.post("", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    req: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    card = Flashcard(
        user_id=current_user.id,
        subject_id=req.subject_id,
        front=req.front,
        back=req.back,
        source=req.source,
        tags=req.tags,
        bloom_level=req.bloom_level,
        next_review_date=date.today()
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.get("/due", response_model=List[FlashcardResponse])
async def get_due_flashcards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Flashcard)
        .where(Flashcard.user_id == current_user.id)
        .where(Flashcard.next_review_date <= date.today())
        .where(Flashcard.is_archived == False)
        .order_by(Flashcard.next_review_date.asc())
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{card_id}/review", response_model=FlashcardResponse)
async def review_flashcard(
    card_id: UUID,
    req: FlashcardReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.id == card_id)
        .where(Flashcard.user_id == current_user.id)
    )
    card = result.scalars().first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    new_rep, new_easy, new_interval = sm2_algorithm(
        quality=req.quality,
        repetitions=card.repetitions,
        easiness=float(card.difficulty),
        interval=card.interval_days
    )

    card.repetitions = new_rep
    card.difficulty = new_easy
    card.interval_days = new_interval
    card.next_review_date = date.today() + timedelta(days=new_interval)

    await db.commit()
    await db.refresh(card)
    return card
