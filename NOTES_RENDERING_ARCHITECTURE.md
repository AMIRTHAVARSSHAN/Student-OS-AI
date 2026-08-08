# SCHOLAROS — ADVANCED AI VISUAL NOTES ENGINE
## STRUCTURED DOCUMENT RENDERING ARCHITECTURE & TECHNICAL SPECIFICATION

---

## 1. Executive Summary & Problem Statement

### 1.1 Current Notes Architecture
Currently, ScholarOS processes AI note requests by generating raw Markdown strings via Groq Llama 3.3 70B, which are stored as raw text in the `notes.content` PostgreSQL column. On the frontend, a custom Markdown parser line-splits strings to construct React elements.

### 1.2 Limitations of Markdown-First Rendering
1. **Lack of Structure & Semantic Depth**: Markdown is fundamentally a plain-text formatting language, unable to represent complex nested data types (e.g. interactive multi-axis Recharts, React Flow node networks, two-column comparison cards, interactive flashcards, or typed multi-choice quizzes).
2. **Brittle AI Output & Parsing Flakes**: Relying on regular expressions and line-splitting to extract diagrams (`mermaid`), math (`KaTeX`), and callouts leads to rendering glitches when the LLM strays from expected syntax.
3. **Impaired Interactivity**: Storing notes as static text prevents block-level granular selection, block-level AI contextual actions ("Explain this block", "Quiz me on this concept"), and real-time inline editing.
4. **Poor Mobile Responsiveness & Print/PDF Export**: Converting raw Markdown to DOM nodes results in uneven layouts, broken page splits in PDFs, blurred charts, and horizontal page overflow on small devices.

---

## 2. New Structured Architecture Overview

ScholarOS is migrating from a **Markdown-First** model to a **Structured Document Schema & Tiptap JSON Architecture**:

```
User Request / Topic
       ↓
AI Note Planner (Groq Llama 3.3 70B)
       ↓
Structured Note JSON (Pydantic Schema)
       ↓
ScholarOS Document Schema (Strict Typed JSON)
       ↓
Tiptap JSON Tree + Custom Extensions
       ↓
ScholarOS Interactive Renderer (Desktop / Tablet / Mobile)
       ↓
HTML / Native PDF Print Engine / Markdown Import-Export
```

Markdown is retained purely as an **Import / Export codec**. The canonical, persisted note state in the database is **Typed Tiptap-Compatible Document JSON**.

---

## 3. ScholarOS Document Schema

Every note document is validated against a strict JSON Schema before storage and rendering.

### 3.1 Supported Block Types
- `document`: Root node containing metadata (title, subtitle, subject, level, reading time).
- `heading`: Levels 1-4 with unique element IDs.
- `paragraph`: Standard text block supporting inline marks (bold, italic, code, math).
- `bulletList` & `orderedList`: Standard and numbered academic lists.
- `quote` & `callout`: Key academic insights with semantic intent (`info`, `tip`, `warning`, `danger`).
- `definition`: Key academic term definition card with pronunciation and context.
- `examTip`: High-yield exam focus area with probability badge.
- `memoryTrick`: Mnemonics and memory recall helpers.
- `commonMistake`: Known student pitfalls with correct vs. incorrect comparisons.
- `formula`: KaTeX block math formula with variable explanations.
- `code`: Syntax-highlighted code block with language badge, line numbers, line highlights, and copy action.
- `table`: Rich responsive table with mobile card-stack fallback.
- `chart`: Recharts dataset (Bar, Line, Pie, Area) with legend, axis labels, and dark-mode styling.
- `diagram`: Mermaid flowchart, sequence diagram, or cycle diagram.
- `mindmap`: Node-tree graph structure rendered via interactive canvas.
- `comparison`: Multi-column feature comparison card (e.g. DNA vs RNA).
- `flashcard`: Flip-card study review item with SM-2 confidence rating.
- `quiz`: Interactive multiple-choice question with instant feedback & explanation.
- `glossary`: Subject-specific key terms and definitions list.

---

## 4. Multi-Stage AI Generation Pipeline

The backend note generation pipeline utilizes Groq Llama 3.3 70B across structured JSON stages:

1. **Topic Analyzer & Note Planner**: Evaluates input parameters (topic, subject, target grade) and outputs a detailed `NoteBlueprint` JSON specifying section breakdown and required visual asset types.
2. **Structured Content Generator**: Generates section contents as typed JSON blocks (`heading`, `paragraph`, `callout`, `code`, `formula`, `comparison`).
3. **Visual Content Planner**: Generates structured data for complex visual elements (`chart` datasets, `diagram` Mermaid code, `mindmap` nodes, `quiz` items).
4. **Schema Validator & Tiptap Transformer**: Validates the complete document payload against `ScholarOSDocumentSchema` and converts it into canonical Tiptap JSON.

---

## 5. Tiptap Renderer & Extensions

The frontend renderer utilizes Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/core`) with custom extensions:
- **`CodeBlockExtension`**: Renders syntax-highlighted code via Lowlight/Prism with language tags, line numbers, and copy action.
- **`MathExtension`**: Renders inline `$ ... $` and block `$$ ... $$` math using KaTeX with "Copy Formula" and "Explain Formula" popovers.
- **`EducationalBlockExtension`**: Custom Tiptap nodes for `ExamTip`, `MemoryTrick`, `CommonMistake`, and `Definition`.
- **`ChartBlockExtension`**: Integrates Recharts components dynamically within the Tiptap node view.
- **`MindmapExtension`**: Interactive zoomable mindmap canvas inside document flow.
- **`ComparisonExtension`**: Desktop 2-column / Mobile stacked comparison cards.

---

## 6. Mobile & Desktop Responsive Design System

### Desktop Layout (>= 1024px)
- **3-Pane Workspace**: Collapsible Left Navigation, Centered Structured Document (max-w-4xl), Collapsible Right Table of Contents & AI Assistant Drawer.

### Mobile Layout (< 768px)
- **Single-Column Document**: Zero page-level horizontal overflow.
- **Internal Scrolling**: Code blocks, wide tables, and charts scroll horizontally *inside* their isolated container.
- **Stacked Cards**: Comparison blocks automatically convert from multi-column tables to stacked vertical cards.
- **Floating Action Bar**: Quick access to AI block actions, table of contents bottom sheet, and search.

---

## 7. Professional Native PDF & Print Engine

PDF export is powered by a dedicated HTML/CSS Print Engine (`@media print` and dedicated off-screen print layout):
- **Page Layout**: A4 / Letter format with configurable margins, running headers, and footers with page numbers.
- **Vector Crispness**: KaTeX equations, SVGs, charts, and Mermaid diagrams are rendered as high-DPI vector elements (no fuzzy raster screenshots).
- **Page-Break Controls**: Educational cards, code blocks, and diagrams include `break-inside: avoid` rules to prevent awkward multi-page splits.

---

## 8. Persistence, Migration & Security

- **Database Model**: Updates `notes` table with `tiptap_json` (JSONB / JSON) and `document_version` fields.
- **Migration Strategy**: Existing Markdown notes are converted on-the-fly via a robust Markdown-to-Tiptap JSON converter (`convertMarkdownToTiptapJson`) during retrieval, ensuring zero data loss.
- **Security & Sanitization**: AI JSON outputs are validated against Pydantic schemas on the backend and DOMPurify on the frontend. No raw `<script>` tags or unsafe HTML are rendered.

---

## 9. Verification & Testing Strategy

- **Backend Tests (Pytest)**: Unit tests for pipeline orchestrator, Pydantic schema validation, and Tiptap JSON converter.
- **Frontend Unit Tests (Vitest)**: Tests for `TiptapRenderer`, `CodeBlock`, `MathRenderer`, `RechartsBlock`, and `ComparisonBlock`.
- **End-to-End Tests (Playwright)**: Comprehensive viewport testing across 9 screen sizes (`320px` to `1920px`) verifying note creation, AI generation, editing, autosave, mobile zero-overflow, and PDF export.
