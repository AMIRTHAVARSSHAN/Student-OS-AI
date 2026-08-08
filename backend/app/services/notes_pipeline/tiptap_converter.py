import re
from typing import Dict, Any, List

def convert_markdown_to_tiptap_json(markdown_text: str, title: str = "") -> Dict[str, Any]:
    """
    Converts raw Markdown text or legacy note content into a canonical Tiptap Document JSON tree.
    Guarantees that existing notes are seamlessly migrated to structured documents.
    """
    if not markdown_text:
        return {
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [{"type": "text", "text": "Empty document."}]
                }
            ]
        }

    lines = markdown_text.split("\n")
    tiptap_nodes: List[Dict[str, Any]] = []

    in_code = False
    code_lang = "python"
    code_buffer: List[str] = []

    for line in lines:
        stripped = line.strip()

        # Handle Code Blocks ```
        if stripped.startswith("```"):
            if in_code:
                code_text = "\n".join(code_buffer)
                if code_lang.lower() == "mermaid":
                    tiptap_nodes.append({
                        "type": "diagram",
                        "attrs": {
                            "mermaidCode": code_text,
                            "title": "Concept Diagram"
                        }
                    })
                else:
                    tiptap_nodes.append({
                        "type": "codeBlock",
                        "attrs": {"language": code_lang or "python"},
                        "content": [{"type": "text", "text": code_text}]
                    })
                code_buffer = []
                in_code = False
                code_lang = "python"
            else:
                in_code = True
                code_lang = stripped[3:].strip() or "python"
            continue

        if in_code:
            code_buffer.append(line)
            continue

        if not stripped:
            continue

        # Handle Math Block $$ ... $$
        if stripped.startswith("$$") and stripped.endswith("$$") and len(stripped) > 4:
            raw_math = stripped[2:-2].strip()
            tiptap_nodes.append({
                "type": "formula",
                "attrs": {
                    "latex": raw_math,
                    "explanation": "Mathematical Formula"
                }
            })
            continue

        # Headings
        if stripped.startswith("# "):
            tiptap_nodes.append({
                "type": "heading",
                "attrs": {"level": 1},
                "content": parse_inline_text(stripped[2:])
            })
            continue
        if stripped.startswith("## "):
            tiptap_nodes.append({
                "type": "heading",
                "attrs": {"level": 2},
                "content": parse_inline_text(stripped[3:])
            })
            continue
        if stripped.startswith("### "):
            tiptap_nodes.append({
                "type": "heading",
                "attrs": {"level": 3},
                "content": parse_inline_text(stripped[4:])
            })
            continue
        if stripped.startswith("#### "):
            tiptap_nodes.append({
                "type": "heading",
                "attrs": {"level": 4},
                "content": parse_inline_text(stripped[5:])
            })
            continue

        # Educational Callouts
        if stripped.startswith("CORE IDEA:") or stripped.startswith("💡 CORE IDEA:"):
            text_val = re.sub(r"^.*CORE IDEA:\s*", "", stripped, flags=re.IGNORECASE)
            tiptap_nodes.append({
                "type": "callout",
                "attrs": {"calloutType": "info", "title": "CORE IDEA"},
                "content": [{"type": "paragraph", "content": parse_inline_text(text_val)}]
            })
            continue
        if stripped.startswith("EXAM FOCUS:") or stripped.startswith("🎯 EXAM FOCUS:"):
            text_val = re.sub(r"^.*EXAM FOCUS:\s*", "", stripped, flags=re.IGNORECASE)
            tiptap_nodes.append({
                "type": "examTip",
                "attrs": {"title": "EXAM FOCUS", "text": text_val}
            })
            continue
        if stripped.startswith("COMMON MISTAKE:") or stripped.startswith("⚠️ COMMON MISTAKE:"):
            text_val = re.sub(r"^.*COMMON MISTAKE:\s*", "", stripped, flags=re.IGNORECASE)
            tiptap_nodes.append({
                "type": "commonMistake",
                "attrs": {"pitfall": text_val, "correction": "Carefully double-check formulas and key concepts."}
            })
            continue
        if stripped.startswith("TEST YOURSELF:") or stripped.startswith("❓ TEST YOURSELF:"):
            text_val = re.sub(r"^.*TEST YOURSELF:\s*", "", stripped, flags=re.IGNORECASE)
            tiptap_nodes.append({
                "type": "quiz",
                "attrs": {
                    "question": text_val,
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "explanation": "Review the section summary above."
                }
            })
            continue

        # Blockquote / Note
        if stripped.startswith("> "):
            quote_text = stripped[2:].strip()
            tiptap_nodes.append({
                "type": "blockquote",
                "content": [{"type": "paragraph", "content": parse_inline_text(quote_text)}]
            })
            continue

        # Bullet List
        if stripped.startswith("- ") or stripped.startswith("* "):
            tiptap_nodes.append({
                "type": "bulletList",
                "content": [
                    {
                        "type": "listItem",
                        "content": [{"type": "paragraph", "content": parse_inline_text(stripped[2:])}]
                    }
                ]
            })
            continue

        # Standard Paragraph
        tiptap_nodes.append({
            "type": "paragraph",
            "content": parse_inline_text(line)
        })

    return {
        "type": "doc",
        "content": tiptap_nodes or [{"type": "paragraph", "content": [{"type": "text", "text": markdown_text}]}]
    }

def parse_inline_text(text: str) -> List[Dict[str, Any]]:
    """
    Parses inline markdown (*italic*, **bold**, `code`, $math$) into Tiptap text nodes with marks.
    """
    if not text:
        return []

    parts = re.split(r"(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$)", text)
    result = []

    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            result.append({
                "type": "text",
                "text": part[2:-2],
                "marks": [{"type": "bold"}]
            })
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            result.append({
                "type": "text",
                "text": part[1:-1],
                "marks": [{"type": "italic"}]
            })
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            result.append({
                "type": "text",
                "text": part[1:-1],
                "marks": [{"type": "code"}]
            })
        elif part.startswith("$") and part.endswith("$") and len(part) > 2:
            result.append({
                "type": "text",
                "text": part[1:-1],
                "marks": [{"type": "math"}]
            })
        else:
            result.append({
                "type": "text",
                "text": part
            })

    return result or [{"type": "text", "text": text}]
