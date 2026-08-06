import json
import logging
import os
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from groq import Groq
from app.core.config import settings
from app.services.notes_pipeline.note_planner import NoteBlueprint

logger = logging.getLogger(__name__)

class GeneratedDiagram(BaseModel):
    diagram_type: str = Field(description="flowchart, mindmap, sequence, timeline, architecture, comparison_table")
    title: str = Field(description="Title of the diagram or chart")
    mermaid_code: Optional[str] = Field(None, description="Valid Mermaid.js diagram syntax (e.g. graph TD...)")
    comparison_data: Optional[Dict[str, Any]] = Field(None, description="Structured data for comparison tables: {'headers': [...], 'rows': [...]}")

def generate_diagrams_for_note(
    blueprint: NoteBlueprint,
    language: str = "en"
) -> List[GeneratedDiagram]:
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY is not configured.")

    client = Groq(api_key=api_key)
    
    class DiagramSet(BaseModel):
        diagrams: List[GeneratedDiagram]

    schema_json = json.dumps(DiagramSet.model_json_schema(), indent=2)

    prompt = f"""
    You are an expert Educational Visual Designer.
    Generate high-impact visual diagrams (Mermaid.js) and comparison cards for the topic: "{blueprint.title}".
    Subject: "{blueprint.subject}"
    Language: "{language}"
    
    CRITICAL RULES FOR DIAGRAM GENERATION:
    1. NEVER generate ASCII art diagrams.
    2. Generate at least 2 distinct visual diagrams using valid Mermaid.js syntax (e.g. `graph TD` or `sequenceDiagram` or `timeline` or `mindmap`).
    3. Ensure Mermaid syntax is 100% syntactically valid with clean node labels.
    4. Generate at least 1 structured comparison card / table comparing key opposing concepts or methods in this topic.
    
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
                    {"role": "system", "content": "You are a specialized Mermaid diagram & comparison generator. Always reply in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=4096
            )
            content = res.choices[0].message.content
            result_set = DiagramSet.model_validate_json(content)
            return result_set.diagrams
        except Exception as e:
            logger.warning(f"Groq model {model} failed in diagram_generator: {e}")
            last_err = e

    raise last_err
