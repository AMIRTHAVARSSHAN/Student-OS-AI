from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
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

def extract_pdf_content(file_bytes: bytes, filename: str) -> tuple[int, str]:
    """
    Multi-tier PDF parser:
    1. Try PyMuPDF (fitz) - ultra fast & handles complex layout/fonts.
    2. Try pdfplumber - handles tables and vector streams.
    3. Try pypdf - basic fallback.
    4. If text < 100 chars (scanned image PDF), use Groq Vision OCR!
    """
    page_count = 0
    extracted_text = ""
    pages_text = []

    # TIER 1: PyMuPDF (fitz)
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        for idx, page in enumerate(doc):
            t = page.get_text("text") or ""
            if t.strip():
                pages_text.append(f"--- PAGE {idx + 1} ---\n{t.strip()}")
        extracted_text = "\n\n".join(pages_text)
    except Exception as e:
        logger.warning(f"PyMuPDF failed for {filename}: {e}")

    # TIER 2: pdfplumber if text is empty
    if not extracted_text.strip():
        try:
            import pdfplumber, io
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                page_count = len(pdf.pages)
                pages_text = []
                for idx, page in enumerate(pdf.pages):
                    t = page.extract_text() or ""
                    if t.strip():
                        pages_text.append(f"--- PAGE {idx + 1} ---\n{t.strip()}")
                extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            logger.warning(f"pdfplumber failed for {filename}: {e}")

    # TIER 3: pypdf fallback
    if not extracted_text.strip():
        try:
            import io
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            pages_text = []
            for idx, page in enumerate(reader.pages):
                t = page.extract_text() or ""
                if t.strip():
                    pages_text.append(f"--- PAGE {idx + 1} ---\n{t.strip()}")
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            logger.warning(f"pypdf failed for {filename}: {e}")

    # TIER 4: Groq Vision OCR if text is still under 100 characters (scanned image PDF)
    if len(extracted_text.strip()) < 100:
        logger.info(f"PDF {filename} appears to be scanned images. Triggering Groq Vision OCR...")
        try:
            import fitz, base64
            api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
            if api_key:
                client = Groq(api_key=api_key)
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                page_count = len(doc)
                ocr_pages = []
                for idx, page in enumerate(doc[:10]): # OCR first 10 pages max
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    base64_img = base64.b64encode(img_bytes).decode("utf-8")
                    
                    ocr_res = client.chat.completions.create(
                        model="llama-3.2-11b-vision-preview",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "Extract all text, headers, numbers, and tabular data from this scanned PDF page into clean markdown text."},
                                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_img}"}}
                                ]
                            }
                        ],
                        max_tokens=2048
                    )
                    page_txt = ocr_res.choices[0].message.content if ocr_res.choices else ""
                    if page_txt.strip():
                        ocr_pages.append(f"--- PAGE {idx + 1} (OCR) ---\n{page_txt.strip()}")
                if ocr_pages:
                    extracted_text = "\n\n".join(ocr_pages)
        except Exception as e:
            logger.warning(f"Groq Vision OCR failed for {filename}: {e}")

    return page_count, extracted_text

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a real PDF file, extracts page count and text via multi-tier PyMuPDF/pdfplumber/OCR, and stores metadata in database."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF documents (.pdf) are supported.")

    file_bytes = await file.read()
    file_size_str = format_file_size(len(file_bytes))

    page_count, extracted_text = extract_pdf_content(file_bytes, file.filename)

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
    
    res_reloaded = await db.execute(
        select(Note)
        .options(selectinload(Note.blocks), selectinload(Note.sources))
        .where(Note.id == note.id)
    )
    return res_reloaded.scalars().first()
