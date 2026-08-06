import logging
import asyncio
from typing import Dict, Any, List
from app.services.notes_pipeline.note_planner import generate_note_blueprint, NoteBlueprint
from app.services.notes_pipeline.section_generator import generate_section_content, GeneratedSection
from app.services.notes_pipeline.diagram_generator import generate_diagrams_for_note, GeneratedDiagram
from app.services.notes_pipeline.markdown_enhancer import enhance_and_assemble_markdown

logger = logging.getLogger(__name__)

def generate_full_enterprise_note(
    topic: str,
    subject_name: str = "",
    language: str = "en",
    source_text: str = ""
) -> Dict[str, Any]:
    logger.info(f"Starting Multi-Stage AI Notes Pipeline for topic: '{topic}'")

    # STAGE 1: Planner Blueprint
    logger.info("Executing Stage 1: Blueprint Planning...")
    blueprint = generate_note_blueprint(
        topic=topic,
        subject_name=subject_name,
        language=language,
        source_text=source_text
    )

    # STAGE 2: Section Generator
    logger.info(f"Executing Stage 2: Section Generation ({len(blueprint.sections)} sections)...")
    sections: List[GeneratedSection] = []
    for sec_bp in blueprint.sections:
        try:
            sec_content = generate_section_content(
                blueprint=blueprint,
                section=sec_bp,
                language=language,
                source_text=source_text
            )
            sections.append(sec_content)
        except Exception as e:
            logger.warning(f"Section generation failed for '{sec_bp.title}': {e}")

    # STAGE 3: Diagram Engine
    logger.info("Executing Stage 3: Diagram & Visual Assets Engine...")
    diagrams: List[GeneratedDiagram] = []
    try:
        diagrams = generate_diagrams_for_note(blueprint=blueprint, language=language)
    except Exception as e:
        logger.warning(f"Diagram generation failed: {e}")

    # STAGE 4: Markdown & KaTeX Enhancer
    logger.info("Executing Stage 4: Markdown Enhancement & Assembly...")
    full_markdown = enhance_and_assemble_markdown(
        blueprint=blueprint,
        sections=sections,
        diagrams=diagrams
    )

    # Convert sections and blocks into backend DB NoteBlock structure
    db_blocks = []
    order_counter = 0

    for sec in sections:
        # Section Heading Block
        db_blocks.append({
            "block_type": "heading_1",
            "content": {"title": sec.title, "text": sec.title},
            "order": order_counter
        })
        order_counter += 1

        for b in sec.blocks:
            content_dict = {}
            if b.block_type == "code":
                content_dict = {"code": b.content, "language": b.metadata.get("language", "python")}
            elif b.block_type == "callout":
                content_dict = {
                    "text": b.content,
                    "callout_type": b.metadata.get("callout_type", "info"),
                    "title": b.metadata.get("title", "Key Point")
                }
            elif b.block_type == "flashcard":
                content_dict = {
                    "front": b.metadata.get("front", b.content),
                    "back": b.metadata.get("back", "")
                }
            else:
                content_dict = {"text": b.content}

            db_blocks.append({
                "block_type": b.block_type,
                "content": content_dict,
                "order": order_counter
            })
            order_counter += 1

    # Add Mermaid diagrams to db_blocks
    for diag in diagrams:
        if diag.mermaid_code:
            db_blocks.append({
                "block_type": "mermaid",
                "content": {"code": diag.mermaid_code, "title": diag.title},
                "order": order_counter
            })
            order_counter += 1

    return {
        "blueprint": blueprint,
        "sections": sections,
        "diagrams": diagrams,
        "full_markdown": full_markdown,
        "db_blocks": db_blocks
    }
