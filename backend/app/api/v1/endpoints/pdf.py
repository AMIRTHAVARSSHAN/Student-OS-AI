from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os
import shutil
import logging
from pypdf import PdfReader
from groq import Groq

from app.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.note import Note
from app.schemas.document import DocumentResponse, PDFChatRequest, PDFGenerateNoteRequest
from app.schemas.note import NoteResponse
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

CANDIDATE_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a real PDF file, extracts page count and text via PyPDF, and stores metadata in user's backend database."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF documents (.pdf) are supported.")

    file_bytes = await file.read()
    file_size_str = format_file_size(len(file_bytes))

    # Parse PDF using pypdf
    page_count = 0
    extracted_text = ""
    try:
        import io
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        page_count = len(pdf_reader.pages)
        pages_text = []
        for idx, page in enumerate(pdf_reader.pages):
            txt = page.extract_text() or ""
            if txt.strip():
                pages_text.append(f"--- PAGE {idx + 1} ---\n{txt}")
        extracted_text = "\n\n".join(pages_text)
    except Exception as e:
        logger.warning(f"Error parsing PDF text for {file.filename}: {e}")

    # Save file to disk
    doc_id_prefix = current_user.id[:8]
    safe_filename = f"{doc_id_prefix}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        logger.error(f"Failed to write PDF file to disk: {e}")
        file_path = None

    # Create database record
    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size_str,
        page_count=page_count,
        extracted_text=extracted_text[:100000], # Store up to 100k chars for fast context
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

@router.get("", response_model=List[DocumentResponse])
async def list_pdfs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches user's real uploaded PDF documents from database."""
    res = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    return res.scalars().all()

@router.get("/{document_id}")
async def get_pdf(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Document)
        .where(Document.id == str(document_id))
        .where(Document.user_id == current_user.id)
    )
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pdf(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Document)
        .where(Document.id == str(document_id))
        .where(Document.user_id == current_user.id)
    )
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return None

@router.post("/{document_id}/chat")
async def chat_with_pdf(
    document_id: str,
    req: PDFChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ask AI questions about the uploaded PDF document content."""
    res = await db.execute(
        select(Document)
        .where(Document.id == str(document_id))
        .where(Document.user_id == current_user.id)
    )
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on server.")

    client = Groq(api_key=api_key)

    context_text = doc.extracted_text or "No extracted text available for this document."
    # Truncate context text to safe length for model
    truncated_context = context_text[:15000]

    prompt = f"""
    You are Scholar AI, an elite academic tutor.
    The student is asking a question about their uploaded PDF document: "{doc.filename}".

    === DOCUMENT EXTRACTED TEXT CONTEXT ===
    {truncated_context}
    === END DOCUMENT CONTEXT ===

    STUDENT QUESTION: "{req.question}"
    LANGUAGE PREFERENCE: {req.language or 'en'}

    Instructions:
    - Answer the student's question clearly and thoroughly based on the provided PDF document text.
    - If relevant, cite specific section topics or page numbers mentioned in the text.
    - Use GitHub Flavored Markdown (headings, bullet points, math equations if applicable).
    """

    answer_text = ""
    last_err = None

    for model in CANDIDATE_MODELS:
        try:
            res_ai = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            if res_ai.choices and res_ai.choices[0].message.content:
                answer_text = res_ai.choices[0].message.content.strip()
                break
        except Exception as e:
            logger.warning(f"Model {model} failed for PDF Chat: {e}")
            last_err = e

    if not answer_text:
        raise HTTPException(status_code=500, detail=f"AI PDF Chat failed: {last_err}")

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "question": req.question,
        "answer": answer_text
    }

@router.post("/{document_id}/generate-note", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def generate_note_from_pdf(
    document_id: str,
    req: PDFGenerateNoteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generates structured Markdown study notes from the PDF text using Gemini and saves directly into notes database memory."""
    res = await db.execute(
        select(Document)
        .where(Document.id == str(document_id))
        .where(Document.user_id == current_user.id)
    )
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on server.")

    client = Groq(api_key=api_key)

    context_text = doc.extracted_text or "No extracted text available for this document."
    truncated_context = context_text[:20000]

    prompt = f"""
    Synthesize comprehensive, high-quality, structured academic study notes in Markdown format from the uploaded PDF document: "{doc.filename}".
    Language preference: {req.language or 'en'}.
    Additional Instructions: {req.topic_or_instructions or 'Create full unit study notes'}.

    === PDF DOCUMENT EXTRACTED TEXT ===
    {truncated_context}
    === END PDF DOCUMENT TEXT ===

    Format the study notes strictly using Github Flavored Markdown:
    - Start with title `# Study Notes: {doc.filename}`
    - Include Executive Overview
    - Include Key Concepts & Definitions
    - Include Equations / Formulas / Code Blocks where applicable
    - Include Exam Revision Summary Bullet Points at the end

    Output raw markdown text directly starting with `# Study Notes: {doc.filename}`.
    """

    generated_markdown = ""
    last_err = None

    for model in CANDIDATE_MODELS:
        try:
            res_ai = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            if res_ai.choices and res_ai.choices[0].message.content:
                generated_markdown = res_ai.choices[0].message.content.strip()
                break
        except Exception as e:
            logger.warning(f"Model {model} failed for PDF Note generation: {e}")
            last_err = e

    if not generated_markdown:
        raise HTTPException(status_code=500, detail=f"AI PDF Note generation failed: {last_err}")

    note_title = f"Notes: {doc.filename.rsplit('.', 1)[0]}"
    word_count = len(generated_markdown.split())

    note = Note(
        user_id=current_user.id,
        title=note_title,
        content=generated_markdown,
        plain_text=generated_markdown,
        source="pdf-extracted",
        tags=["pdf", doc.filename.lower()],
        topic=doc.filename,
        word_count=word_count
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note
