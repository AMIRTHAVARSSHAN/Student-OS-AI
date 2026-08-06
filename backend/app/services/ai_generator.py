import os
import json
import logging
from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

# Define explicit Pydantic models without generic Dict[str, Any] to comply with Gemini Developer API schema validation
class BlockDetails(BaseModel):
    text: Optional[str] = Field(None, description="Main text content for paragraphs, headings, or callouts")
    code: Optional[str] = Field(None, description="Code snippet or Mermaid diagram syntax")
    language: Optional[str] = Field(None, description="Programming language for code blocks (e.g. python, javascript)")
    callout_type: Optional[str] = Field(None, description="info, warning, tip for callout blocks")
    title: Optional[str] = Field(None, description="Heading title or Callout title")
    front: Optional[str] = Field(None, description="Flashcard question/front text")
    back: Optional[str] = Field(None, description="Flashcard answer/back text")

class NoteBlockContent(BaseModel):
    block_type: str = Field(description="The type of block: paragraph, heading_1, heading_2, heading_3, callout, mermaid, code, flashcard")
    content: BlockDetails = Field(description="Structured block details")

class NoteStructure(BaseModel):
    title: str
    cover_image_prompt: Optional[str] = Field(None, description="A prompt for generating a cover image")
    icon: Optional[str] = Field(None, description="An emoji icon representing the note")
    estimated_reading_time: int = Field(description="Estimated reading time in minutes")
    difficulty_level: str = Field(description="beginner, intermediate, advanced")
    blocks: List[NoteBlockContent]

CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.6-flash",
    "gemini-2.0-flash"
]

def generate_structured_note(topic: str, subject_name: str = "", language: str = "en", source_text: str = "") -> NoteStructure:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured on server.")

    client = genai.Client(api_key=api_key)
    
    context = ""
    if source_text:
        context = f"Use the following source material to generate the note:\n\n{source_text[:50000]}\n\n"

    prompt = f"""
    Generate a comprehensive, high-quality, structured academic study note for the topic: "{topic}".
    Language preference: {language}.
    Subject Context: {subject_name}.
    
    {context}
    
    Format the output as a highly structured Notion-like document using blocks. 
    Make sure to include visual elements, memory tricks, flashcards, and mcqs.
    Never output raw markdown text, only output the JSON matching the schema.
    """
    
    last_err = None
    for model in CANDIDATE_MODELS:
        try:
            res = client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": NoteStructure,
                },
            )
            if res.text:
                return NoteStructure.model_validate_json(res.text)
        except Exception as e:
            logger.warning(f"Model {model} failed for AI structured note generation: {e}")
            last_err = e

    raise HTTPException(
        status_code=500, 
        detail=f"AI note generation failed across models: {last_err}"
    )
