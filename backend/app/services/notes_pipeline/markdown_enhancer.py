import logging
from typing import List
from app.services.notes_pipeline.note_planner import NoteBlueprint
from app.services.notes_pipeline.section_generator import GeneratedSection
from app.services.notes_pipeline.diagram_generator import GeneratedDiagram

logger = logging.getLogger(__name__)

def enhance_and_assemble_markdown(
    blueprint: NoteBlueprint,
    sections: List[GeneratedSection],
    diagrams: List[GeneratedDiagram]
) -> str:
    md = []
    
    # Metadata Header
    md.append(f"# {blueprint.title}\n")
    md.append(f"**Subject:** {blueprint.subject} | **Difficulty:** {blueprint.difficulty.title()} | **Reading Time:** {blueprint.estimated_reading_time} mins | **Study Time:** {blueprint.estimated_study_time} mins\n")
    
    if blueprint.tags:
        tags_str = " ".join([f"`#{t}`" for t in blueprint.tags])
        md.append(f"**Tags:** {tags_str}\n")
        
    md.append("---\n")

    # Learning Objectives
    if blueprint.learning_objectives:
        md.append("## 🎯 Learning Objectives\n")
        for obj in blueprint.learning_objectives:
            md.append(f"- {obj}")
        md.append("\n---\n")

    # Sections Assembly
    for sec in sections:
        md.append(f"## {sec.title}\n")
        for block in sec.blocks:
            b_type = block.block_type
            content = block.content
            meta = block.metadata or {}

            if b_type == "heading_2":
                md.append(f"### {content}\n")
            elif b_type == "heading_3":
                md.append(f"#### {content}\n")
            elif b_type == "callout":
                c_type = (meta.get("callout_type") or "info").upper()
                c_title = meta.get("title") or "Key Note"
                md.append(f"> **{c_type}: {c_title}**\n> {content}\n")
            elif b_type == "code":
                lang = meta.get("language") or "python"
                md.append(f"```{lang}\n{content}\n```\n")
            elif b_type == "flashcard":
                front = meta.get("front") or content
                back = meta.get("back") or ""
                md.append(f"**🎴 Flashcard**\n- **Q**: {front}\n- **A**: {back}\n")
            else:
                md.append(f"{content}\n")

    # Diagrams & Visual Assets Assembly
    if diagrams:
        md.append("\n---\n## 📊 Visual Diagrams & Comparative Analysis\n")
        for diag in diagrams:
            md.append(f"### {diag.title}\n")
            if diag.mermaid_code:
                md.append(f"```mermaid\n{diag.mermaid_code.strip()}\n```\n")
            elif diag.comparison_data:
                headers = diag.comparison_data.get("headers", ["Feature", "Option A", "Option B"])
                rows = diag.comparison_data.get("rows", [])
                md.append("| " + " | ".join(headers) + " |")
                md.append("| " + " | ".join(["---"] * len(headers)) + " |")
                for row in rows:
                    if isinstance(row, list):
                        md.append("| " + " | ".join([str(r) for r in row]) + " |")
                md.append("\n")

    # Revision Summary
    md.append("\n---\n## 📝 High-Yield Revision Sheet\n")
    md.append(f"- **Key Takeaway**: Master the core definitions, workflow mechanisms, and exam revision flashcards for {blueprint.title}.")

    return "\n\n".join(md)
