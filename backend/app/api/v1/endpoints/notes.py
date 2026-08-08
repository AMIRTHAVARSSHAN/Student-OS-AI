from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import os
import logging
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note, NoteBlock, NoteSource
from app.models.subject import Subject
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, AINoteGenerateRequest
from app.core.database import get_db
from app.core.config import settings
from app.services.notes_pipeline.pipeline_orchestrator import generate_full_enterprise_note
from app.services.notes_pipeline.tiptap_converter import convert_markdown_to_tiptap_json

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    word_count = len(req.content.split())
    tiptap_doc = req.tiptap_json or convert_markdown_to_tiptap_json(req.content, req.title)

    note = Note(
        user_id=current_user.id,
        subject_id=req.subject_id,
        title=req.title,
        content=req.content,
        tiptap_json=tiptap_doc,
        plain_text=req.content,
        source=req.source,
        tags=req.tags,
        unit_number=req.unit_number,
        topic=req.topic,
        word_count=word_count
    )
    db.add(note)
    await db.commit()

    result = await db.execute(
        select(Note)
        .options(selectinload(Note.blocks), selectinload(Note.sources))
        .where(Note.id == note.id)
    )
    return result.scalars().first()

@router.post("/generate-ai", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def generate_ai_note(
    req: AINoteGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a structured, Tiptap JSON academic study note using Groq Llama 3.3 70B and saves it directly into the user's database.
    """
    pipeline_res = generate_full_enterprise_note(
        topic=req.topic,
        subject_name=req.subject_name or "",
        language=req.language or "en",
        source_text=req.source_text or ""
    )

    blueprint = pipeline_res["blueprint"]
    full_content = pipeline_res["full_markdown"]
    tiptap_doc = pipeline_res.get("tiptap_json") or convert_markdown_to_tiptap_json(full_content, blueprint.title)
    db_blocks = pipeline_res["db_blocks"]

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

    word_count = len(full_content.split())

    note = Note(
        user_id=current_user.id,
        subject_id=subject_id,
        title=blueprint.title,
        content=full_content,
        tiptap_json=tiptap_doc,
        plain_text=full_content[:500],
        source="ai-generated",
        tags=blueprint.tags or [req.topic.lower(), "ai-generated"],
        topic=req.topic,
        word_count=word_count,
        icon="📚",
        estimated_reading_time=blueprint.estimated_reading_time,
        difficulty_level=blueprint.difficulty
    )

    db.add(note)
    await db.flush()

    source = NoteSource(
        note_id=note.id,
        source_type=req.source_type,
        url=req.source_url,
        metadata_json={"source_text": bool(req.source_text)}
    )
    db.add(source)

    for b_data in db_blocks:
        block = NoteBlock(
            note_id=note.id,
            block_type=b_data["block_type"],
            content=b_data["content"],
            order=b_data["order"]
        )
        db.add(block)

    await db.commit()

    result = await db.execute(
        select(Note)
        .options(selectinload(Note.blocks), selectinload(Note.sources))
        .where(Note.id == note.id)
    )
    return result.scalars().first()

@router.get("", response_model=List[NoteResponse])
async def list_notes(
    subject_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Note)
        .options(selectinload(Note.blocks), selectinload(Note.sources))
        .where(Note.user_id == current_user.id)
        .where(Note.is_archived == False)
    )
    if subject_id:
        query = query.where(Note.subject_id == str(subject_id))
    query = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc())

    result = await db.execute(query)
    notes = result.scalars().all()

    # Dynamic fallback to ensure legacy notes automatically expose tiptap_json
    for n in notes:
        if not n.tiptap_json:
            n.tiptap_json = convert_markdown_to_tiptap_json(n.content, n.title)

    return notes

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Note)
        .options(selectinload(Note.blocks), selectinload(Note.sources))
        .where(Note.id == str(note_id))
        .where(Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if not note.tiptap_json:
        note.tiptap_json = convert_markdown_to_tiptap_json(note.content, note.title)

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
        .options(selectinload(Note.blocks), selectinload(Note.sources))
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
        if req.tiptap_json is None:
            note.tiptap_json = convert_markdown_to_tiptap_json(req.content, note.title)
    if req.tiptap_json is not None:
        note.tiptap_json = req.tiptap_json
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
    if req.cover_image is not None:
        note.cover_image = req.cover_image
    if req.icon is not None:
        note.icon = req.icon

    await db.commit()
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
