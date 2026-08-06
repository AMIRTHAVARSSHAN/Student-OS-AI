from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import os
import logging
from google import genai
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

    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an AI study assistant analyzing the student's study note context below.
    Answer the student's question based on the note. If the answer is not in the note, 
    use your general knowledge but mention that it goes beyond the current note.
    
    NOTE CONTEXT:
    {context_text[:40000]}
    
    STUDENT QUESTION: {req.message}
    """

    try:
        res = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"reply": res.text or "I couldn't generate a response."}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat.")
