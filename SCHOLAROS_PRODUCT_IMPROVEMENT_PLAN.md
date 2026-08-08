# 🧠 SCHOLAROS — MASTER PRODUCT IMPROVEMENT & HARDENING PLAN

## 1. Executive Summary & Core Product Principle

**ScholarOS** is **NOT a chatbot** and **NOT a collection of isolated dashboards**. It is an **AI Academic Operating System** built to empower students throughout their entire university and school journey.

Every capability in ScholarOS revolves around one unified architecture:

```
                SCHOLAROS ACADEMIC BRAIN
                         |
          +--------------+--------------+
          |              |              |
        LEARN          PLAN          CONNECT
          |              |              |
        Tutor          Planner        Friends
        Notes          Exams          Chat
        Quiz           Tasks          Groups
        Mindmaps       Calendar       Sharing
          |
          +------ Knowledge Graph
                         |
                  Academic Memory
                         |
                  Student Progress
```

---

## 2. Current Architecture
- **Frontend**: Next.js 15 (App Router), React 19, React Query, Tailwind CSS, Lucide Icons, Framer Motion, KaTeX, Mermaid.js.
- **Backend**: FastAPI (Python 3.14), SQLAlchemy 2.0 Async, Pydantic v2, Uvicorn, Asyncpg, Upstash Redis REST.
- **Database**: PostgreSQL with `pgvector` extension support on Supabase.
- **Primary AI Provider**: Groq API (`llama-3.3-70b-versatile`). Single unified LLM backend.

---

## 3. Current Features & Capabilities
- **Tutor AI Brain**: Multi-persona persistent tutoring, active Socratic tuition loops, streaming chat responses, session history persistence in Redis & SQL `SessionAsset`.
- **Notes Vault & Pipeline**: 4-stage structured AI note generation (Planner -> Section Generator -> Diagram Engine -> Markdown/KaTeX Enhancer), block-based notes, OCR scanner, PDF exports.
- **ScholarConnect**: Friend requests, E2EE-ready real-time messaging, shared artifact cards (Notes, PDFs, Quizzes, Flashcards, Mindmaps), study lounges, voice rooms, shared whiteboard, CRDT collab editor.
- **Study Planner & Attendance**: Adaptive study block generation, priority scheduling, threshold-based attendance tracking & "can miss" safety score calculation.
- **Analytics & Knowledge Graph**: Mastery radar, concept node graphs, study streak counters.

---

## 4. Current Bugs & Audits (P0, P1, P2, P3)

### P0 — Critical (Immediate Stability & Crash Prevention)
- [x] **P0-1**: Async SQLAlchemy `DetachedInstanceError` in `notes.py` when returning newly created notes -> *Resolved with `selectinload(Note.blocks)`*.
- [x] **P0-2**: Render deployment container crash due to `ConnectionRefusedError` during startup DB schema creation -> *Resolved with host preservation and `BaseException` handling in `main.py`*.
- [ ] **P0-3**: Command Center (`Cmd+K`) missing global search modal handler -> *Implement Cmd+K command palette*.

### P1 — High Priority (Core Experience & Data Integrity)
- [ ] **P1-1**: Academic Memory extraction rules -> Upgrade `AcademicMemory` to log extracted weak/strong concepts, quiz scores, and mistakes automatically after every study session.
- [ ] **P1-2**: Unify Command Center search across Notes, PDFs, Subjects, Sessions, Quizzes, and Connect Friends.
- [ ] **P1-3**: Structured Educational Responses in Tutor AI (Core Idea, Explanation, Visual, Exam Focus, Memory Trick, Common Mistake, Test Yourself).

### P2 — Medium Priority (Usability & Workspace Integration)
- [ ] **P2-1**: Enhanced Empty States across Vault, Study Plan, Attendance, and ScholarConnect.
- [ ] **P2-2**: Meaningful Loading States (*"Restoring your academic memory...", "Searching your notes..."*).
- [ ] **P2-3**: Command palette shortcuts and visible keyboard focus for accessibility.

### P3 — Polish & Aesthetics
- [ ] **P3-1**: Smooth Framer Motion page & modal transitions.
- [ ] **P3-2**: Refine 8pt spacing system tokens and dark glassmorphism styling.

---

## 5. UI/UX & Mobile Audit Summary
- **Mobile Viewports**: Tested & enforced zero horizontal overflow across 320px, 360px, 375px, 390px, 412px, 430px, 768px.
- **Navigation**: Floating 6-dock bottom navigation (`Home`, `Tutor`, `Study Plan`, `Notes`, `Connect`, `Settings`) with 48px minimum touch targets and safe area padding.
- **Tutor Chat**: Pinned input bar above bottom dock, single-line horizontal touch-scroll action chips, max-w 90%/75% message bubbles.

---

## 6. Information Architecture & Navigation

```
ScholarOS Root
├── / (Dashboard Command Center)
├── /tutor (Tutor AI Brain & Active Study Workspaces)
│   └── /tutor/[sessionId] (Subject/Chapter Study Canvas)
├── /study-plan (Adaptive Planner, Timetable, Exams)
├── /notes (Knowledge Vault, AI Note Generator, OCR, Reader)
├── /connect (ScholarConnect Peer Network, Chat, Lounges, Whiteboard)
├── /attendance (Class Attendance Tracker & Safety Calculator)
├── /analytics (Academic Progress, Mastery Radar, Knowledge Graph)
├── /settings (Academic Profile, Preferences, Memory Inspector)
└── /admin (System Control Panel)
```

---

## 7. Design System Tokens (Dark-First)
- `var(--surface-0)`: `#0a0a0b` (Deep Space Background)
- `var(--surface-1)`: `#121215` (Panel & Card Surface)
- `var(--surface-2)`: `#1a1a20` (Hover & Sub-element Surface)
- `var(--brand-primary)`: `hsl(250, 80%, 60%)` (Scholar Indigo)
- `var(--status-success)`: `hsl(142, 71%, 45%)` (Emerald)
- `var(--status-warning)`: `hsl(38, 92%, 50%)` (Amber)
- `var(--status-error)`: `hsl(0, 84%, 60%)` (Rose)

---

## 8. Implementation Roadmap (Phases 1 - 9)

- **Phase 1 (Completed)**: Core P0 stability, Render deployment fix, mobile UI/UX zero-overflow dock.
- **Phase 2**: Command Center (`Cmd+K` global search palette across notes, subjects, sessions, friends).
- **Phase 3**: Tutor AI structured educational response formatting & Socratic modes.
- **Phase 4**: Academic memory extraction rules & Memory Inspector in Settings.
- **Phase 5**: Notes pipeline enhancement & PDF export polish.
- **Phase 6**: ScholarConnect workspace unification.
- **Phase 7**: Accessible loading/empty states & error recovery.
- **Phase 8**: Performance optimization & bundle check.
- **Phase 9**: Final verification and `FINAL_PRODUCT_AUDIT.md`.
