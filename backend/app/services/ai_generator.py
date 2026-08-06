import os
import json
import logging
from groq import Groq
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

# Define explicit Pydantic models for Structured Output
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
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

def generate_structured_note(topic: str, subject_name: str = "", language: str = "en", source_text: str = "") -> NoteStructure:
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on server.")

    client = Groq(api_key=api_key)
    
    context = ""
    if source_text:
        context = f"Use the following source material to generate the note:\n\n{source_text[:50000]}\n\n"

    schema_json = json.dumps(NoteStructure.model_json_schema(), indent=2)

    prompt = f"""
    You are a distinguished university professor and authoritative textbook author.
    Generate an EXHAUSTIVE, MASSIVE, IN-DEPTH, HIGHLY DETAILED academic study guide for the topic: "{topic}".
    Subject Context: {subject_name or 'General Academic'}.
    Language preference: {language}.
    
    {context}
    
    CRITICAL RULES FOR RELEVANCE & DEPTH:
    1. STRICT RULE ON CODE BLOCKS: Do NOT include programming code blocks (e.g. Python, Machine Learning, C++) UNLESS the topic is directly a Computer Science / Software Engineering topic! For non-programming topics (like Microbiology, Biology, Medicine, History, Chemistry, Law), DO NOT generate code blocks. Instead, generate deep academic paragraphs, chemical/biological mechanisms, or mathematical equations!
    2. EXHAUSTIVE DEPTH: Do NOT write short or high-level notes. Provide a comprehensive 2000+ word study guide with 20 to 30 detailed blocks. Expand thoroughly on every concept, mechanism, classification, and real-world application.
    3. Structural Requirements:
       - Heading 1: Executive Overview & Fundamental Definitions
       - Multiple long, detailed Paragraph blocks thoroughly defining all terms
       - Callout block (callout_type: 'info', title: 'Core Principle'): Essential Axiom or Definition
       - Heading 1: Comprehensive Step-by-Step Mechanisms & Biological / System Workflows
       - Mermaid Diagram block (block_type: 'mermaid'): MANDATORY visual flowchart in valid Mermaid syntax mapping the workflow visually (e.g., `graph TD\n  A[Stage 1] -->|Mechanism| B[Stage 2]...`)
       - Heading 1: In-Depth Technical Analysis & Sub-Classifications (with Heading 2 and Heading 3 blocks for each sub-topic)
       - Callout block (callout_type: 'warning', title: 'Exam Pitfalls & High-Yield Revision Warnings')
       - Heading 1: Real-world Applications, Clinical / Industry Case Studies
       - Flashcard blocks (block_type: 'flashcard'): At least 4-6 active recall flashcard blocks covering high-yield exam questions.
    
    Format the output strictly as a JSON object matching this JSON Schema:
    {schema_json}

    Do NOT output any markdown code blocks around the JSON. Output ONLY raw valid JSON matching the schema.
    """
    
    last_err = None
    for model in CANDIDATE_MODELS:
        try:
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a specialized JSON generator for exhaustive academic notes. Always reply in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=8192
            )
            content = res.choices[0].message.content
            if content:
                return NoteStructure.model_validate_json(content)
        except Exception as e:
            logger.warning(f"Model {model} failed for Groq structured note generation: {e}")
            last_err = e

    raise HTTPException(
        status_code=500, 
        detail=f"AI note generation failed across Groq models: {last_err}"
    )
