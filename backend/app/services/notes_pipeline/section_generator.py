import json
import logging
import os
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from groq import Groq
from app.core.config import settings
from app.services.notes_pipeline.note_planner import SectionBlueprint, NoteBlueprint

logger = logging.getLogger(__name__)

class GeneratedSectionBlock(BaseModel):
    block_type: str = Field(description="paragraph, heading_2, heading_3, callout, code, flashcard")
    content: str = Field(description="Content text or code snippet for this block")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="e.g. callout_type ('info', 'warning', 'tip'), language ('python'), front/back for flashcard")

class GeneratedSection(BaseModel):
    section_id: str
    title: str
    blocks: List[GeneratedSectionBlock]

def generate_section_content(
    blueprint: NoteBlueprint,
    section: SectionBlueprint,
    language: str = "en",
    source_text: str = ""
) -> GeneratedSection:
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY is not configured.")

    client = Groq(api_key=api_key)
    schema_json = json.dumps(GeneratedSection.model_json_schema(), indent=2)

    code_rule = "DO NOT generate programming code blocks. Generate text, formulas, or biological/chemical mechanisms."
    if section.requires_code and blueprint.is_cs_or_coding_topic:
        code_rule = "Include code blocks with syntax highlighting, algorithm explanations, and output complexity."

    prompt = f"""
    You are an expert university professor generating a single, highly detailed section of a study guide.
    
    NOTE TITLE: "{blueprint.title}"
    SECTION TITLE: "{section.title}"
    SECTION TYPE: "{section.section_type}"
    KEY POINTS TO COVER: {json.dumps(section.key_points_to_cover)}
    LANGUAGE: "{language}"
    
    CRITICAL RULES:
    1. Focus EXCLUSIVELY on generating deep, university-level content for this section.
    2. Write thorough, multi-paragraph text explaining mechanisms, definitions, and real-world examples in depth.
    3. {code_rule}
    4. If section_type is 'flashcard_set', generate 4 to 6 active-recall flashcard blocks with 'front' and 'back' in metadata.
    5. If section_type is 'exam_tips' or contains warnings, use 'callout' blocks with metadata callout_type 'warning' or 'tip'.
    
    Format output strictly as a JSON object matching this schema:
    {schema_json}

    Return ONLY raw JSON.
    """

    GROQ_CANDIDATE_MODELS = [settings.GROQ_MODEL, "llama-3.1-8b-instant", "mixtral-8x7b-32768"]

    last_err = None
    for model in GROQ_CANDIDATE_MODELS:
        try:
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an educational section generator. Always reply in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=4096
            )
            content = res.choices[0].message.content
            return GeneratedSection.model_validate_json(content)
        except Exception as e:
            logger.warning(f"Groq model {model} failed in section_generator: {e}")
            last_err = e

    raise last_err
