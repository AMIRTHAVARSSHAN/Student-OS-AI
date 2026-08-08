# 📋 SCHOLAROS — QA MASTER TEST PLAN & AUDIT MATRIX

**Target Deployed URL**: [https://student-os-ai-yd3a-teal.vercel.app/](https://student-os-ai-yd3a-teal.vercel.app/)

---

## 1. Application Architecture & Discovered Routes Map

```
ScholarOS Deployed App Map
├── / (Landing Page & Command Center)
├── /login (User Authentication & JWT Session Creation)
├── /register (New Student Account Creation)
├── /onboarding (AI Onboarding Chat Stream & Profile Memory)
├── /tutor (Persistent Tutor AI Workspaces & Session Hub)
│   └── /tutor/[sessionId] (Subject/Chapter Study Canvas & Socratic Tutors)
├── /notes (Knowledge Vault, AI Note Generator, OCR, Block Editor)
├── /study-plan (Adaptive Timetable, Exam Prep Blocks, Priority Schedule)
├── /attendance (Class Attendance Tracker & Safety Margin Calculator)
├── /analytics (Academic Progress, Mastery Radar, Knowledge Graph)
├── /connect (ScholarConnect Peer Network, Chat, Lounges, Whiteboard)
├── /settings (Academic Identity, Profile Avatar, Memory Inspector & Reset)
└── /admin (System Control Panel)
```

---

## 2. Test Execution Matrix (27 Critical User Journeys)

| Journey ID | Feature / Domain | Test Description | Expected Result | Severity Target |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Landing Page | Hero CTA, Navigation, Feature Cards | 0 Console/Network errors, clean layout | P4 |
| **TC-02** | Registration | New Student Account Creation (`qastudent_timestamp@scholartest.edu`) | 201 Created, Redirect to `/onboarding` | P0 |
| **TC-03** | Onboarding AI | Conversational AI Onboarding (`/api/v1/onboarding/chat-stream`) | AI streams welcome questions & completes profile | P0 |
| **TC-04** | Sign In | Auth with valid credentials & session JWT persistence | Access token saved in localStorage | P0 |
| **TC-05** | Protected Routes | Unauthenticated access attempt to `/tutor` | Redirects to `/login` | P1 |
| **TC-06** | Command Center | `Cmd+K` / `Ctrl+K` keypress modal trigger | Global search palette opens, 0 overflow | P2 |
| **TC-07** | Tutor AI Session | Create new study session ("Quantum Physics") | Session created with initial assets | P0 |
| **TC-08** | Tutor Chat Stream | Send prompt to AI Tutor (`/api/v1/tutor/chat`) | Groq Llama 3.3 70B streams response | P0 |
| **TC-09** | Educational Cards | Formatted cards (`CORE IDEA`, `EXAM FOCUS`, `COMMON MISTAKE`) | Rendered inside callout containers | P1 |
| **TC-10** | Action Chips | Touch-scroll single line chips (`Explain Simpler`, `Quiz`, `Mindmap`) | Action appends prompt to chat stream | P2 |
| **TC-11** | Knowledge Vault | Create manual note & retrieve note list | Note saved to database & displayed | P1 |
| **TC-12** | AI Note Pipeline | Generate 4-stage AI note (`/api/v1/notes/generate-ai`) | Structured blueprint & blocks generated | P1 |
| **TC-13** | Study Planner | Create semester exam plan & query today's blocks | Blocks generated across dates | P1 |
| **TC-14** | Attendance Tracker | Log present/absent classes & compute safety % | Safety margin & miss count calculated | P2 |
| **TC-15** | ScholarConnect | Friend request & peer network search | Connection created in database | P1 |
| **TC-16** | ScholarConnect Chat | Real-time chat message exchange between User A and B | Message delivered and persisted | P1 |
| **TC-17** | Memory Inspector | View weak topics & trigger memory reset (`DELETE /tutor/memory`) | Weak topics cleared in database | P2 |
| **TC-18** | Desktop Viewports | 1366x768, 1440x900, 1920x1080 | 0 Horizontal scroll, clean sidebars | P2 |
| **TC-19** | Mobile Viewports | 320x667, 360x800, 375x812, 390x844, 412x915, 430x932 | 0 Horizontal scroll, 6-dock bottom nav | P0 |
| **TC-20** | Input Accessibility | Chat input position above mobile bottom dock | Input stays visible above nav dock | P1 |

---

## 2. Automated Defect Classification Schema
- **P0 (Application Unusable)**: Crash on startup, authentication failure, broken API endpoint preventing main user flow.
- **P1 (Major Feature Broken)**: AI streaming failure, note creation failure, plan generation failure.
- **P2 (Significant UX/Layout Issue)**: Horizontal scrolling, element clipping, overlapping fixed headers/docks.
- **P3 (Minor Issue)**: Slight alignment discrepancy, missing loading spinner.
- **P4 (Cosmetic)**: Typo in helper text, subtle color mismatch.
