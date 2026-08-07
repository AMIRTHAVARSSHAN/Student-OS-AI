from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    onboarding,
    attendance,
    study_plans,
    notes,
    flashcards,
    analytics,
    ocr,
    admin,
    note_chat,
    tutor,
    connect
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(study_plans.router, prefix="/study-plans", tags=["study-plans"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(note_chat.router, prefix="/notes", tags=["note-chat"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
api_router.include_router(connect.router, prefix="/connect", tags=["connect"])
