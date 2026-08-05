from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note
from app.core.database import get_db

router = APIRouter()

@router.post("/process")
async def process_ocr_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG) are supported for OCR.")

    # Simulated OCR extraction text from whiteboard/handwritten photo
    extracted_text = (
        "Unit 3: Deadlock Detection & Recovery\n"
        "- Resource Allocation Graph (RAG)\n"
        "- Banker's Algorithm Safety Condition: Need <= Available\n"
        "- Deadlock Prevention: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait\n"
    )

    word_count = len(extracted_text.split())

    # Create new Note automatically from OCR
    note = Note(
        user_id=current_user.id,
        title=f"OCR Note - {file.filename}",
        content=extracted_text,
        plain_text=extracted_text,
        source="ocr",
        word_count=word_count
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)

    return {
        "status": "success",
        "note_id": str(note.id),
        "title": note.title,
        "extracted_text": extracted_text,
        "word_count": word_count
    }
