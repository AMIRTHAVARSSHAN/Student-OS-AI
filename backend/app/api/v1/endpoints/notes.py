from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os
import logging
from google import genai
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note
from app.models.subject import Subject
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, AINoteGenerateRequest
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
]

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    word_count = len(req.content.split())
    note = Note(
        user_id=current_user.id,
        subject_id=req.subject_id,
        title=req.title,
        content=req.content,
        plain_text=req.content,
        source=req.source,
        tags=req.tags,
        unit_number=req.unit_number,
        topic=req.topic,
        word_count=word_count
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

@router.post("/generate-ai", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def generate_ai_note(
    req: AINoteGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a full structured Markdown academic study note using Google Gemini and saves it directly into the user's database.
    """
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured on server.")

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    Generate comprehensive, high-quality, structured academic study notes in Markdown format for the topic: "{req.topic}".
    Language preference: {req.language or 'en'}.
    Subject Context: {req.subject_name or 'General Academic'}.

    Format the notes strictly using Github Flavored Markdown:
    - Use clear headings (`#`, `##`, `###`)
    - Include an Overview & Definition
    - Include Key Concepts, Formulas, or Code Blocks (using triple backticks) where applicable
    - Include Real-world Applications / Use Cases
    - Include a "Exam Revision Checklist" bullet points section at the end.
    
    Do NOT wrap the output in markdown code blocks like ```markdown ... ```. Output raw markdown text directly starting with the title heading `# {req.topic}`.
    """

    generated_text = ""
    last_err = None

    for model in CANDIDATE_MODELS:
        try:
            res = client.models.generate_content(
                model=model,
                contents=prompt
            )
            if res.text:
                generated_text = res.text.strip()
                break
        except Exception as e:
            logger.warning(f"Model {model} failed for AI note generation: {e}")
            last_err = e

    if not generated_text:
        raise HTTPException(
            status_code=500, 
            detail=f"AI note generation failed across models: {last_err}"
        )

    # Resolve optional subject_id if subject_name matches user's subjects
    subject_id = None
    if req.subject_name:
        res_subj = await db.execute(
            select(Subject)
            .where(Subject.user_id == current_user.id)
            .where(Subject.name.ilike(f"%{req.subject_name}%"))
        )
        subj_obj = res_subj.scalars().first()
        if subj_obj:
            subject_id = subj_obj.id

    word_count = len(generated_text.split())
    title = f"{req.topic}"

    note = Note(
        user_id=current_user.id,
        subject_id=subject_id,
        title=title,
        content=generated_text,
        plain_text=generated_text,
        source="ai-generated",
        tags=[req.topic.lower(), "ai-generated"],
        topic=req.topic,
        word_count=word_count
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

@router.get("", response_model=List[NoteResponse])
async def list_notes(
    subject_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Note).where(Note.user_id == current_user.id).where(Note.is_archived == False)
    if subject_id:
        query = query.where(Note.subject_id == str(subject_id))
    query = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc())

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Note)
        .where(Note.id == str(note_id))
        .where(Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    req: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Note)
        .where(Note.id == str(note_id))
        .where(Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if req.title is not None:
        note.title = req.title
    if req.content is not None:
        note.content = req.content
        note.plain_text = req.content
        note.word_count = len(req.content.split())
    if req.subject_id is not None:
        note.subject_id = str(req.subject_id)
    if req.tags is not None:
        note.tags = req.tags
    if req.unit_number is not None:
        note.unit_number = req.unit_number
    if req.topic is not None:
        note.topic = req.topic
    if req.is_pinned is not None:
        note.is_pinned = req.is_pinned
    if req.is_archived is not None:
        note.is_archived = req.is_archived

    await db.commit()
    await db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Note)
        .where(Note.id == str(note_id))
        .where(Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.delete(note)
    await db.commit()
    return None
