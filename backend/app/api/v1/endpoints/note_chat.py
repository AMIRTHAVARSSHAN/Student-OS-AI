from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import os
import logging
from groq import Groq
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note, NoteBlock
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class NoteChatRequest(BaseModel):
    message: str

class NoteChatResponse(BaseModel):
    reply: str

@router.post("/{note_id}/chat", response_model=NoteChatResponse)
async def chat_with_note(
    note_id: str,
    req: NoteChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify note access
    result = await db.execute(
        select(Note).where(Note.id == note_id).where(Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Fetch blocks to provide context
    blocks_result = await db.execute(
        select(NoteBlock).where(NoteBlock.note_id == note.id).order_by(NoteBlock.order)
    )
    blocks = blocks_result.scalars().all()
    
    # Construct context string
    context_text = f"Title: {note.title}\n\n"
    for block in blocks:
        context_text += f"[{block.block_type.upper()}]: {block.content}\n"

    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    client = Groq(api_key=api_key)
    
    prompt = f"""
    You are an AI study assistant analyzing the student's study note context below.
    Answer the student's question based on the note. If the answer is not in the note, 
    use your general knowledge but mention that it goes beyond the current note.
    
    NOTE CONTEXT:
    {context_text[:40000]}
    
    STUDENT QUESTION: {req.message}
    """

    try:
        res = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        reply = res.choices[0].message.content if res.choices else "I couldn't generate a response."
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Groq note chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {e}")
