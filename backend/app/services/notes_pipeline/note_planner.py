import json
import logging
import os
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

class SectionBlueprint(BaseModel):
    id: str = Field(description="Unique section identifier e.g. sec_overview, sec_mechanisms")
    title: str = Field(description="Display title for the section")
    section_type: str = Field(description="overview, definition, key_concepts, deep_explanation, mechanism, visual_diagram, comparison, application, exam_tips, memory_tricks, flashcard_set, summary")
    key_points_to_cover: List[str] = Field(description="Key concepts or subtopics that MUST be thoroughly explained in this section")
    requires_code: bool = Field(default=False, description="Set to True ONLY IF the topic is computer science, programming, or software engineering!")
    requires_diagram: bool = Field(default=False, description="Set to True if this section needs a visual Mermaid diagram or flowchart")

class NoteBlueprint(BaseModel):
    title: str
    subject: str
    difficulty: str = Field(description="beginner, intermediate, advanced")
    estimated_reading_time: int = Field(description="Estimated reading time in minutes")
    estimated_study_time: int = Field(description="Estimated study time in minutes")
    is_cs_or_coding_topic: bool = Field(description="True ONLY if the topic is computer science, programming, or coding!")
    tags: List[str]
    learning_objectives: List[str]
    sections: List[SectionBlueprint]

def generate_note_blueprint(topic: str, subject_name: str = "", language: str = "en", source_text: str = "") -> NoteBlueprint:
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY is not configured.")

    client = Groq(api_key=api_key)
    schema_json = json.dumps(NoteBlueprint.model_json_schema(), indent=2)

    context = ""
    if source_text:
        context = f"Source Document Context:\n{source_text[:20000]}\n"

    prompt = f"""
    You are an expert Educational Curriculum Planner and Instructional Designer.
    Your task is to create a STAGE 1 STRUCTURAL BLUEPRINT for an exhaustive university-level study guide.
    
    TOPIC: "{topic}"
    SUBJECT CONTEXT: "{subject_name or 'General Academic'}"
    LANGUAGE PREFERENCE: "{language}"
    
    {context}
    
    CRITICAL RULES FOR STAGE 1 PLANNER:
    1. Do NOT generate educational content or text explanations!
    2. ONLY plan the structural architecture, section breakdown, and visual diagram requirements.
    3. Rule on `is_cs_or_coding_topic`: Set to True ONLY if "{topic}" is directly a computer science, programming, or software topic. For Biology, Medicine, History, Chemistry, Law, etc., set to False!
    4. Plan at least 8 to 12 distinct sections covering Overview, Core Definitions, Mechanisms, Visual Diagrams, Key Sub-Topics, Exam Warnings, Real-World Applications, and Flashcards.
    
    Format output strictly as a JSON object matching this schema:
    {schema_json}

    Do NOT include markdown backticks. Return ONLY raw JSON.
    """

    GROQ_CANDIDATE_MODELS = [settings.GROQ_MODEL, "llama-3.1-8b-instant", "mixtral-8x7b-32768"]

    last_err = None
    for model in GROQ_CANDIDATE_MODELS:
        try:
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a specialized curriculum planner that outputs structural blueprints in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=4096
            )
            content = res.choices[0].message.content
            return NoteBlueprint.model_validate_json(content)
        except Exception as e:
            logger.warning(f"Groq model {model} failed in note_planner: {e}")
            last_err = e

    raise last_err
