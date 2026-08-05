# ScholarOS — Implementation Plan

> **Version:** 1.0.0  
> **Status:** Pre-Implementation Design Document  
> **Classification:** Internal Engineering — Single Source of Truth  
> **Last Updated:** 2026-08-04  
> **Authors:** Staff Architecture Team  

---

## Table of Contents

1. [Vision](#1-vision)
2. [Mission](#2-mission)
3. [Product Philosophy](#3-product-philosophy)
4. [Core Principles](#4-core-principles)
5. [Target Users](#5-target-users)
6. [User Personas](#6-user-personas)
7. [User Journeys](#7-user-journeys)
8. [Competitive Analysis](#8-competitive-analysis)
9. [Feature Comparison](#9-feature-comparison)
10. [Future Vision](#10-future-vision)
11. [Business Architecture](#11-business-architecture)
12. [Technical Architecture](#12-technical-architecture)
13. [AI Architecture](#13-ai-architecture)
14. [Gemini Tool Calling Architecture](#14-gemini-tool-calling-architecture)
15. [Frontend Architecture](#15-frontend-architecture)
16. [Backend Architecture](#16-backend-architecture)
17. [Database Architecture](#17-database-architecture)
18. [Caching](#18-caching)
19. [Background Workers](#19-background-workers)
20. [API Architecture](#20-api-architecture)
21. [Authentication](#21-authentication)
22. [Authorization](#22-authorization)
23. [Storage](#23-storage)
24. [Synchronization](#24-synchronization)
25. [Offline First](#25-offline-first)
26. [PWA](#26-pwa)
27. [Mobile Strategy](#27-mobile-strategy)
28. [Desktop Strategy](#28-desktop-strategy)
29. [Accessibility](#29-accessibility)
30. [Animations](#30-animations)
31. [Modern UI](#31-modern-ui)
32. [Design System](#32-design-system)
33. [Typography](#33-typography)
34. [Spacing](#34-spacing)
35. [Colors](#35-colors)
36. [Icons](#36-icons)
37. [Components](#37-components)
38. [Every Screen](#38-every-screen)
39. [Navigation](#39-navigation)
40. [Information Architecture](#40-information-architecture)
41. [Voice Assistant](#41-voice-assistant)
42. [Tamil](#42-tamil)
43. [English](#43-english)
44. [Tanglish](#44-tanglish)
45. [Streaming Voice](#45-streaming-voice)
46. [Conversation Memory](#46-conversation-memory)
47. [AI Personality](#47-ai-personality)
48. [Prompt Engineering](#48-prompt-engineering)
49. [Function Calling](#49-function-calling)
50. [Agent Architecture](#50-agent-architecture)
51. [Study Planner](#51-study-planner)
52. [Attendance](#52-attendance)
53. [Notes](#53-notes)
54. [Assignments](#54-assignments)
55. [Exam Predictor](#55-exam-predictor)
56. [Timetable](#56-timetable)
57. [Notifications](#57-notifications)
58. [Calendar](#58-calendar)
59. [PDF Reader](#59-pdf-reader)
60. [OCR](#60-ocr)
61. [Knowledge Base](#61-knowledge-base)
62. [Search](#62-search)
63. [Semantic Search](#63-semantic-search)
64. [RAG](#64-rag)
65. [Embeddings](#65-embeddings)
66. [Analytics](#66-analytics)
67. [Monitoring](#67-monitoring)
68. [Logging](#68-logging)
69. [Error Handling](#69-error-handling)
70. [Security](#70-security)
71. [Privacy](#71-privacy)
72. [Encryption](#72-encryption)
73. [Testing Strategy](#73-testing-strategy)
74. [CI/CD](#74-cicd)
75. [Deployment](#75-deployment)
76. [Cloud Architecture](#76-cloud-architecture)
77. [Scaling](#77-scaling)
78. [Performance](#78-performance)
79. [Optimization](#79-optimization)
80. [Cost Optimization](#80-cost-optimization)
81. [Folder Structure](#81-folder-structure)
82. [Coding Standards](#82-coding-standards)
83. [Naming Conventions](#83-naming-conventions)
84. [Git Workflow](#84-git-workflow)
85. [Milestones](#85-milestones)
86. [Roadmap](#86-roadmap)
87. [MVP](#87-mvp)
88. [Production](#88-production)
89. [Enterprise](#89-enterprise)
90. [Future Features](#90-future-features)

---

## 1. Vision

ScholarOS is the operating system for the modern student. Not another note-taking app. Not another LMS wrapper. An intelligent, adaptive environment that understands every educational domain — from NEET biology to CA accountancy to UPSC governance — and provides a single AI brain that orchestrates every aspect of academic life.

The vision is a world where every student, regardless of field, institution, or economic background, has access to an AI-powered academic copilot that plans their study sessions, predicts their exam outcomes, manages their attendance, reads their PDFs, takes their notes, and speaks to them in their own language — Tamil, English, or Tanglish.

ScholarOS replaces the fragmented ecosystem of 12+ disconnected apps (Google Classroom for assignments, Notion for notes, Anki for flashcards, Google Calendar for scheduling, a random attendance tracker, WhatsApp groups for doubt clearing) with one unified intelligence layer.

**The North Star Metric:** Measurable improvement in academic outcomes for every active user within 30 days of adoption.

---

## 2. Mission

To build the most advanced, AI-native academic operating system that serves 20 million students across every educational discipline in India and globally. ScholarOS will be the single application a student opens every morning and the last one they close at night — because it contains their entire academic life, powered by one intelligent brain.

**Mission Constraints:**
- One AI model (Google Gemini 2.5 Flash). No model sprawl.
- One codebase. Cross-platform via PWA + Capacitor.
- Tamil-first voice. English and Tanglish equally supported.
- Offline-capable. Students in rural Tamil Nadu with intermittent connectivity must have full functionality.
- Free tier must be genuinely useful. Monetization through premium features, not paywalls on basics.

---

## 3. Product Philosophy

### 3.1 One Brain, Many Tools

The central architectural philosophy is that Gemini 2.5 Flash is the single reasoning engine. It does not generate UIs. It does not serve static data. It reasons about a student's context and invokes tools — functions that perform discrete operations like creating a study plan, calculating attendance percentages, searching notes, or generating flashcards. The AI is the conductor. The tools are the orchestra.

### 3.2 The Student is the Center

Every feature must pass the "Student Test": Does this reduce cognitive load? Does this save time? Does this improve learning outcomes? If a feature exists only to impress engineers or investors, it does not ship.

### 3.3 Invisible Complexity

The system must feel as simple as Apple Notes on the surface. The complexity — spaced repetition algorithms, Bloom's taxonomy classification, semantic search, attendance prediction — operates entirely beneath the surface. A first-year arts student and a final-year engineering student should both feel that the app was built specifically for them.

### 3.4 Progressive Disclosure

Show the student only what they need, when they need it. The onboarding flow captures their field, institution, subjects, and exam schedule. From that moment forward, the entire interface adapts. A medical student sees anatomy flashcards and NEET prep. A law student sees case briefs and moot court schedules. No generic dashboards.

### 3.5 Respectful AI

The AI never pretends to be human. It never generates false information and presents it as fact. It always cites sources. It admits uncertainty. It asks clarifying questions rather than guessing. It respects the student's autonomy — it suggests, it does not dictate.

---

## 4. Core Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Single Model Discipline** | All AI capabilities flow through Google Gemini 2.5 Flash via Tool Calling. No secondary models, no model routing, no ensemble approaches. |
| 2 | **Offline First** | Every core feature must function without network connectivity. Sync when available, never block on network. |
| 3 | **Universal Education** | The system must support any educational field — not just STEM. Arts, law, commerce, medicine, civil services, and vocational training are first-class citizens. |
| 4 | **Evidence-Based Learning** | Study planning, spaced repetition, and exam prediction are grounded in educational psychology research (Ebbinghaus, Bloom, Leitner). Not heuristics. Not guesswork. |
| 5 | **Privacy by Default** | Student data is the student's property. End-to-end encryption for notes. No data selling. No behavioral advertising. GDPR and India DPDP Act compliant. |
| 6 | **Performance Budget** | First Contentful Paint under 1.2s. Time to Interactive under 2.5s. API p99 latency under 200ms. AI response streaming begins under 500ms. |
| 7 | **Language Equity** | Tamil, English, and Tanglish are not afterthoughts. They are built into every prompt, every UI string, every voice interaction from day one. |
| 8 | **Accessibility** | WCAG 2.2 AA compliance. Screen reader support. Keyboard-navigable. High contrast mode. Reduced motion support. |
| 9 | **Composability** | Every backend capability is a tool. Tools can be composed by the AI. New features are new tools, not new models. |
| 10 | **Ship Quality** | No feature ships without automated tests, accessibility audit, performance benchmark, and security review. |

---

## 5. Target Users

### 5.1 Primary Segments

| Segment | Age Range | Education Level | Key Needs |
|---------|-----------|----------------|-----------|
| School Students | 14-17 | Classes 9-12 (CBSE, State Board, ICSE) | Board exam prep, timetable management, parent-friendly progress reports |
| College Undergrads | 17-22 | BA, BSc, BCom, BBA, BCA | Attendance tracking, assignment management, semester exam prep |
| Engineering Students | 17-22 | BTech, BE, Diploma | Lab reports, coding assignments, GATE prep, placement prep |
| Medical Students | 17-24 | MBBS, BDS, BAMS, Nursing | NEET prep, anatomy/physiology memorization, clinical rotation schedules |
| Commerce Students | 17-22 | BCom, BBA, CA Foundation | Accountancy practice, CA/CMA exam prep, financial statement analysis |
| Arts and Humanities | 17-22 | BA English, History, Political Science | Essay writing, source citation, case study analysis |
| Law Students | 17-24 | LLB, BA-LLB | Case law memorization, moot court prep, legal research |
| MBA Students | 22-30 | MBA, PGDM | Case study analysis, group project coordination, placement prep |
| Competitive Exam Aspirants | 18-32 | UPSC, SSC, Banking, TNPSC | Long-term study planning, current affairs, previous year analysis |
| JEE Aspirants | 15-19 | JEE Main, JEE Advanced | Physics/Chemistry/Math problem solving, mock test analysis |
| NEET Aspirants | 15-19 | NEET UG | Biology/Chemistry/Physics MCQ practice, NCERT mastery |
| CA Aspirants | 18-28 | CA Foundation, Inter, Final | Accounting standards, audit procedures, tax law updates |

### 5.2 Geographic Focus

- **Primary:** Tamil Nadu, India (Tamil language support differentiator)
- **Secondary:** Pan-India (English + Hindi in future phases)
- **Tertiary:** Global English-speaking student markets

### 5.3 Device Distribution (India Student Market)

| Device | Estimated Share | Implications |
|--------|----------------|--------------|
| Android Phone (Budget) | 65% | PWA must perform on 2GB RAM devices. No heavy client-side processing. |
| Android Phone (Mid-range) | 20% | Smooth animations, full voice support. |
| Laptop/Desktop | 10% | Full keyboard shortcuts, split-pane layouts, desktop-class PDF reader. |
| iOS | 3% | Capacitor build for App Store. Full feature parity. |
| Tablet | 2% | Adaptive layouts, split view support. |

---

## 6. User Personas

### 6.1 Persona: Priya — Engineering Student

| Attribute | Detail |
|-----------|--------|
| **Name** | Priya Ramanathan |
| **Age** | 20 |
| **Location** | Coimbatore, Tamil Nadu |
| **Education** | 3rd year, BTech Computer Science |
| **Device** | Redmi Note 12 (Android), occasional laptop |
| **Language** | Tanglish (switches between Tamil and English mid-sentence) |
| **Pain Points** | Tracks attendance on paper, forgets assignment deadlines, uses 6 apps for studying, cannot find old notes, poor internet in hostel |
| **Goals** | Maintain 75% attendance, score 8.5+ CGPA, clear GATE, get placed |
| **Tech Comfort** | High. Uses Notion, ChatGPT, YouTube. |
| **Quote** | "I spend more time organizing my study life than actually studying." |

**Priya's Day with ScholarOS:**
1. 7:00 AM — Voice assistant (Tanglish): "Good morning Priya! You have Data Structures at 9. Your attendance is at 73% — go today to stay safe. Also, your DBMS assignment is due tomorrow."
2. 9:00 AM — Marks attendance with one tap. Lecture auto-tracked.
3. 10:30 AM — Photographs whiteboard notes. OCR extracts text, auto-files under "Data Structures > Unit 3."
4. 2:00 PM — Opens PDF reader, highlights key concepts. AI generates flashcards from highlights.
5. 6:00 PM — Study planner: "Based on your exam in 18 days, focus on Unit 2 and 4 today. Here is a 90-minute session plan."
6. 9:00 PM — Asks voice assistant: "Explain B+ trees in Tamil." Gets streaming voice response with visual diagram.
7. 10:00 PM — Reviews daily analytics: 4 hours studied, 23 flashcards reviewed, attendance at 74%.

### 6.2 Persona: Karthik — NEET Aspirant

| Attribute | Detail |
|-----------|--------|
| **Name** | Karthik Selvam |
| **Age** | 17 |
| **Location** | Madurai, Tamil Nadu |
| **Education** | Class 12, State Board + NEET coaching |
| **Device** | Samsung Galaxy M13 (budget Android) |
| **Language** | Tamil primary, English for technical terms |
| **Pain Points** | Overwhelmed by syllabus volume, no systematic revision schedule, cannot afford premium apps, weak in organic chemistry |
| **Goals** | Score 600+ in NEET, get into a government medical college |
| **Tech Comfort** | Moderate. Uses YouTube and WhatsApp groups. |
| **Quote** | "I study 10 hours a day but I do not know if I am studying the right things." |

**Karthik's Day with ScholarOS:**
1. 5:30 AM — Study planner: "Biology: Genetics (Chapter 5). You scored 45% on the last practice test for this topic. Focus on Mendelian exceptions."
2. 8:00 AM — Coaching class. Opens app after class, voice dictates key points. AI organizes into structured notes.
3. 12:00 PM — 30-minute spaced repetition session. App surfaces Organic Chemistry reactions due for review (SM-2 algorithm).
4. 3:00 PM — Takes a 50-question mock test. Exam predictor: "Current trajectory: 520. To reach 600, improve Organic Chemistry accuracy from 40% to 65%."
5. 6:00 PM — Asks AI: "Compare mitosis and meiosis with a table." Gets instant structured response.
6. 9:00 PM — Reviews weak topics flagged by analytics. AI generates 10 targeted MCQs.

### 6.3 Persona: Meena — Arts College Student

| Attribute | Detail |
|-----------|--------|
| **Name** | Meena Devi |
| **Age** | 19 |
| **Location** | Thanjavur, Tamil Nadu |
| **Education** | 2nd year, BA Tamil Literature |
| **Device** | Realme C55 (budget Android) |
| **Language** | Tamil only |
| **Pain Points** | No digital tools support Tamil-medium education, handwritten notes get lost, no structured exam prep for arts subjects, feels left out of the AI revolution |
| **Goals** | Score first class, prepare for TNPSC Group 2 |
| **Tech Comfort** | Low. Primarily WhatsApp and Instagram. |
| **Quote** | "All these AI apps are in English and for engineering students. Nothing works for me." |

**Meena's Day with ScholarOS:**
1. Full Tamil UI. Voice assistant speaks in natural Tamil.
2. Takes notes in Tamil. AI organizes and creates summaries.
3. Exam prep generates questions from Tamil literature syllabus.
4. TNPSC current affairs module provides daily Tamil news summaries.
5. Study planner works with her semester schedule, not a generic template.

### 6.4 Persona: Rajesh — CA Aspirant

| Attribute | Detail |
|-----------|--------|
| **Name** | Rajesh Kumar |
| **Age** | 23 |
| **Location** | Chennai, Tamil Nadu |
| **Education** | CA Intermediate, pursuing articleship |
| **Device** | Laptop (primary), iPhone (secondary) |
| **Language** | English primary, Tamil in voice |
| **Pain Points** | Massive syllabus with frequent ICAI updates, balancing articleship with study, needs to track amendment dates, practice numerical problems |
| **Goals** | Clear CA Inter in both groups, complete articleship |
| **Tech Comfort** | High. Uses Excel, Tally, multiple study apps. |
| **Quote** | "The syllabus changes every six months. I need something that keeps up." |

### 6.5 Persona: Divya — UPSC Aspirant

| Attribute | Detail |
|-----------|--------|
| **Name** | Divya Natarajan |
| **Age** | 26 |
| **Location** | Chennai, Tamil Nadu |
| **Education** | BTech graduate, 2nd attempt UPSC |
| **Device** | Laptop + Android phone |
| **Language** | English for preparation, Tamil for thinking |
| **Pain Points** | Needs to cover newspapers daily, link current affairs to static syllabus, write answer practice with structure, track revision across 30+ subjects |
| **Goals** | Crack UPSC CSE Prelims and Mains |
| **Tech Comfort** | Very high. Power user. |
| **Quote** | "I need a system that connects today's newspaper to my polity notes from 3 months ago." |

---

## 7. User Journeys

### 7.1 Journey: First-Time Onboarding

```
[Download/Open App]
        |
        v
[Welcome Screen — "Your AI Study Companion"]
        |
        v
[Language Selection: Tamil / English / Tanglish]
        |
        v
[Education Level Selection]
  +-- School (Class 9-12)
  +-- College (UG/PG)
  +-- Professional (CA/Law/Medical)
  +-- Competitive Exam (UPSC/JEE/NEET)
        |
        v
[Specific Field Selection]
  e.g., "Engineering > Computer Science > Anna University"
        |
        v
[Current Semester/Year]
        |
        v
[Subject Selection (pre-populated from university/board)]
        |
        v
[Exam Schedule Input]
  +-- Auto-detect from academic calendar
  +-- Manual date entry
        |
        v
[Study Goal Setting]
  "What is your target?" — GPA / Rank / Pass / Score
        |
        v
[Authentication]
  +-- Google Sign-In (one-tap)
  +-- Phone OTP (Indian students)
  +-- Email + Password
        |
        v
[AI Greeting — Personalized]
  "Welcome Priya! I see you are in 3rd year CSE at Anna University.
   You have 6 subjects this semester. Your mid-semester exams
   are in 34 days. Let me create your study plan."
        |
        v
[Home Dashboard — Fully Personalized]
```

**UX Principles for Onboarding:**
- Maximum 6 screens, completable in under 90 seconds.
- Every selection populates downstream data (university leads to subjects leads to exam schedule).
- Skip option on non-critical fields. AI can ask later.
- Progress indicator (dots, not percentage) to reduce anxiety.
- Haptic feedback on selection (mobile).
- No account required to explore. Auth required only to save data.

**Data Flow:**
1. Client captures selections and sends to `POST /api/v1/onboarding/profile`.
2. Backend creates `User`, `AcademicProfile`, and `SubjectEnrollment` records.
3. Backend triggers Celery task `generate_initial_study_plan` which calls Gemini with the student context.
4. AI generates a 7-day starter plan via tool call `create_study_plan`.
5. Plan stored in `study_plans` table, pushed to client via WebSocket.
6. Client renders personalized dashboard with plan, next class, and attendance summary.

**Edge Cases:**
- Student's university/board not in database: "Other" option with manual subject entry. Flagged for admin review to add to catalog.
- Student changes field mid-onboarding: All downstream selections reset gracefully.
- Network failure during onboarding: All selections cached in IndexedDB. Synced when online.
- Student is in multiple programs simultaneously (e.g., BCom + CA): Support for multiple academic profiles under one account.

### 7.2 Journey: Daily Study Session

```
[Open App / Resume from background]
        |
        v
[Dashboard: Today's Plan]
  +-- Current study block (subject, topic, duration)
  +-- Upcoming classes with attendance status
  +-- Due assignments with countdown
  +-- Spaced repetition cards due today
        |
        v
[Tap "Start Studying"]
        |
        v
[Focus Mode Activated]
  +-- Timer running (Pomodoro or custom)
  +-- Relevant notes loaded
  +-- AI available via floating button
  +-- Distraction blocker (optional)
        |
        v
[During Session — AI Interaction]
  +-- "Explain this concept" — AI explains using subject context
  +-- "Generate practice questions" — AI creates MCQs/subjective
  +-- "I am stuck on this problem" — AI provides hints, not answers
  +-- "Take a note" — Voice/text note auto-filed to current subject
        |
        v
[Session Complete]
  +-- Duration logged
  +-- Topics covered marked
  +-- Mood check (optional): Frustrated / Neutral / Happy / On Fire
  +-- AI: "Great session! You covered 2 topics. Tomorrow, review
       Unit 3.2 — it has been 4 days since you last saw it."
        |
        v
[Dashboard Updated — Progress Reflected]
```

### 7.3 Journey: Assignment Submission Workflow

```
[Notification: "DBMS Assignment due in 48 hours"]
        |
        v
[Open Assignment Detail]
  +-- Title, description, rubric
  +-- Attached reference PDFs
  +-- AI: "Based on the rubric, focus on ER diagrams
  |    and normalization. Want me to outline the structure?"
  +-- Status: Not Started / In Progress / Submitted
        |
        v
[Tap "Start Working"]
        |
        v
[Editor Opens]
  +-- Rich text editor with markdown support
  +-- AI writing assistant (suggest, improve, cite)
  +-- Attach images, diagrams, code blocks
  +-- Real-time word/page count
        |
        v
[AI Review]
  "Your assignment covers 3 of 5 rubric points.
   Missing: Normalization examples and performance comparison.
   Want me to suggest content for these sections?"
        |
        v
[Submit / Save Draft]
  +-- Status updated, timestamp recorded, notification cleared
```

### 7.4 Journey: Exam Preparation (7-Day Countdown)

```
[Dashboard Alert: "Mid-semester exams in 7 days"]
        |
        v
[Exam Prep Mode Activated]
  +-- AI generates subject-wise revision plan
  +-- Prioritizes weak topics (from analytics)
  +-- Schedules spaced repetition reviews
  +-- Blocks non-essential notifications
        |
        v
[Day-by-Day Plan]
  Day 1: DBMS Unit 1-2 (Review) + OS Unit 3 (Deep Study)
  Day 2: Networks Unit 1-3 (Review) + DBMS Unit 3 (Deep Study)
  ...
  Day 6: Full mock test + Weak topic review
  Day 7: Light revision + Rest
        |
        v
[Daily Execution]
  +-- Study sessions with timer
  +-- Quick quizzes after each unit
  +-- AI-generated previous year question practice
  +-- Progress bar per subject fills up
        |
        v
[Exam Predictor Updates Daily]
  "Based on your preparation, estimated scores:
   DBMS: 72/100 (up 5 from yesterday)
   OS: 58/100 (needs more practice on scheduling algorithms)
   Networks: 81/100 (strong, maintain with light revision)"
```

### 7.5 Journey: Voice Interaction (Tanglish)

```
[Tap Microphone / Say "Hey Scholar"]
        |
        v
[Voice UI Activates — Listening indicator]
        |
        v
Student: "Naalaikku enna padikanum?" (What should I study tomorrow?)
        |
        v
[STT converts Tanglish speech to text]
        |
        v
[Gemini processes with student context]
  Tools called:
  1. get_study_plan(date=tomorrow)
  2. get_weak_topics(student_id)
  3. get_exam_schedule(student_id)
        |
        v
[AI Response — Streaming TTS in Tanglish]
  "Naalaikku un study plan-la Data Structures irukku,
   especially Binary Trees. Unakku idhu la weak area —
   last quiz-la 45% dhaan vandhurukku. Two hours
   concentrate pannaalae, nalla improve aagum.
   Afternoon-la DBMS revision irukku. Start pannalama?"
        |
        v
[Student responds — Continuous conversation continues]
  Student: "Binary Trees-kku notes irukka?"
  AI: [Calls search_notes(topic="Binary Trees")]
      "Irukku! October 15 class-la nee eduththa notes irukku.
       Open pannava?"
```

---

## 8. Competitive Analysis

### 8.1 Direct Competitors

#### Google Classroom
- **Strengths:** Free, deep Google Workspace integration, institutional adoption, simple UX, global scale.
- **Weaknesses:** Teacher-centric (not student-centric), no AI tutoring, no study planning, no attendance tracking from student perspective, no flashcards/spaced repetition, no offline capability for students, no voice assistant.
- **ScholarOS Advantage:** ScholarOS is built for the student, not the institution. Google Classroom tells students what to submit. ScholarOS tells students how to prepare, what to prioritize, and predicts their outcomes.

#### Notion
- **Strengths:** Infinitely flexible, block-based architecture, beautiful UI, strong community templates, Notion AI for writing assistance.
- **Weaknesses:** Requires significant setup time, no educational domain knowledge, no attendance tracking, no exam-specific features, no spaced repetition, no voice support, no Tamil support, overwhelming for low-tech-comfort users, poor offline support.
- **ScholarOS Advantage:** Notion is a blank canvas. ScholarOS is a pre-configured cockpit. A student opens ScholarOS and immediately sees their study plan, attendance, and deadlines — zero setup required after onboarding.

#### Anki
- **Strengths:** Gold standard for spaced repetition, massive community deck library, proven efficacy for medical and language students.
- **Weaknesses:** Extremely dated UI, steep learning curve, no integration with study planning or attendance, desktop-first (mobile apps are paid/third-party), no AI for content generation, isolated tool.
- **ScholarOS Advantage:** ScholarOS embeds spaced repetition as one feature among many. Flashcards are auto-generated from notes, PDFs, and lectures — the student never manually creates cards unless they want to.

#### Quizlet
- **Strengths:** Easy flashcard creation, social features, AI-generated quizzes from uploaded content, gamification.
- **Weaknesses:** Subscription-heavy, no study planning, no attendance, no assignment tracking, no voice, no Indian language support, limited to flashcard paradigm.
- **ScholarOS Advantage:** Quizlet is a flashcard tool. ScholarOS is an operating system. Flashcards are one of 15+ integrated capabilities.

### 8.2 Indirect Competitors

#### Motion (AI Calendar)
- **Strengths:** AI-powered calendar optimization, automatic rescheduling, priority-based task management.
- **Weaknesses:** Not education-specific, expensive ($19/month), no Indian language support, no study-specific features.
- **ScholarOS Advantage:** ScholarOS's study planner is Motion-caliber scheduling but designed specifically for academic workflows — exam countdowns, revision cycles, and spaced repetition are native concepts.

#### Otter.ai
- **Strengths:** Best-in-class meeting transcription, real-time captions, AI summarization.
- **Weaknesses:** Not education-specific, no Tamil support, expensive for students, no integration with study workflows.
- **ScholarOS Advantage:** ScholarOS provides lecture transcription as part of the note-taking pipeline, not as a standalone product.

#### ChatGPT / Claude / Gemini (direct)
- **Strengths:** General-purpose AI assistants, massive knowledge bases, excellent reasoning.
- **Weaknesses:** No persistent student context, no attendance tracking, no study planning, no spaced repetition, no exam prediction, stateless (each conversation is isolated), no Indian-education-specific knowledge.
- **ScholarOS Advantage:** ScholarOS wraps the same caliber of AI reasoning (via Gemini) in a persistent, stateful, education-specific context layer. The AI knows the student's subjects, scores, attendance, and exam schedule. It does not start from zero every conversation.

### 8.3 Market Gap

No single product today combines all of the following:
1. AI-powered study planning with spaced repetition
2. Attendance tracking with prediction
3. Note-taking with OCR and semantic search
4. Exam prediction based on preparation data
5. Voice assistant in Tamil/English/Tanglish
6. PDF reader with AI annotation
7. Assignment management with AI review
8. Offline-first architecture
9. Support for every educational field (not just STEM)

ScholarOS fills this gap entirely.

---

## 9. Feature Comparison

| Feature | ScholarOS | Google Classroom | Notion | Anki | Quizlet | Motion | ChatGPT |
|---------|-----------|-----------------|--------|------|---------|--------|---------|
| AI Study Planning | Yes (Gemini) | No | No | No | No | Yes (general) | No |
| Spaced Repetition | Yes (SM-2) | No | No | Yes (core) | Yes (basic) | No | No |
| Attendance Tracking | Yes | No | Manual only | No | No | No | No |
| Attendance Prediction | Yes | No | No | No | No | No | No |
| Note-Taking | Yes (rich) | No | Yes (excellent) | No | No | No | No |
| OCR (Handwritten) | Yes | No | No | No | No | No | No |
| PDF Reader + AI | Yes | No | Basic embed | No | No | No | No |
| Assignment Management | Yes | Yes (core) | Manual | No | No | Yes (general) | No |
| Exam Prediction | Yes | No | No | No | No | No | No |
| Voice Assistant | Yes (Tamil/EN) | No | No | No | No | No | Voice (EN only) |
| Tamil Language | Full | No | No | No | No | No | Partial |
| Tanglish Support | Yes | No | No | No | No | No | No |
| Offline First | Yes | Partial | Partial | Yes | No | No | No |
| Universal Education | Yes (all fields) | Yes | Yes | Yes | Yes | N/A | Yes |
| Calendar Integration | Yes (native) | Google Calendar | No | No | No | Yes (core) | No |
| Timetable | Yes | Partial | Manual | No | No | No | No |
| Knowledge Base | Yes (semantic) | No | Yes (wiki) | No | No | No | No |
| Analytics | Yes (deep) | Basic grades | No | Basic stats | Basic stats | Productivity | No |
| AI Flashcard Gen | Yes (auto) | No | No | No | Yes | No | Yes (manual) |
| Study Timer | Yes | No | No | No | No | No | No |
| PWA + Mobile | Yes | Web + Mobile | Web + Mobile | Desktop + Mobile | Web + Mobile | Web + Mobile | Web + Mobile |
| Free Tier | Generous | Free | Free (limited) | Free (desktop) | Free (limited) | No free tier | Free (limited) |

---

## 10. Future Vision

### 10.1 Year 1 (2026-2027): Foundation
- Launch MVP with core features for Tamil Nadu engineering and medical students.
- Achieve 100,000 active users.
- Validate AI study planning effectiveness through A/B tested academic outcomes.
- Tamil + English + Tanglish voice assistant fully operational.

### 10.2 Year 2 (2027-2028): Expansion
- Expand to all Indian educational fields (commerce, arts, law, MBA).
- Hindi language support.
- Institutional partnerships (10 universities integrate ScholarOS).
- Peer study groups with AI-moderated discussions.
- Parent dashboard for school students.
- 1 million active users.

### 10.3 Year 3 (2028-2029): Platform
- Open API for institutional integration (LMS connectors for Canvas, Moodle).
- Marketplace for subject-specific content packs.
- Teacher/coach tools (assign content, track student progress).
- AR-based visualization for science subjects (chemistry molecules, anatomy models).
- 5 million active users.

### 10.4 Year 5 (2030-2031): Operating System
- ScholarOS becomes the default student interface in partner institutions.
- AI-generated personalized textbooks.
- Career pathway prediction based on academic data.
- Job market integration (connect study outcomes to employment).
- Multi-language support (10+ Indian languages + global languages).
- 20 million active users.

---

## 11. Business Architecture

### 11.1 Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | INR 0 | Core study planner, attendance tracker (2 subjects), basic notes, 10 AI queries/day, offline access |
| **Scholar** | INR 149/month (INR 999/year) | Unlimited subjects, unlimited AI, voice assistant, exam predictor, OCR, PDF reader, analytics, spaced repetition |
| **Scholar Pro** | INR 299/month (INR 1999/year) | Everything in Scholar + priority AI, advanced analytics, export reports, API access, family sharing (2 accounts) |
| **Institutional** | Custom pricing | Bulk licensing, admin dashboard, LMS integration, custom branding, SLA support |

### 11.2 Unit Economics Target

| Metric | Target |
|--------|--------|
| Customer Acquisition Cost (CAC) | Under INR 50 (organic + referral focused) |
| Monthly Recurring Revenue per User (ARPU) | INR 120 |
| Lifetime Value (LTV) | INR 2,880 (24-month average student lifecycle) |
| LTV:CAC Ratio | Greater than 50:1 |
| Gross Margin | Greater than 75% |
| AI Cost per User per Month | Under INR 15 (Gemini Flash pricing optimized) |

### 11.3 Growth Strategy

1. **Viral Loop:** Students share study plans and exam predictions on social media. Each shared artifact includes a ScholarOS watermark and invite link.
2. **College Ambassadors:** One student per college gets Scholar Pro free in exchange for onboarding 50 students.
3. **Content Marketing:** Tamil-language YouTube channel with study tips, powered by ScholarOS demonstrations.
4. **Referral Program:** Invite 3 friends, get 1 month of Scholar free.
5. **Institutional Sales:** Direct outreach to Tamil Nadu university registrars for bulk adoption.

---

## 12. Technical Architecture

### 12.1 System Overview

```
+--------------------------------------------------+
|                    CLIENT LAYER                    |
|  +----------------------------------------------+ |
|  |  Next.js PWA (React + TypeScript + Tailwind) | |
|  |  +-- shadcn/ui Components                    | |
|  |  +-- Framer Motion Animations                | |
|  |  +-- Zustand State Management                | |
|  |  +-- TanStack Query Data Fetching            | |
|  |  +-- IndexedDB (Dexie.js) Offline Store      | |
|  |  +-- Service Worker (Workbox)                | |
|  |  +-- Capacitor (iOS/Android wrapper)         | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
                        |
            HTTPS / WebSocket / SSE
                        |
+--------------------------------------------------+
|                   API GATEWAY                     |
|  +----------------------------------------------+ |
|  |  Nginx (Reverse Proxy + Rate Limiting)       | |
|  |  +-- SSL Termination                         | |
|  |  +-- Request Routing                         | |
|  |  +-- Static Asset Serving                    | |
|  |  +-- WebSocket Upgrade                       | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
                        |
+--------------------------------------------------+
|                 APPLICATION LAYER                 |
|  +----------------------------------------------+ |
|  |  FastAPI (Python 3.12+)                      | |
|  |  +-- REST API Endpoints                      | |
|  |  +-- WebSocket Handlers                      | |
|  |  +-- Server-Sent Events (AI Streaming)       | |
|  |  +-- Dependency Injection                    | |
|  |  +-- Pydantic V2 Validation                  | |
|  |  +-- SQLAlchemy 2.0+ Async ORM              | |
|  |  +-- Alembic Migrations                      | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
         |              |              |
+--------+--+    +------+------+   +--+--------+
| AI LAYER  |    | DATA LAYER  |   | WORKER    |
| Gemini    |    | PostgreSQL  |   | LAYER     |
| 2.5 Flash |    | + pgvector  |   | Celery +  |
| Tool Call |    | Redis       |   | Redis     |
| Engine    |    | S3/Minio    |   | Broker    |
+-----------+    +-------------+   +-----------+
```

### 12.2 Technology Stack (Locked)

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Next.js | 15.x | App Router, RSC, SSR/SSG, Streaming, PPR |
| **UI Library** | React | 19.x | Server Components, Actions, use() hook |
| **Language** | TypeScript | 5.x | Type safety, IDE support, refactoring confidence |
| **Styling** | Tailwind CSS | 4.x | Utility-first, design token integration, performance |
| **Component Library** | shadcn/ui | Latest | Accessible primitives (Radix), source-code ownership |
| **Animation** | Framer Motion | 11.x | Declarative, GPU-accelerated, layout animations |
| **State Management** | Zustand | 5.x | Minimal API, no boilerplate, middleware support |
| **Data Fetching** | TanStack Query | 5.x | Cache management, optimistic updates, offline support |
| **Offline Storage** | Dexie.js | 4.x | IndexedDB wrapper, reactive queries, sync support |
| **PWA** | Workbox | 7.x | Service worker tooling, caching strategies |
| **Mobile Wrapper** | Capacitor | 6.x | Native APIs, App Store distribution |
| **Backend Framework** | FastAPI | 0.115+ | Async, auto-docs, dependency injection, WebSocket |
| **Backend Language** | Python | 3.12+ | Type hints, performance improvements, async ecosystem |
| **ORM** | SQLAlchemy | 2.0+ | Async support, type-safe queries, mature ecosystem |
| **Database** | PostgreSQL | 16+ | JSONB, pgvector, full-text search, row-level security |
| **Vector Extension** | pgvector | 0.7+ | HNSW indexing, cosine similarity, integrated with PG |
| **Cache/Broker** | Redis | 7.x | Caching, session store, Celery broker, pub/sub |
| **Task Queue** | Celery | 5.x | Distributed tasks, scheduling, retries, monitoring |
| **AI Model** | Google Gemini 2.5 Flash | Stable | Tool calling, multimodal, 1M context, streaming |
| **Migrations** | Alembic | 1.13+ | Version-controlled schema changes |
| **Reverse Proxy** | Nginx | 1.27+ | SSL, rate limiting, static files, WebSocket |
| **Containerization** | Docker | 25+ | Multi-stage builds, reproducible environments |
| **Orchestration** | Docker Compose (dev) / Kubernetes (prod) | Latest | Local development / production scaling |
| **CI/CD** | GitHub Actions | N/A | Automated testing, building, deployment |
| **Object Storage** | MinIO (dev) / S3 (prod) | Latest | PDF storage, image storage, export files |

### 12.3 Architecture Decision Records

**ADR-001: Single AI Model**
- Decision: Use only Google Gemini 2.5 Flash for all AI capabilities.
- Context: Multi-model architectures increase operational complexity, cost, and latency. They require model routing logic that itself can fail.
- Consequences: All features must be expressible as Gemini tool calls. If Gemini cannot perform a task, the task is implemented as deterministic code, not by adding another model.

**ADR-002: pgvector over Dedicated Vector Database**
- Decision: Use pgvector extension within PostgreSQL instead of a separate vector database (Pinecone, Qdrant, Weaviate).
- Context: Research confirms pgvector with HNSW indexing handles millions of vectors with sub-10ms query times. A separate vector DB adds operational complexity, data synchronization challenges, and additional cost.
- Consequences: Embeddings, semantic search, and RAG all operate within the same PostgreSQL instance. Transactional consistency is maintained. Vector operations benefit from standard PostgreSQL tooling (backups, monitoring, migrations).

**ADR-003: Next.js over Vite SPA**
- Decision: Use Next.js App Router instead of a Vite-based SPA.
- Context: Next.js provides SSR for SEO (landing pages, blog), RSC for reduced bundle size, streaming for AI responses, and Partial Prerendering for hybrid static/dynamic pages. A Vite SPA would require building all of this from scratch.
- Consequences: The frontend team must understand the RSC mental model (server vs. client boundaries). The `"use client"` directive must be used judiciously.

**ADR-004: Celery over FastAPI BackgroundTasks**
- Decision: Use Celery with Redis broker for all background processing instead of FastAPI's built-in BackgroundTasks.
- Context: BackgroundTasks are tied to the application process. If the server restarts, tasks are lost. Celery provides persistence, retries, scheduling, monitoring (Flower), and horizontal scaling.
- Consequences: A separate Celery worker process must run alongside the FastAPI application. Docker Compose manages both services.

**ADR-005: Zustand over Redux/Jotai/Recoil**
- Decision: Use Zustand for client-side state management.
- Context: Redux is over-engineered for this use case. Jotai and Recoil add unnecessary atomic complexity. Zustand provides a minimal API with middleware support (persist, devtools) and integrates cleanly with TanStack Query for server state.
- Consequences: Global client state is minimal (theme, sidebar state, current user, language preference). Server state is managed entirely by TanStack Query.

---

## 13. AI Architecture

### 13.1 Core Philosophy: AI as Orchestrator

The AI does not store data. It does not serve UIs. It does not run computations. It reasons about the student's context and decides which tools to invoke and in what order. This is the "One Brain, Many Tools" principle made concrete.

```
+-------------------+
|     STUDENT       |
|  (text / voice)   |
+--------+----------+
         |
         v
+--------+----------+
|   CONVERSATION    |
|    MANAGER        |
|  - Session state  |
|  - Message history|
|  - Context window |
+--------+----------+
         |
         v
+--------+----------+
|   GEMINI 2.5      |
|   FLASH           |
|  +-- System Prompt|
|  +-- Student Ctx  |
|  +-- Tool Defs    |
|  +-- Conversation |
+--------+----------+
         |
    Tool Call(s)
         |
    +----+----+----+----+----+
    |    |    |    |    |    |
    v    v    v    v    v    v
  [T1] [T2] [T3] [T4] [T5] [Tn]
  
  T1: get_study_plan()
  T2: search_notes()
  T3: create_flashcard()
  T4: get_attendance()
  T5: predict_exam_score()
  Tn: ... (extensible)
```

### 13.2 Context Assembly Pipeline

Before every Gemini API call, the backend assembles a rich context object:

```python
context = {
    "student": {
        "name": "Priya",
        "language_preference": "tanglish",
        "education": "BTech CSE, 3rd Year, Anna University",
        "current_semester": 5,
        "subjects": ["Data Structures", "DBMS", "OS", "Networks", "Math III", "English"],
        "gpa": 8.2,
        "target_gpa": 8.5
    },
    "temporal": {
        "current_time": "2026-08-04T18:30:00+05:30",
        "next_exam": {"subject": "Data Structures", "date": "2026-08-22", "days_remaining": 18},
        "next_class": {"subject": "DBMS", "time": "09:00", "room": "CS-301"}
    },
    "academic": {
        "attendance": {"Data Structures": 73, "DBMS": 82, "OS": 78},
        "recent_scores": {"Data Structures Quiz 2": 65, "DBMS Assignment 1": 88},
        "weak_topics": ["Binary Trees", "Deadlock Detection", "Subnetting"],
        "spaced_rep_due": 12
    },
    "behavioral": {
        "avg_study_hours_per_day": 4.2,
        "preferred_study_time": "evening",
        "study_streak": 5,
        "last_active": "2026-08-04T14:00:00+05:30"
    }
}
```

This context is injected into the system prompt. It is never sent as user-facing text. The student only sees AI responses, never the raw context.

### 13.3 Gemini API Integration

**Model Configuration:**
```python
generation_config = {
    "model": "gemini-2.5-flash",
    "temperature": 0.7,          # Balanced creativity and accuracy
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
    "thinking": {
        "enabled": True,         # Enable built-in reasoning
        "budget_tokens": 2048    # Cap thinking to control cost
    }
}
```

**Streaming Configuration:**
- All AI responses use streaming (Server-Sent Events).
- Client renders tokens as they arrive, providing sub-500ms perceived latency.
- Tool call results are streamed back to Gemini for multi-turn reasoning.

### 13.4 AI Guardrails

| Guardrail | Implementation |
|-----------|---------------|
| **Factual Grounding** | AI is instructed to cite sources (notes, textbook references, official syllabus) and say "I am not sure" when confidence is low. |
| **Academic Integrity** | AI provides hints and explanations, never complete assignment answers. System prompt explicitly forbids generating submission-ready content. |
| **Scope Limitation** | AI refuses non-academic queries (relationship advice, medical diagnosis, financial advice). Responds: "I am your study companion. For [topic], please consult a professional." |
| **Content Safety** | Gemini's built-in safety filters are active. Additional backend filtering for harmful content. |
| **Token Budget** | Maximum 8192 output tokens per response. Maximum 4096 thinking tokens. Prevents runaway costs. |
| **Rate Limiting** | Free tier: 10 AI queries/day. Scholar: 200/day. Scholar Pro: unlimited. Enforced at the API layer. |
| **Hallucination Mitigation** | When answering factual questions, AI is instructed to prioritize the student's own notes and uploaded materials over general knowledge. |

### 13.5 AI Response Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Relevance | Greater than 90% | User feedback (thumbs up/down) |
| Factual Accuracy | Greater than 95% | Automated fact-checking against syllabus data |
| Tool Call Success Rate | Greater than 99% | Backend monitoring (tool invocation vs. error) |
| Average Response Time (streaming start) | Under 500ms | APM monitoring |
| Student Satisfaction (NPS) | Greater than 70 | In-app surveys |

---

## 14. Gemini Tool Calling Architecture

### 14.1 Tool Registry

Every feature in ScholarOS is exposed to Gemini as a callable tool. Tools are defined using JSON Schema (OpenAPI-compatible function declarations) and registered in a central tool registry.

**Tool Categories:**

| Category | Tools | Description |
|----------|-------|-------------|
| **Study Planning** | `get_study_plan`, `create_study_plan`, `modify_study_plan`, `get_daily_schedule` | Manage and generate study schedules |
| **Attendance** | `get_attendance`, `mark_attendance`, `predict_attendance`, `get_attendance_risk` | Track and predict class attendance |
| **Notes** | `search_notes`, `create_note`, `summarize_note`, `get_note_by_topic` | CRUD and AI operations on notes |
| **Assignments** | `get_assignments`, `get_assignment_detail`, `update_assignment_status` | Track assignment lifecycle |
| **Exam Prep** | `predict_exam_score`, `generate_practice_questions`, `get_weak_topics`, `create_mock_test` | Exam preparation tools |
| **Flashcards** | `create_flashcard`, `get_due_flashcards`, `review_flashcard`, `generate_flashcards_from_topic` | Spaced repetition management |
| **Knowledge Base** | `search_knowledge_base`, `get_topic_explanation`, `get_related_topics` | Semantic search over student content |
| **Timetable** | `get_timetable`, `get_next_class`, `update_timetable` | Class schedule management |
| **Calendar** | `get_calendar_events`, `create_event`, `get_upcoming_deadlines` | General calendar management |
| **Analytics** | `get_study_analytics`, `get_subject_progress`, `get_streak_info` | Student performance data |
| **PDF** | `search_pdf_content`, `get_pdf_summary`, `extract_pdf_highlights` | PDF reading and analysis |
| **Utility** | `get_current_time`, `set_reminder`, `get_weather` | General utility tools |

### 14.2 Tool Definition Format

Each tool follows this schema pattern:

```python
study_plan_tools = [
    {
        "name": "get_study_plan",
        "description": "Retrieves the student's study plan for a specific date or date range. Returns subjects, topics, time slots, and completion status. Use this when the student asks what to study, their schedule, or their plan for today/tomorrow/this week.",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "format": "date",
                    "description": "The date to get the plan for. Defaults to today if not specified."
                },
                "date_range_end": {
                    "type": "string",
                    "format": "date",
                    "description": "Optional end date for a range query (e.g., weekly plan)."
                }
            },
            "required": []
        }
    },
    {
        "name": "create_study_plan",
        "description": "Creates or regenerates a study plan for the student. Takes into account their subjects, exam schedule, weak topics, attendance requirements, and preferred study times. Use this when the student asks to create a new plan, reschedule, or when significant changes occur (new exam date, topic completion).",
        "parameters": {
            "type": "object",
            "properties": {
                "start_date": {
                    "type": "string",
                    "format": "date",
                    "description": "Start date for the plan."
                },
                "end_date": {
                    "type": "string",
                    "format": "date",
                    "description": "End date for the plan."
                },
                "focus_subjects": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional list of subjects to prioritize."
                },
                "daily_hours": {
                    "type": "number",
                    "description": "Target study hours per day. Defaults to student's average."
                },
                "include_revision": {
                    "type": "boolean",
                    "description": "Whether to include spaced repetition review sessions."
                }
            },
            "required": ["start_date", "end_date"]
        }
    }
]
```

### 14.3 Tool Execution Pipeline

```
[Gemini returns tool_call]
        |
        v
[Tool Router]
  +-- Validate tool name exists in registry
  +-- Validate parameters against JSON Schema
  +-- Check user permissions (free tier limits)
  +-- Check rate limits
        |
        v
[Tool Executor]
  +-- Resolve tool handler function
  +-- Inject dependencies (db session, user context)
  +-- Execute handler
  +-- Handle errors gracefully
        |
        v
[Response Formatter]
  +-- Serialize tool output to JSON
  +-- Truncate if exceeds token budget
  +-- Add metadata (execution time, data freshness)
        |
        v
[Return to Gemini]
  +-- Gemini receives tool result
  +-- May call additional tools (multi-step reasoning)
  +-- Eventually generates final natural language response
        |
        v
[Stream to Client]
```

### 14.4 Multi-Tool Orchestration

Gemini can call multiple tools in sequence or parallel within a single conversation turn. Example:

**Student asks:** "How am I doing overall this semester?"

**Gemini's tool calls (sequential):**
1. `get_attendance()` — Returns attendance percentages per subject.
2. `get_study_analytics()` — Returns study hours, streak, topic coverage.
3. `get_subject_progress()` — Returns scores and grade predictions.
4. `predict_exam_score()` — Returns estimated exam scores.

**Gemini synthesizes all four tool outputs into a unified response:**
"Here is your semester overview, Priya. Your attendance is healthy in DBMS (82%) and OS (78%), but Data Structures is at risk (73% — you need to attend 8 of the next 10 classes). You have been studying an average of 4.2 hours per day with a 5-day streak. Your strongest subject is DBMS (predicted: 85/100) and your weakest is Data Structures (predicted: 68/100), mainly due to Binary Trees. I recommend adding 30 minutes of focused Binary Tree practice daily."

### 14.5 Tool Error Handling

| Error Type | Handling Strategy |
|------------|------------------|
| Tool not found | Return error to Gemini: "Tool does not exist." Gemini apologizes and tries alternative approach. |
| Parameter validation failure | Return specific validation error. Gemini corrects parameters and retries. |
| Database error | Return generic error. Gemini informs student: "I had trouble accessing your data. Please try again." |
| Rate limit exceeded | Return rate limit error. Gemini informs student about plan limits. |
| Timeout (tool takes over 5s) | Return timeout error. Gemini informs student and suggests retry. |
| Empty result | Return empty result. Gemini handles gracefully: "I could not find any notes on that topic. Would you like me to explain it instead?" |

### 14.6 Tool Versioning

Tools are versioned to support backward compatibility:
- Tool definitions include a `version` field.
- Multiple versions can coexist during migration periods.
- Deprecated tools return a warning alongside valid results.
- New tool versions are tested against recorded conversation transcripts before deployment.

---

## 15. Frontend Architecture

### 15.1 Project Structure

```
src/
+-- app/                          # Next.js App Router
|   +-- (auth)/                   # Auth route group
|   |   +-- login/page.tsx
|   |   +-- register/page.tsx
|   |   +-- onboarding/page.tsx
|   +-- (dashboard)/              # Protected route group
|   |   +-- layout.tsx            # Dashboard shell (sidebar + topbar)
|   |   +-- page.tsx              # Home dashboard
|   |   +-- study-plan/page.tsx
|   |   +-- attendance/page.tsx
|   |   +-- notes/
|   |   |   +-- page.tsx          # Notes list
|   |   |   +-- [id]/page.tsx     # Note detail/editor
|   |   +-- assignments/page.tsx
|   |   +-- exams/page.tsx
|   |   +-- timetable/page.tsx
|   |   +-- calendar/page.tsx
|   |   +-- flashcards/page.tsx
|   |   +-- pdf/[id]/page.tsx
|   |   +-- analytics/page.tsx
|   |   +-- knowledge-base/page.tsx
|   |   +-- settings/page.tsx
|   +-- api/                      # Next.js API routes (BFF layer)
|   |   +-- auth/[...nextauth]/route.ts
|   +-- globals.css
|   +-- layout.tsx                # Root layout
|   +-- not-found.tsx
+-- components/
|   +-- ui/                       # shadcn/ui primitives
|   |   +-- button.tsx
|   |   +-- card.tsx
|   |   +-- dialog.tsx
|   |   +-- input.tsx
|   |   +-- ... (all shadcn components)
|   +-- composed/                 # Product-level composed components
|   |   +-- ai-chat-panel.tsx
|   |   +-- attendance-card.tsx
|   |   +-- study-plan-timeline.tsx
|   |   +-- subject-progress-ring.tsx
|   |   +-- flashcard-review.tsx
|   |   +-- voice-assistant-overlay.tsx
|   |   +-- pdf-viewer.tsx
|   |   +-- note-editor.tsx
|   |   +-- exam-predictor-card.tsx
|   +-- layout/                   # Layout components
|   |   +-- sidebar.tsx
|   |   +-- topbar.tsx
|   |   +-- mobile-nav.tsx
|   |   +-- command-palette.tsx
+-- features/                     # Feature-based modules
|   +-- auth/
|   |   +-- hooks/useAuth.ts
|   |   +-- api/auth-api.ts
|   |   +-- types.ts
|   +-- study-plan/
|   |   +-- hooks/useStudyPlan.ts
|   |   +-- api/study-plan-api.ts
|   |   +-- components/plan-block.tsx
|   |   +-- types.ts
|   +-- attendance/
|   +-- notes/
|   +-- assignments/
|   +-- exams/
|   +-- flashcards/
|   +-- voice/
|   +-- pdf/
|   +-- analytics/
+-- lib/
|   +-- api-client.ts             # Axios/fetch wrapper with interceptors
|   +-- gemini-stream.ts          # SSE handler for AI streaming
|   +-- offline-db.ts             # Dexie.js database schema
|   +-- sync-engine.ts            # Offline sync logic
|   +-- i18n.ts                   # Internationalization (Tamil/English)
|   +-- utils.ts                  # General utilities
+-- stores/
|   +-- app-store.ts              # Zustand: theme, sidebar, language
|   +-- voice-store.ts            # Zustand: voice assistant state
+-- hooks/
|   +-- use-media-query.ts
|   +-- use-keyboard-shortcut.ts
|   +-- use-online-status.ts
+-- types/
|   +-- api.ts                    # API response types
|   +-- models.ts                 # Domain model types
+-- public/
|   +-- manifest.json             # PWA manifest
|   +-- sw.js                     # Service worker (generated by Workbox)
|   +-- icons/                    # App icons (multiple sizes)
|   +-- locales/
|       +-- en.json
|       +-- ta.json
```

### 15.2 Server Component vs Client Component Strategy

| Component Type | Rendering | Examples |
|---------------|-----------|---------|
| **Page shells** | Server Component | Dashboard layout, page headers, static content |
| **Data display** | Server Component with Suspense | Attendance summary, study plan list, analytics charts |
| **Interactive widgets** | Client Component ("use client") | AI chat panel, voice assistant, flashcard review, note editor, calendar picker |
| **Forms** | Client Component with React 19 Actions | Login, onboarding, assignment submission, settings |
| **Animated elements** | Client Component (Framer Motion) | Page transitions, card hover effects, progress animations |

**Rule:** Client Components are pushed as far down the component tree as possible. A page that shows a study plan renders the plan list as a Server Component and wraps only the interactive "Start Studying" button as a Client Component.

### 15.3 Data Fetching Strategy

| Data Type | Strategy | Tool |
|-----------|----------|------|
| **Server-side data (initial load)** | RSC `fetch()` with caching | Next.js built-in |
| **Client-side data (interactive)** | TanStack Query with cache-first | `useQuery`, `useMutation` |
| **Real-time data (AI streaming)** | Server-Sent Events (EventSource) | Custom `useAIStream` hook |
| **Real-time data (notifications)** | WebSocket | Custom `useWebSocket` hook |
| **Offline data** | Dexie.js (IndexedDB) | Custom `useOfflineQuery` hook |

### 15.4 Offline-First Data Architecture

```
[User Action]
      |
      v
[Check Online Status]
      |
  +---+---+
  |       |
  v       v
[Online] [Offline]
  |         |
  v         v
[API Call] [Read from IndexedDB]
  |         |
  v         v
[Update    [Queue mutation in
 IndexedDB  outbox table]
 cache]     |
            v
           [When online: sync
            outbox to server]
```

**Offline-Capable Features:**
- View study plan (cached)
- View attendance (cached)
- View notes (cached, full text)
- Create/edit notes (queued, synced when online)
- View flashcards and review (queued, synced when online)
- View timetable (cached)
- View PDF (if previously downloaded)

**Online-Only Features:**
- AI chat (requires Gemini API)
- Voice assistant (requires STT/TTS API)
- OCR processing (requires server processing)
- Exam predictor (requires current data aggregation)

---

## 16. Backend Architecture

### 16.1 Project Structure

```
backend/
+-- app/
|   +-- main.py                   # FastAPI app factory
|   +-- core/
|   |   +-- config.py             # Pydantic Settings (env vars)
|   |   +-- security.py           # JWT, hashing, CORS
|   |   +-- database.py           # SQLAlchemy async engine, session
|   |   +-- redis.py              # Redis connection pool
|   |   +-- celery_app.py         # Celery configuration
|   |   +-- logging.py            # Structured logging setup
|   |   +-- middleware.py         # Request ID, timing, error handling
|   +-- api/
|   |   +-- v1/
|   |   |   +-- router.py         # API v1 router aggregation
|   |   |   +-- endpoints/
|   |   |   |   +-- auth.py
|   |   |   |   +-- users.py
|   |   |   |   +-- onboarding.py
|   |   |   |   +-- study_plans.py
|   |   |   |   +-- attendance.py
|   |   |   |   +-- notes.py
|   |   |   |   +-- assignments.py
|   |   |   |   +-- exams.py
|   |   |   |   +-- flashcards.py
|   |   |   |   +-- timetable.py
|   |   |   |   +-- calendar.py
|   |   |   |   +-- pdf.py
|   |   |   |   +-- knowledge_base.py
|   |   |   |   +-- analytics.py
|   |   |   |   +-- voice.py
|   |   |   |   +-- ai_chat.py
|   |   |   +-- websockets/
|   |   |       +-- chat_ws.py
|   |   |       +-- notifications_ws.py
|   +-- models/                    # SQLAlchemy ORM models
|   |   +-- base.py               # DeclarativeBase, common mixins
|   |   +-- user.py
|   |   +-- academic_profile.py
|   |   +-- subject.py
|   |   +-- study_plan.py
|   |   +-- attendance.py
|   |   +-- note.py
|   |   +-- assignment.py
|   |   +-- exam.py
|   |   +-- flashcard.py
|   |   +-- timetable.py
|   |   +-- calendar_event.py
|   |   +-- pdf_document.py
|   |   +-- conversation.py
|   |   +-- notification.py
|   |   +-- embedding.py
|   +-- schemas/                   # Pydantic V2 schemas
|   |   +-- auth.py
|   |   +-- user.py
|   |   +-- study_plan.py
|   |   +-- attendance.py
|   |   +-- note.py
|   |   +-- ... (mirrors models)
|   +-- services/                  # Business logic layer
|   |   +-- auth_service.py
|   |   +-- study_plan_service.py
|   |   +-- attendance_service.py
|   |   +-- note_service.py
|   |   +-- flashcard_service.py
|   |   +-- exam_predictor_service.py
|   |   +-- ai_service.py         # Gemini integration
|   |   +-- voice_service.py      # STT/TTS integration
|   |   +-- ocr_service.py
|   |   +-- embedding_service.py
|   |   +-- search_service.py
|   |   +-- notification_service.py
|   +-- repositories/              # Data access layer
|   |   +-- base_repository.py
|   |   +-- user_repository.py
|   |   +-- study_plan_repository.py
|   |   +-- ... (mirrors services)
|   +-- tools/                     # Gemini tool handlers
|   |   +-- tool_registry.py      # Central tool registration
|   |   +-- tool_executor.py      # Tool invocation engine
|   |   +-- study_plan_tools.py
|   |   +-- attendance_tools.py
|   |   +-- note_tools.py
|   |   +-- flashcard_tools.py
|   |   +-- exam_tools.py
|   |   +-- knowledge_base_tools.py
|   |   +-- calendar_tools.py
|   |   +-- analytics_tools.py
|   |   +-- utility_tools.py
|   +-- tasks/                     # Celery tasks
|   |   +-- study_plan_tasks.py
|   |   +-- notification_tasks.py
|   |   +-- embedding_tasks.py
|   |   +-- ocr_tasks.py
|   |   +-- analytics_tasks.py
|   |   +-- sync_tasks.py
|   +-- dependencies.py           # FastAPI dependency injection
+-- alembic/                      # Database migrations
|   +-- versions/
|   +-- env.py
+-- tests/
|   +-- conftest.py
|   +-- unit/
|   +-- integration/
|   +-- e2e/
+-- Dockerfile
+-- docker-compose.yml
+-- pyproject.toml
+-- alembic.ini
```

### 16.2 Layer Responsibilities

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| **Endpoints** (api/) | HTTP concerns: parse request, validate input, return response with correct status code | No business logic. No direct DB access. Calls services only. |
| **Services** (services/) | Business logic: orchestrate operations, enforce rules, call external APIs | No HTTP concerns. No direct SQL. Calls repositories for data. |
| **Repositories** (repositories/) | Data access: SQL queries, ORM operations, caching reads | No business logic. No HTTP concerns. Returns domain models. |
| **Tools** (tools/) | Gemini tool handlers: thin wrappers that call services and format results for AI consumption | No direct DB access. Calls services. Returns JSON-serializable dicts. |
| **Tasks** (tasks/) | Background jobs: long-running or scheduled operations | No HTTP concerns. Can call services and repositories directly. |
| **Models** (models/) | Database schema definition: columns, relationships, constraints | No logic beyond property accessors. |
| **Schemas** (schemas/) | API contract definition: request/response shapes, validation | Separate schemas for Create, Read, Update operations. |

### 16.3 Dependency Injection

```python
# dependencies.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.models.user import User

async def get_db() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def get_current_active_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    user = await verify_token_and_get_user(db, token)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive account")
    return user

def get_study_plan_service(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user)
) -> StudyPlanService:
    repo = StudyPlanRepository(db)
    return StudyPlanService(repo, user)
```

---

## 17. Database Architecture

### 17.1 Database: PostgreSQL 16+ with pgvector

**Extensions Required:**
- `pgvector` — Vector similarity search
- `pg_trgm` — Trigram-based text search
- `uuid-ossp` — UUID generation
- `btree_gin` — GIN index support for composite types

### 17.2 Entity Relationship Overview

```
users
  |-- 1:N --> academic_profiles
  |             |-- 1:N --> subject_enrollments
  |                           |-- N:1 --> subjects
  |-- 1:N --> study_plans
  |             |-- 1:N --> study_blocks
  |-- 1:N --> attendance_records
  |-- 1:N --> notes
  |             |-- 1:N --> note_embeddings
  |-- 1:N --> assignments
  |-- 1:N --> exams
  |             |-- 1:N --> exam_scores
  |-- 1:N --> flashcards
  |             |-- 1:N --> flashcard_reviews
  |-- 1:N --> timetable_entries
  |-- 1:N --> calendar_events
  |-- 1:N --> pdf_documents
  |             |-- 1:N --> pdf_chunks (with embeddings)
  |-- 1:N --> conversations
  |             |-- 1:N --> messages
  |-- 1:N --> notifications
  |-- 1:N --> study_sessions
  |-- 1:N --> analytics_snapshots
```

### 17.3 Core Tables

#### users
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| phone | VARCHAR(15) | UNIQUE, NULLABLE | Indian phone number for OTP |
| password_hash | VARCHAR(255) | NOT NULL | Argon2 hashed password |
| full_name | VARCHAR(100) | NOT NULL | Display name |
| preferred_language | VARCHAR(10) | DEFAULT 'en' | 'en', 'ta', 'tanglish' |
| avatar_url | VARCHAR(500) | NULLABLE | Profile image URL |
| subscription_tier | VARCHAR(20) | DEFAULT 'free' | 'free', 'scholar', 'scholar_pro' |
| subscription_expires_at | TIMESTAMP | NULLABLE | Subscription expiry |
| is_active | BOOLEAN | DEFAULT TRUE | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification |
| last_login_at | TIMESTAMP | NULLABLE | Last successful login |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | Onboarding status |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Kolkata' | User timezone |

**Indexes:** `idx_users_email` (UNIQUE), `idx_users_phone` (UNIQUE), `idx_users_subscription`
**Relationships:** One-to-Many with `academic_profiles`, `study_plans`, `notes`, etc.

#### academic_profiles
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Owner |
| education_level | VARCHAR(30) | NOT NULL | 'school', 'college', 'professional', 'competitive' |
| field | VARCHAR(50) | NOT NULL | 'engineering', 'medical', 'commerce', 'arts', etc. |
| specialization | VARCHAR(100) | NULLABLE | 'Computer Science', 'Cardiology', etc. |
| institution_name | VARCHAR(200) | NULLABLE | 'Anna University', 'IIT Madras', etc. |
| board | VARCHAR(50) | NULLABLE | 'CBSE', 'State Board', 'ICSE' |
| current_year | INTEGER | NULLABLE | 1, 2, 3, 4 |
| current_semester | INTEGER | NULLABLE | 1-8 |
| target_score | DECIMAL(5,2) | NULLABLE | Target GPA/percentage/rank |
| academic_year_start | DATE | NULLABLE | Academic year start |
| academic_year_end | DATE | NULLABLE | Academic year end |
| is_active | BOOLEAN | DEFAULT TRUE | Current active profile |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_academic_profiles_user_active` (user_id, is_active)
**Relationships:** Many-to-One with `users`, One-to-Many with `subject_enrollments`

#### subjects
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Subject name |
| code | VARCHAR(20) | NULLABLE | Subject code (CS301, etc.) |
| education_level | VARCHAR(30) | NOT NULL | Filterable |
| field | VARCHAR(50) | NOT NULL | Filterable |
| board_or_university | VARCHAR(200) | NULLABLE | Institution-specific |
| semester | INTEGER | NULLABLE | Semester number |
| total_units | INTEGER | DEFAULT 0 | Number of units/chapters |
| credit_hours | INTEGER | DEFAULT 0 | Credit hours |
| is_lab | BOOLEAN | DEFAULT FALSE | Lab subject flag |
| syllabus_json | JSONB | NULLABLE | Structured syllabus (units, topics) |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_subjects_level_field` (education_level, field), `idx_subjects_name_gin` (GIN trigram on name)

#### attendance_records
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Student |
| subject_id | UUID | FK subjects(id), NOT NULL | Subject attended |
| date | DATE | NOT NULL | Class date |
| status | VARCHAR(10) | NOT NULL | 'present', 'absent', 'cancelled', 'holiday' |
| period | INTEGER | NULLABLE | Period number (1-8) |
| marked_at | TIMESTAMP | DEFAULT NOW() | When the student marked |
| is_synced | BOOLEAN | DEFAULT TRUE | Offline sync flag |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_attendance_user_subject_date` (UNIQUE: user_id, subject_id, date, period), `idx_attendance_user_date` (user_id, date)
**Constraints:** CHECK status IN ('present', 'absent', 'cancelled', 'holiday')

#### notes
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Author |
| subject_id | UUID | FK subjects(id), NULLABLE | Associated subject |
| title | VARCHAR(300) | NOT NULL | Note title |
| content | TEXT | NOT NULL | Markdown content |
| plain_text | TEXT | NOT NULL | Plain text for search |
| source | VARCHAR(20) | DEFAULT 'manual' | 'manual', 'voice', 'ocr', 'pdf_extract', 'ai_generated' |
| tags | JSONB | DEFAULT '[]' | Array of tag strings |
| unit_number | INTEGER | NULLABLE | Syllabus unit reference |
| topic | VARCHAR(200) | NULLABLE | Specific topic |
| is_pinned | BOOLEAN | DEFAULT FALSE | Pin to top |
| is_archived | BOOLEAN | DEFAULT FALSE | Soft archive |
| word_count | INTEGER | DEFAULT 0 | Word count |
| last_reviewed_at | TIMESTAMP | NULLABLE | For spaced repetition |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_notes_user_subject` (user_id, subject_id), `idx_notes_fulltext` (GIN on plain_text using pg_trgm), `idx_notes_tags` (GIN on tags)

#### note_embeddings
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| note_id | UUID | FK notes(id), NOT NULL | Parent note |
| chunk_index | INTEGER | NOT NULL | Chunk order |
| chunk_text | TEXT | NOT NULL | Text chunk (512 token max) |
| embedding | VECTOR(768) | NOT NULL | Gemini embedding vector |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_note_embeddings_vector` (HNSW on embedding using cosine distance), `idx_note_embeddings_note` (note_id)

#### flashcards
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Owner |
| subject_id | UUID | FK subjects(id), NULLABLE | Associated subject |
| front | TEXT | NOT NULL | Question/prompt side |
| back | TEXT | NOT NULL | Answer side |
| source | VARCHAR(20) | DEFAULT 'manual' | 'manual', 'ai_generated', 'pdf_extract', 'note_extract' |
| source_id | UUID | NULLABLE | ID of source note/PDF |
| difficulty | DECIMAL(3,2) | DEFAULT 2.50 | SM-2 easiness factor |
| interval_days | INTEGER | DEFAULT 1 | Days until next review |
| repetitions | INTEGER | DEFAULT 0 | Number of successful reviews |
| next_review_date | DATE | NOT NULL | Next scheduled review |
| tags | JSONB | DEFAULT '[]' | Tags |
| bloom_level | VARCHAR(20) | NULLABLE | 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create' |
| is_archived | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_flashcards_user_next_review` (user_id, next_review_date), `idx_flashcards_user_subject` (user_id, subject_id)

#### study_plans
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Owner |
| title | VARCHAR(200) | NOT NULL | Plan name |
| start_date | DATE | NOT NULL | Plan start |
| end_date | DATE | NOT NULL | Plan end |
| plan_type | VARCHAR(20) | DEFAULT 'weekly' | 'daily', 'weekly', 'exam_prep', 'custom' |
| status | VARCHAR(20) | DEFAULT 'active' | 'active', 'completed', 'archived' |
| generation_context | JSONB | NULLABLE | Context used to generate plan |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

#### study_blocks
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| plan_id | UUID | FK study_plans(id), NOT NULL | Parent plan |
| subject_id | UUID | FK subjects(id), NOT NULL | Subject |
| date | DATE | NOT NULL | Scheduled date |
| start_time | TIME | NOT NULL | Block start |
| end_time | TIME | NOT NULL | Block end |
| topic | VARCHAR(200) | NOT NULL | Topic to study |
| block_type | VARCHAR(20) | DEFAULT 'study' | 'study', 'revision', 'practice', 'break' |
| priority | VARCHAR(10) | DEFAULT 'medium' | 'high', 'medium', 'low' |
| is_completed | BOOLEAN | DEFAULT FALSE | Completion status |
| actual_duration_minutes | INTEGER | NULLABLE | Actual time spent |
| notes | TEXT | NULLABLE | Session notes |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_study_blocks_plan_date` (plan_id, date), `idx_study_blocks_date_user` (date, user_id via JOIN)

#### conversations
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK users(id), NOT NULL | Participant |
| title | VARCHAR(200) | NULLABLE | Auto-generated title |
| context_snapshot | JSONB | NOT NULL | Student context at conversation start |
| message_count | INTEGER | DEFAULT 0 | Total messages |
| total_tokens_used | INTEGER | DEFAULT 0 | Token tracking for billing |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

#### messages
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| conversation_id | UUID | FK conversations(id), NOT NULL | Parent conversation |
| role | VARCHAR(20) | NOT NULL | 'user', 'assistant', 'tool_call', 'tool_result' |
| content | TEXT | NOT NULL | Message text or JSON |
| tool_name | VARCHAR(50) | NULLABLE | Tool name if role is tool_call |
| tool_args | JSONB | NULLABLE | Tool arguments if role is tool_call |
| tool_result | JSONB | NULLABLE | Tool response if role is tool_result |
| tokens_used | INTEGER | DEFAULT 0 | Tokens for this message |
| latency_ms | INTEGER | NULLABLE | Response time |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:** `idx_messages_conversation_created` (conversation_id, created_at)

### 17.4 Database Optimization Strategy

| Strategy | Implementation |
|----------|---------------|
| **Connection Pooling** | Use asyncpg with SQLAlchemy's pool_size=20, max_overflow=10. PgBouncer in production for multi-instance pooling. |
| **Query Optimization** | All queries use indexed columns. N+1 queries prevented via SQLAlchemy selectinload/joinedload. EXPLAIN ANALYZE on all new queries. |
| **Partitioning** | `attendance_records` partitioned by month (range partition on date). `messages` partitioned by month. Keeps individual partition sizes manageable. |
| **JSONB Indexes** | GIN indexes on all JSONB columns used in WHERE clauses (tags, syllabus_json). |
| **Vacuum Strategy** | Auto-vacuum tuned for write-heavy tables (attendance, messages). Manual vacuum after bulk imports. |
| **Read Replicas** | Production uses 1-2 read replicas for heavy read queries (analytics, search). Write operations always go to primary. |

---

## 18. Caching

### 18.1 Cache Architecture

```
[Client Request]
      |
      v
[Check Redis Cache]
  |           |
  v           v
[HIT]       [MISS]
  |           |
  v           v
[Return      [Query DB]
 cached]      |
              v
             [Store in Redis]
              |
              v
             [Return fresh data]
```

### 18.2 Cache Strategy by Data Type

| Data | Cache Key Pattern | TTL | Invalidation Strategy |
|------|------------------|-----|----------------------|
| User profile | `user:{user_id}` | 1 hour | Invalidate on profile update |
| Attendance summary | `attendance:{user_id}:{subject_id}` | 15 minutes | Invalidate on new attendance record |
| Study plan (today) | `plan:{user_id}:{date}` | 30 minutes | Invalidate on plan modification |
| Timetable | `timetable:{user_id}:{semester}` | 24 hours | Invalidate on timetable update |
| Subject list | `subjects:{level}:{field}` | 24 hours | Invalidate on catalog update |
| Flashcard due count | `flashcards:due:{user_id}` | 10 minutes | Invalidate on review |
| AI rate limit counter | `ratelimit:ai:{user_id}:{date}` | 24 hours | Auto-expire |
| Session data | `session:{session_id}` | 7 days | Invalidate on logout |

### 18.3 Redis Data Structures Used

| Structure | Use Case |
|-----------|----------|
| **STRING** | Simple key-value caches (user profile, attendance summary) |
| **HASH** | Complex objects (study plan with nested blocks) |
| **SORTED SET** | Leaderboards, notification priority queue |
| **LIST** | Notification inbox (LPUSH/RPOP) |
| **SET** | Active WebSocket connections per user |
| **STREAM** | Event streaming for real-time notifications |

### 18.4 Cache Warming

On user login, a Celery task pre-warms the following caches:
1. User profile
2. Today's study plan
3. Today's timetable
4. Attendance summary for all subjects
5. Due flashcard count
6. Upcoming deadlines (next 7 days)

This ensures the dashboard loads instantly from cache.

---

## 19. Background Workers

### 19.1 Celery Configuration

```python
# app/core/celery_app.py
from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "scholar_os",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.study_plan_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.embedding_tasks",
        "app.tasks.ocr_tasks",
        "app.tasks.analytics_tasks",
        "app.tasks.sync_tasks",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    task_track_started=True,
    task_time_limit=300,           # 5 minute hard limit
    task_soft_time_limit=240,      # 4 minute soft limit
    worker_prefetch_multiplier=1,  # Fair task distribution
    worker_max_tasks_per_child=100,# Prevent memory leaks
)
```

### 19.2 Task Registry

| Task | Trigger | Priority | Retry | Description |
|------|---------|----------|-------|-------------|
| `generate_study_plan` | On demand (AI tool call) | HIGH | 3x with exponential backoff | Generate or regenerate study plan using Gemini |
| `generate_embeddings` | On note create/update | MEDIUM | 3x | Chunk note text and generate Gemini embeddings |
| `process_ocr` | On image upload | HIGH | 2x | Extract text from photograph using OCR service |
| `process_pdf` | On PDF upload | MEDIUM | 2x | Extract text, generate chunks, create embeddings |
| `send_notification` | On event trigger | HIGH | 3x | Push notification via WebSocket and/or push service |
| `daily_analytics_snapshot` | Cron: 23:59 daily | LOW | 1x | Aggregate daily study data into analytics_snapshots |
| `attendance_risk_alert` | Cron: 07:00 daily | HIGH | 1x | Check attendance thresholds, send alerts if at risk |
| `spaced_rep_reminder` | Cron: 08:00 daily | MEDIUM | 1x | Notify users about due flashcard reviews |
| `study_plan_refresh` | Cron: 00:00 daily | LOW | 1x | Auto-generate next day's study blocks for active plans |
| `sync_offline_data` | On reconnection | HIGH | 5x | Process queued offline mutations |
| `cleanup_expired_sessions` | Cron: 03:00 daily | LOW | 1x | Remove expired Redis sessions and JWT blacklist entries |
| `exam_predictor_update` | On new score entry | MEDIUM | 2x | Recalculate exam predictions based on new data |

### 19.3 Task Monitoring

- **Flower Dashboard:** Running at `/flower` (auth-protected), provides real-time task monitoring, worker health, and failure alerts.
- **Dead Letter Queue:** Failed tasks after max retries are moved to a dead letter queue for manual inspection.
- **Alerting:** Tasks failing more than 5 times in 1 hour trigger a PagerDuty alert.

---

## 20. API Architecture

### 20.1 API Design Principles

- **RESTful:** Resources are nouns. HTTP methods are verbs. Status codes are meaningful.
- **Versioned:** All endpoints under `/api/v1/`. Breaking changes require `/api/v2/`.
- **Consistent:** All responses follow the same envelope format.
- **Paginated:** All list endpoints support cursor-based pagination.
- **Filtered:** All list endpoints support query parameter filtering.
- **Documented:** OpenAPI 3.1 auto-generated by FastAPI. Available at `/docs`.

### 20.2 Response Envelope

```json
{
    "status": "success",
    "data": { },
    "meta": {
        "request_id": "uuid",
        "timestamp": "ISO-8601",
        "pagination": {
            "cursor": "opaque-string",
            "has_more": true,
            "total_count": 150
        }
    }
}
```

**Error Response:**
```json
{
    "status": "error",
    "error": {
        "code": "ATTENDANCE_NOT_FOUND",
        "message": "Attendance record for the specified date was not found.",
        "details": { }
    },
    "meta": {
        "request_id": "uuid",
        "timestamp": "ISO-8601"
    }
}
```

### 20.3 Endpoint Registry

#### Authentication
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| POST | `/api/v1/auth/register` | Create account | None | 5/min |
| POST | `/api/v1/auth/login` | Login (email+password) | None | 10/min |
| POST | `/api/v1/auth/login/google` | Google OAuth login | None | 10/min |
| POST | `/api/v1/auth/login/otp/request` | Request OTP | None | 3/min |
| POST | `/api/v1/auth/login/otp/verify` | Verify OTP | None | 5/min |
| POST | `/api/v1/auth/refresh` | Refresh access token | Refresh Token | 30/min |
| POST | `/api/v1/auth/logout` | Logout (revoke tokens) | JWT | 10/min |
| POST | `/api/v1/auth/password/reset` | Request password reset | None | 3/min |

#### Users
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/users/me` | Get current user profile | JWT | 60/min |
| PATCH | `/api/v1/users/me` | Update profile | JWT | 30/min |
| DELETE | `/api/v1/users/me` | Delete account | JWT | 1/hour |
| POST | `/api/v1/users/me/onboarding` | Submit onboarding data | JWT | 5/min |

#### Study Plans
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/study-plans` | List all plans | JWT | 60/min |
| GET | `/api/v1/study-plans/today` | Get today's plan with blocks | JWT | 120/min |
| POST | `/api/v1/study-plans` | Create new plan | JWT | 10/min |
| GET | `/api/v1/study-plans/{id}` | Get plan detail | JWT | 60/min |
| PATCH | `/api/v1/study-plans/{id}` | Update plan | JWT | 30/min |
| DELETE | `/api/v1/study-plans/{id}` | Delete plan | JWT | 10/min |
| PATCH | `/api/v1/study-plans/{id}/blocks/{block_id}` | Mark block complete | JWT | 120/min |

#### Attendance
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/attendance` | Get attendance summary | JWT | 60/min |
| GET | `/api/v1/attendance/{subject_id}` | Get subject attendance detail | JWT | 60/min |
| POST | `/api/v1/attendance` | Mark attendance | JWT | 60/min |
| GET | `/api/v1/attendance/prediction` | Get attendance prediction | JWT | 30/min |

#### Notes
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/notes` | List notes (filterable) | JWT | 60/min |
| POST | `/api/v1/notes` | Create note | JWT | 60/min |
| GET | `/api/v1/notes/{id}` | Get note detail | JWT | 60/min |
| PATCH | `/api/v1/notes/{id}` | Update note | JWT | 60/min |
| DELETE | `/api/v1/notes/{id}` | Delete note | JWT | 30/min |
| POST | `/api/v1/notes/search` | Semantic search notes | JWT | 30/min |

#### Assignments
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/assignments` | List assignments | JWT | 60/min |
| POST | `/api/v1/assignments` | Create assignment | JWT | 30/min |
| GET | `/api/v1/assignments/{id}` | Get assignment detail | JWT | 60/min |
| PATCH | `/api/v1/assignments/{id}` | Update assignment | JWT | 30/min |

#### Flashcards
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/flashcards` | List flashcards | JWT | 60/min |
| GET | `/api/v1/flashcards/due` | Get due flashcards | JWT | 120/min |
| POST | `/api/v1/flashcards` | Create flashcard | JWT | 60/min |
| POST | `/api/v1/flashcards/{id}/review` | Submit review result | JWT | 120/min |
| POST | `/api/v1/flashcards/generate` | AI-generate from topic | JWT | 10/min |

#### AI Chat
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| POST | `/api/v1/ai/chat` | Send message, get streamed response (SSE) | JWT | Tier-based |
| GET | `/api/v1/ai/conversations` | List conversations | JWT | 30/min |
| GET | `/api/v1/ai/conversations/{id}` | Get conversation history | JWT | 30/min |
| DELETE | `/api/v1/ai/conversations/{id}` | Delete conversation | JWT | 10/min |

#### Voice
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| WS | `/api/v1/voice/stream` | Bi-directional voice streaming | JWT | Scholar+ |
| POST | `/api/v1/voice/transcribe` | Upload audio for transcription | JWT | 10/min |

#### PDF
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| POST | `/api/v1/pdf/upload` | Upload PDF | JWT | 10/min |
| GET | `/api/v1/pdf/{id}` | Get PDF metadata | JWT | 60/min |
| GET | `/api/v1/pdf/{id}/content` | Get extracted text | JWT | 30/min |
| POST | `/api/v1/pdf/{id}/search` | Semantic search within PDF | JWT | 30/min |

#### Analytics
| Method | Endpoint | Purpose | Auth | Rate Limit |
|--------|----------|---------|------|------------|
| GET | `/api/v1/analytics/dashboard` | Get dashboard analytics | JWT | 30/min |
| GET | `/api/v1/analytics/study-time` | Get study time analytics | JWT | 30/min |
| GET | `/api/v1/analytics/subjects` | Get per-subject analytics | JWT | 30/min |
| GET | `/api/v1/analytics/predictions` | Get exam predictions | JWT | 30/min |

### 20.4 API Validation Rules

All request bodies are validated by Pydantic V2 schemas:

```python
class AttendanceCreate(BaseModel):
    subject_id: UUID
    date: date
    status: Literal["present", "absent"]
    period: int = Field(ge=1, le=8, default=1)

    @field_validator("date")
    @classmethod
    def date_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Cannot mark attendance for future dates")
        return v
```

### 20.5 Rate Limiting Implementation

Rate limiting is implemented at two levels:
1. **Nginx level:** IP-based rate limiting (100 req/min per IP) for DDoS protection.
2. **Application level:** User-based rate limiting using Redis sliding window counters. Limits vary by endpoint and subscription tier.

---

## 21. Authentication

### 21.1 Authentication Strategy

ScholarOS uses a **JWT-based stateless authentication** system with HttpOnly cookies for token storage, supporting three authentication methods:

1. **Email + Password** — Traditional registration with Argon2id password hashing.
2. **Google OAuth 2.0** — One-tap sign-in via Authorization Code flow with PKCE.
3. **Phone OTP** — SMS-based one-time password for Indian students (via MSG91 or Twilio).

### 21.2 Token Lifecycle

| Token | Storage | TTL | Rotation |
|-------|---------|-----|----------|
| Access Token | HttpOnly, Secure, SameSite=Strict cookie | 15 minutes | Replaced on refresh |
| Refresh Token | HttpOnly, Secure, SameSite=Strict cookie | 7 days | Rotated on every use (one-time use) |
| CSRF Token | Meta tag / X-header | Session-scoped | Regenerated per session |

### 21.3 Security Measures

- **Password Hashing:** Argon2id with memory=65536, iterations=3, parallelism=4.
- **Refresh Token Rotation:** On every refresh, the old token is blacklisted in Redis and a new one issued. Reuse of a blacklisted token triggers immediate session revocation for all tokens in that family.
- **JWT Claims:** `sub` (user_id), `exp` (expiry), `iat` (issued at), `jti` (unique token ID), `tier` (subscription tier).
- **Secret Key Management:** JWT signing key stored in environment variable, rotated quarterly. Previous key valid for 24 hours after rotation to allow token expiry.
- **Brute Force Protection:** After 5 failed login attempts, account is temporarily locked for 15 minutes. After 10 attempts, CAPTCHA required.

---

## 22. Authorization

### 22.1 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **free_user** | Basic CRUD on own data, 10 AI queries/day, 2 subjects max |
| **scholar_user** | Full CRUD, unlimited AI, voice, OCR, PDF, all subjects |
| **scholar_pro_user** | Everything in scholar + advanced analytics, export, API access |
| **admin** | User management, content catalog management, analytics dashboard |

### 22.2 Resource-Level Authorization

Every database query is scoped to the authenticated user:

```python
# All queries include user_id filter
async def get_notes(self, user_id: UUID) -> list[Note]:
    result = await self.db.execute(
        select(Note)
        .where(Note.user_id == user_id)
        .where(Note.is_archived == False)
        .order_by(Note.updated_at.desc())
    )
    return result.scalars().all()
```

There is no endpoint that allows one user to access another user's data. This is enforced at the repository layer, not the endpoint layer, to prevent accidental data leaks.

### 22.3 Subscription Tier Enforcement

Tier limits are checked via a FastAPI dependency:

```python
class RequiresTier:
    def __init__(self, minimum_tier: str):
        self.minimum_tier = minimum_tier
    
    async def __call__(self, user: User = Depends(get_current_user)):
        tier_hierarchy = {"free": 0, "scholar": 1, "scholar_pro": 2}
        if tier_hierarchy.get(user.subscription_tier, 0) < tier_hierarchy[self.minimum_tier]:
            raise HTTPException(
                status_code=403,
                detail=f"This feature requires {self.minimum_tier} subscription"
            )
        return user
```

---

## 23. Storage

### 23.1 Object Storage Architecture

| Content Type | Storage | Max Size | Access Pattern |
|-------------|---------|----------|----------------|
| PDF documents | S3/MinIO bucket `scholar-pdfs` | 50MB per file | Upload once, read many |
| OCR images | S3/MinIO bucket `scholar-images` | 10MB per file | Upload once, process, archive |
| Profile avatars | S3/MinIO bucket `scholar-avatars` | 2MB per file | Read-heavy, CDN-cached |
| Export files | S3/MinIO bucket `scholar-exports` | 100MB | Write once, download once, expire in 24h |
| Voice recordings | S3/MinIO bucket `scholar-voice` | 25MB per file | Upload, transcribe, archive |

### 23.2 Upload Flow

1. Client requests a pre-signed upload URL from `POST /api/v1/storage/upload-url`.
2. Backend generates a time-limited (15 min) pre-signed S3 URL.
3. Client uploads directly to S3 (no backend proxy, reduces load).
4. Client notifies backend with the S3 key via `POST /api/v1/storage/confirm`.
5. Backend triggers appropriate Celery task (OCR, PDF processing, etc.).

### 23.3 CDN Strategy

- Profile avatars and static assets served via CloudFront/Cloudflare CDN.
- PDFs served directly from S3 with signed URLs (per-user access control).
- Cache-Control headers: avatars (1 year, immutable), PDFs (no-cache, signed URL).

---

## 24. Synchronization

### 24.1 Sync Architecture

ScholarOS uses a **client-first, eventually consistent** sync model:

```
[Client (IndexedDB)]
      |
      +-- Outbox Queue (pending mutations)
      |
      v
[Sync Engine]
      |
      +-- On connect: push outbox to server
      +-- On push success: clear outbox entry
      +-- On conflict: server wins (last-write-wins)
      +-- Pull: fetch changes since last_sync_timestamp
      |
      v
[Server (PostgreSQL)]
      |
      +-- updated_at column on every table
      +-- Delta sync: WHERE updated_at > last_sync
```

### 24.2 Conflict Resolution

- **Strategy:** Last-Write-Wins (LWW) based on `updated_at` timestamp.
- **Rationale:** ScholarOS is a single-user application. Multi-device conflicts are rare and low-stakes. LWW is the simplest and most predictable strategy.
- **Edge Case:** If a student edits a note on their phone (offline) and laptop (online) simultaneously, the version with the later timestamp wins. The losing version is stored in a `note_versions` table for manual recovery if needed.

### 24.3 Sync Frequency

| Trigger | Action |
|---------|--------|
| App comes online | Full outbox push + delta pull |
| Every 5 minutes (if online) | Delta pull for notifications and schedule changes |
| On explicit user action (pull-to-refresh) | Full delta pull |
| On data mutation (while online) | Immediate push |

---

## 25. Offline First

### 25.1 Offline Storage Schema (Dexie.js)

```typescript
const db = new Dexie("ScholarOS");

db.version(1).stores({
    user: "id",
    subjects: "id, name",
    studyPlans: "id, userId, startDate",
    studyBlocks: "id, planId, date, subjectId",
    attendance: "id, userId, subjectId, date, [userId+subjectId+date]",
    notes: "id, userId, subjectId, *tags, updatedAt",
    flashcards: "id, userId, subjectId, nextReviewDate",
    timetable: "id, userId, dayOfWeek",
    assignments: "id, userId, dueDate",
    outbox: "++id, table, operation, createdAt",
    syncMeta: "key"
});
```

### 25.2 Outbox Pattern

When offline, mutations are queued:

```typescript
async function createNoteOffline(note: NoteCreate) {
    const localId = crypto.randomUUID();
    await db.notes.add({ id: localId, ...note, _isSynced: false });
    await db.outbox.add({
        table: "notes",
        operation: "create",
        payload: { id: localId, ...note },
        createdAt: new Date()
    });
    return localId;
}
```

### 25.3 Service Worker Caching Strategy (Workbox)

| Route | Strategy | Rationale |
|-------|----------|-----------|
| App shell (HTML, JS, CSS) | StaleWhileRevalidate | Instant load with background update |
| API GET requests | NetworkFirst with 5s timeout | Fresh data preferred, fallback to cache |
| Static assets (fonts, icons) | CacheFirst | Immutable, never changes |
| Images | CacheFirst with expiration (30 days) | Reduces bandwidth |
| API POST/PATCH/DELETE | NetworkOnly with BackgroundSync | Must reach server, queue if offline |

---

## 26. PWA

### 26.1 PWA Configuration

```json
{
    "name": "ScholarOS",
    "short_name": "Scholar",
    "description": "AI Operating System for Students",
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait-primary",
    "theme_color": "#0A0A0B",
    "background_color": "#0A0A0B",
    "categories": ["education", "productivity"],
    "lang": "en",
    "dir": "ltr",
    "icons": [
        {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ],
    "screenshots": [
        {"src": "/screenshots/dashboard.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow"},
        {"src": "/screenshots/desktop.png", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide"}
    ]
}
```

### 26.2 Install Prompt Strategy

- Show a custom install banner after the user has completed onboarding and used the app for 2 sessions.
- Banner text: "Install ScholarOS for offline access and faster load times."
- Never interrupt during study sessions or voice interactions.
- Respect user dismissal (do not show again for 7 days).

---

## 27. Mobile Strategy

### 27.1 Approach: PWA + Capacitor

- **Primary distribution:** PWA (installable from browser, no app store required).
- **Secondary distribution:** Capacitor-wrapped native apps for Google Play Store and Apple App Store.
- **Rationale:** PWA reaches the widest audience with zero friction. Capacitor provides native APIs (push notifications, biometrics, background sync) and app store presence for discoverability.

### 27.2 Capacitor Plugins Required

| Plugin | Purpose |
|--------|---------|
| `@capacitor/push-notifications` | Native push notifications |
| `@capacitor/camera` | OCR image capture |
| `@capacitor/filesystem` | PDF download and offline storage |
| `@capacitor/haptics` | Haptic feedback for interactions |
| `@capacitor/keyboard` | Keyboard show/hide handling |
| `@capacitor/splash-screen` | Native splash screen |
| `@capacitor/status-bar` | Status bar styling |
| `@capacitor/share` | Native share sheet |
| `@capacitor/local-notifications` | Study reminders |

### 27.3 Mobile-Specific UX

- **Bottom navigation** with 5 items: Home, Study, Notes, AI, Profile.
- **Swipe gestures:** Swipe right to mark attendance. Swipe left to dismiss notification.
- **Pull-to-refresh** on all list views.
- **Floating Action Button (FAB):** Quick actions — new note, new flashcard, start study session.
- **Voice activation:** Microphone button always visible in the top bar.

---

## 28. Desktop Strategy

### 28.1 Desktop-Specific Features

- **Split-pane layout:** PDF reader on the left, notes editor on the right.
- **Command palette:** `Cmd/Ctrl + K` opens a Raycast-style command palette for quick navigation.
- **Keyboard shortcuts:** Full keyboard navigation for power users.
- **Wide dashboard:** 3-column layout (sidebar + main content + AI panel).
- **Drag and drop:** Reorder study blocks, organize notes.

### 28.2 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + N` | New note |
| `Cmd/Ctrl + Shift + N` | New flashcard |
| `Cmd/Ctrl + /` | Toggle AI chat panel |
| `Cmd/Ctrl + .` | Start/stop study timer |
| `Cmd/Ctrl + 1-9` | Navigate to sidebar items |
| `Cmd/Ctrl + Enter` | Send AI message |
| `Esc` | Close modal/panel |
| `Space` (in flashcard review) | Flip card |
| `1-4` (in flashcard review) | Rate recall (Again/Hard/Good/Easy) |

---

## 29. Accessibility

### 29.1 WCAG 2.2 AA Compliance Checklist

| Criterion | Implementation |
|-----------|---------------|
| **1.1.1 Non-text Content** | All images have alt text. Icons have aria-labels. Decorative images use aria-hidden. |
| **1.3.1 Info and Relationships** | Semantic HTML throughout. Headings in logical order. Lists use list elements. |
| **1.4.3 Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text. Verified with axe. |
| **1.4.11 Non-text Contrast** | All interactive elements have 3:1 contrast against adjacent colors. |
| **2.1.1 Keyboard** | All functionality available via keyboard. No keyboard traps. |
| **2.4.3 Focus Order** | Logical tab order. Focus trapped in modals. Focus returns after modal close. |
| **2.4.7 Focus Visible** | Custom focus ring (2px solid, high contrast) on all interactive elements. |
| **2.5.8 Target Size** | All touch targets minimum 44x44px on mobile. |
| **3.2.2 On Input** | No automatic context changes on input. Form submission requires explicit action. |
| **4.1.2 Name, Role, Value** | All custom components have appropriate ARIA roles, states, and properties. |

### 29.2 Screen Reader Support

- All components built on Radix UI primitives (via shadcn/ui) which include built-in ARIA attributes.
- Live regions (`aria-live="polite"`) for AI streaming responses, notification counts, and timer updates.
- Navigation landmarks: `<header>`, `<nav>`, `<main>`, `<aside>` for AI panel, `<footer>`.
- Form error announcements via `aria-describedby` linking to error messages.

### 29.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

Framer Motion respects this via `useReducedMotion()` hook. All animations are disabled or replaced with instant transitions.

---

## 30. Animations

### 30.1 Animation Philosophy

Animations serve three purposes in ScholarOS:
1. **Feedback:** Confirm user actions (button press, attendance marked, note saved).
2. **Orientation:** Show where content came from or is going (page transitions, panel slides).
3. **Delight:** Subtle rewards for achievements (streak badges, completion celebrations).

Animations are never decorative-only. Every animation must serve a functional purpose.

### 30.2 Animation Tokens

```typescript
export const motion = {
    duration: {
        instant: 0.1,
        fast: 0.2,
        normal: 0.3,
        slow: 0.5,
        glacial: 0.8
    },
    easing: {
        default: [0.25, 0.1, 0.25, 1],     // ease-out
        bounce: [0.34, 1.56, 0.64, 1],      // overshoot
        spring: { stiffness: 300, damping: 20 },
        smooth: [0.4, 0, 0.2, 1]            // material
    }
};
```

### 30.3 Animation Catalog

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade + slide up (8px) | 0.3s | smooth |
| Card hover | Scale to 1.02 + shadow elevation | 0.2s | default |
| Button press | Scale to 0.97 | 0.1s | default |
| Modal open | Fade in + scale from 0.95 | 0.3s | spring |
| Modal close | Fade out + scale to 0.95 | 0.2s | default |
| Sidebar toggle | Width transition | 0.3s | smooth |
| Flashcard flip | 3D rotateY 180deg | 0.5s | smooth |
| Progress bar fill | Width transition | 0.8s | smooth |
| AI message appear | Fade in + slide up (4px) per token | 0.1s | default |
| Attendance marked | Checkmark draw + subtle green pulse | 0.5s | bounce |
| Study streak badge | Scale from 0 + rotation | 0.5s | spring |
| Notification bell | Subtle shake (2px) | 0.3s | default |
| Voice listening | Pulsing microphone ring | Continuous | ease-in-out loop |

---

## 31. Modern UI

### 31.1 Design Inspiration

ScholarOS draws visual inspiration from:
- **Apple:** Clean typography, generous whitespace, rounded corners, depth through subtle shadows.
- **Linear:** Dense information display, monochromatic palette, keyboard-centric navigation.
- **Raycast:** Command palette UX, instant search, productivity-focused UI.
- **Notion:** Block-based content, sidebar navigation, inline AI.
- **Perplexity:** AI-first interface, streaming responses, source citations.
- **Vercel:** Dark mode excellence, gradient accents, modern card design.

### 31.2 Design Principles

1. **Density with Clarity:** Show maximum useful information without visual clutter. Use typography hierarchy and spacing to create clarity, not borders and dividers.
2. **Dark Mode First:** The primary theme is dark. Light mode is fully supported but dark is the default. Students study at night.
3. **Glassmorphism (subtle):** Sidebar and floating panels use a 12px blur with 60% opacity background. Never so much that text becomes unreadable.
4. **Depth through Shadow:** Three elevation levels — flat (default), raised (cards), floating (modals, tooltips). No more.
5. **Monochromatic + Accent:** 95% of the UI is grayscale. Color is reserved for status indicators, progress, and the brand accent.

---

## 32. Design System

### 32.1 Design Tokens (CSS Variables)

```css
:root {
    /* Brand */
    --brand-primary: hsl(250, 80%, 60%);     /* Indigo-violet */
    --brand-primary-hover: hsl(250, 80%, 55%);
    --brand-primary-active: hsl(250, 80%, 50%);
    
    /* Surfaces (Dark Mode) */
    --surface-0: hsl(0, 0%, 4%);              /* App background */
    --surface-1: hsl(0, 0%, 7%);              /* Card background */
    --surface-2: hsl(0, 0%, 10%);             /* Elevated surfaces */
    --surface-3: hsl(0, 0%, 14%);             /* Hover states */
    
    /* Surfaces (Light Mode) */
    --surface-0-light: hsl(0, 0%, 100%);
    --surface-1-light: hsl(0, 0%, 98%);
    --surface-2-light: hsl(0, 0%, 95%);
    --surface-3-light: hsl(0, 0%, 92%);
    
    /* Text */
    --text-primary: hsl(0, 0%, 93%);
    --text-secondary: hsl(0, 0%, 63%);
    --text-tertiary: hsl(0, 0%, 40%);
    --text-inverse: hsl(0, 0%, 4%);
    
    /* Status */
    --status-success: hsl(142, 71%, 45%);
    --status-warning: hsl(38, 92%, 50%);
    --status-error: hsl(0, 84%, 60%);
    --status-info: hsl(210, 100%, 60%);
    
    /* Attendance-specific */
    --attendance-safe: hsl(142, 71%, 45%);    /* 75%+ */
    --attendance-warning: hsl(38, 92%, 50%);  /* 70-75% */
    --attendance-danger: hsl(0, 84%, 60%);    /* Below 70% */
    
    /* Borders */
    --border-default: hsl(0, 0%, 15%);
    --border-hover: hsl(0, 0%, 25%);
    --border-focus: var(--brand-primary);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px hsl(0 0% 0% / 0.3);
    --shadow-md: 0 4px 12px hsl(0 0% 0% / 0.3);
    --shadow-lg: 0 8px 24px hsl(0 0% 0% / 0.4);
    
    /* Radii */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-full: 9999px;
}
```

---

## 33. Typography

### 33.1 Font Stack

```css
:root {
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    --font-tamil: 'Noto Sans Tamil', 'Latha', sans-serif;
}
```

- **Inter:** Primary UI font. Loaded via Google Fonts with `display=swap`. Weights: 400, 500, 600, 700.
- **JetBrains Mono:** Code blocks, monospaced data, timer display.
- **Noto Sans Tamil:** Tamil language text. Loaded conditionally when language is set to Tamil or Tanglish.

### 33.2 Type Scale

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `--text-xs` | 11px | 400 | 1.4 | Captions, timestamps |
| `--text-sm` | 13px | 400 | 1.5 | Secondary text, table data |
| `--text-base` | 15px | 400 | 1.6 | Body text, form inputs |
| `--text-lg` | 17px | 500 | 1.5 | Section headers, card titles |
| `--text-xl` | 20px | 600 | 1.4 | Page section titles |
| `--text-2xl` | 24px | 700 | 1.3 | Page titles |
| `--text-3xl` | 30px | 700 | 1.2 | Hero text, dashboard metrics |
| `--text-4xl` | 36px | 700 | 1.1 | Landing page headlines |

---

## 34. Spacing

### 34.1 Spacing Scale (4px base)

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Input padding, icon gaps |
| `--space-3` | 12px | Button padding, small card padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Large card padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Page section gaps |
| `--space-10` | 40px | Major section gaps |
| `--space-12` | 48px | Page top/bottom padding |
| `--space-16` | 64px | Hero section spacing |

---

## 35. Colors

### 35.1 Semantic Color Palette

All colors are defined in HSL for easy theming:

| Purpose | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `hsl(0, 0%, 4%)` | `hsl(0, 0%, 100%)` |
| Card | `hsl(0, 0%, 7%)` | `hsl(0, 0%, 98%)` |
| Primary Text | `hsl(0, 0%, 93%)` | `hsl(0, 0%, 9%)` |
| Secondary Text | `hsl(0, 0%, 63%)` | `hsl(0, 0%, 40%)` |
| Brand Accent | `hsl(250, 80%, 60%)` | `hsl(250, 70%, 50%)` |
| Success | `hsl(142, 71%, 45%)` | `hsl(142, 76%, 36%)` |
| Warning | `hsl(38, 92%, 50%)` | `hsl(38, 92%, 40%)` |
| Error | `hsl(0, 84%, 60%)` | `hsl(0, 84%, 50%)` |
| Border | `hsl(0, 0%, 15%)` | `hsl(0, 0%, 88%)` |

### 35.2 Subject Color Assignments

Each subject is assigned a unique hue for visual differentiation across charts, badges, and calendar blocks:

```typescript
const subjectHues = [250, 180, 330, 45, 120, 210, 15, 280, 90, 160];
// Indigo, Teal, Pink, Amber, Green, Blue, Orange, Purple, Lime, Cyan
```

---

## 36. Icons

### 36.1 Icon System

- **Primary:** Lucide Icons (open source, consistent, 24x24 grid).
- **Custom:** Subject-specific icons (stethoscope for medical, gavel for law, calculator for commerce) created as SVG components.
- **Size Tokens:** `16px` (inline), `20px` (buttons), `24px` (navigation), `32px` (empty states), `48px` (onboarding).
- **Color:** Icons inherit `currentColor` from parent text. Never hardcode icon colors.

---

## 37. Components

### 37.1 Component Architecture

All components follow a three-tier hierarchy:

1. **Primitives** (ui/): shadcn/ui components. Accessible, unstyled beyond design tokens. Never modified directly.
2. **Composed** (composed/): Product-specific components that wrap primitives with animations, data binding, and business logic.
3. **Page-Level** (app/): Full page compositions using composed components. Handle data fetching and layout.

### 37.2 Core Component Catalog

| Component | Type | Props | Description |
|-----------|------|-------|-------------|
| `AttendanceCard` | Composed | subjectId, compact | Shows attendance percentage with color-coded ring and trend arrow |
| `StudyPlanTimeline` | Composed | planId, date | Vertical timeline of study blocks for a given day |
| `PlanBlock` | Composed | block, onComplete | Individual study block with timer, subject badge, and completion toggle |
| `FlashcardReview` | Composed | cards, onReview | Full-screen flashcard review with flip animation and SM-2 rating buttons |
| `AIChatPanel` | Composed | conversationId | Sliding panel with message list, input, and streaming response |
| `VoiceOverlay` | Composed | - | Full-screen voice assistant with listening animation and transcript |
| `NoteEditor` | Composed | noteId | Rich text editor with markdown support, AI assist toolbar |
| `PDFViewer` | Composed | documentId | PDF reader with highlight, annotation, and AI summary sidebar |
| `ExamPredictorCard` | Composed | subjectId | Displays predicted score with confidence interval and trend |
| `SubjectProgressRing` | Composed | subjectId | Circular progress indicator with topic completion percentage |
| `CommandPalette` | Composed | - | Raycast-style search and action palette |
| `CalendarView` | Composed | month | Monthly calendar with study blocks, classes, and deadlines overlaid |
| `NotificationBell` | Composed | - | Bell icon with unread count badge and dropdown list |
| `StudyTimer` | Composed | duration, onComplete | Pomodoro/custom timer with circular progress and audio alert |

---

## 38. Every Screen

### 38.1 Home Dashboard

**Purpose:** Single-glance overview of the student's academic day.

**Layout:**
- **Mobile:** Single-column stack. Top cards: greeting + streak. Below: Today's plan, Attendance alerts, Due flashcards, Upcoming deadlines.
- **Tablet:** Two-column grid. Left: plan + attendance. Right: AI + flashcards.
- **Desktop:** Three-column. Left: sidebar (always visible). Center: plan + attendance + deadlines. Right: AI chat panel (collapsible).

**Components:**
- Personalized greeting with time-of-day awareness ("Good morning, Priya!")
- Study streak counter with flame icon
- Today's study plan as a vertical timeline with completable blocks
- Attendance alert cards (only shown if any subject is below 76%)
- Due flashcard count with "Review Now" button
- Next 3 upcoming deadlines (assignments, exams)
- AI quick-ask input field at the bottom

**Animations:**
- Cards stagger-animate in on page load (0.05s delay between each)
- Streak counter number animates on change (flip animation)
- Progress rings animate from 0 to current value on mount

**Loading State:** Skeleton screens matching exact card dimensions. No spinners.
**Empty State:** "Your day is clear! Want me to create a study plan?" with CTA button.
**Error State:** "Could not load your dashboard. Showing cached data." with subtle warning banner and retry button.

**Accessibility:**
- H1: "Dashboard"
- Each card has a descriptive aria-label
- Study plan items are an ordered list
- Streak counter announced to screen readers on change

### 38.2 Study Plan Screen

**Purpose:** View and manage study schedules across days and weeks.

**Layout:**
- Weekly view (default): 7-day horizontal scroll with day columns
- Daily view: Detailed timeline for one day
- Calendar view: Monthly overview with study density heatmap

**Components:**
- Day selector (swipeable on mobile)
- Study block cards with subject color, topic, time, and completion checkbox
- AI "Regenerate Plan" button
- Progress bar showing weekly completion percentage
- Drag-and-drop reorder on desktop

**Responsive:** Day columns collapse to swipeable cards on mobile. Full grid on desktop.
**Keyboard:** Arrow keys navigate between blocks. Space toggles completion. Enter opens detail.

### 38.3 Attendance Screen

**Purpose:** Track and predict class attendance per subject.

**Layout:**
- Subject list with circular attendance percentage rings
- Tap a subject to see date-by-date attendance history (calendar heatmap)
- Prediction section: "You can miss X more classes this semester and stay above 75%"

**Components:**
- AttendanceCard per subject (ring + percentage + trend)
- Calendar heatmap (green/red/gray cells)
- Quick-mark buttons for today ("Present" / "Absent")
- Prediction calculator with interactive slider

### 38.4 Notes Screen

**Purpose:** Create, organize, and search notes across subjects.

**Layout:**
- List view (default): Cards showing title, subject, date, preview
- Grid view: Compact tiles
- Search bar with semantic search toggle

**Components:**
- NoteEditor (rich text, markdown, image embed)
- Subject filter tabs
- Sort controls (date, subject, recently viewed)
- AI actions: Summarize, Generate flashcards, Find related notes

### 38.5 AI Chat Screen

**Purpose:** Conversational interface with the ScholarOS AI.

**Layout:**
- Full-height message list with streaming response display
- Input field with send button and microphone button
- Suggested prompts for new conversations
- Conversation history in sidebar (desktop)

**Components:**
- Message bubbles with markdown rendering
- Tool call indicators (loading states while tools execute)
- Source citations as inline chips
- Code block rendering with syntax highlighting

### 38.6 Flashcard Review Screen

**Purpose:** Spaced repetition review session.

**Layout:**
- Full-screen card with front/back content
- Tap/space to flip
- Four rating buttons: Again (1), Hard (2), Good (3), Easy (4)
- Progress indicator (X of Y cards remaining)

**Components:**
- FlashcardReview with 3D flip animation
- Session summary at completion (cards reviewed, accuracy, next review dates)

### 38.7 Settings Screen

**Purpose:** User preferences and account management.

**Sections:**
- Profile (name, email, avatar)
- Academic Profile (institution, year, subjects)
- Language (Tamil / English / Tanglish)
- Theme (Dark / Light / System)
- Notifications (push, email, study reminders)
- Voice (enable/disable, preferred language)
- Data (export, delete account)
- Subscription (current plan, upgrade)

---

## 39. Navigation

### 39.1 Navigation Structure

**Mobile (Bottom Tab Bar):**
```
[Home] [Study] [Notes] [AI] [Profile]
```

**Desktop (Left Sidebar):**
```
ScholarOS Logo
-----------------
Home
Study Plan
Attendance
Notes
Assignments
Exams
Flashcards
Timetable
Calendar
Knowledge Base
Analytics
-----------------
Settings
```

### 39.2 Navigation Rules

- Active item highlighted with brand accent color and subtle background.
- Sidebar is collapsible on desktop (icon-only mode) via hamburger or `Cmd+B`.
- Mobile bottom nav hides on scroll-down, shows on scroll-up (content-first).
- Page transitions use a shared layout animation (content fades, sidebar persists).
- Deep linking supported: every screen has a unique URL.

---

## 40. Information Architecture

### 40.1 Site Map

```
/                              Home Dashboard
/study-plan                    Study Plan (weekly/daily view)
/attendance                    Attendance Summary
/attendance/:subjectId         Subject Attendance Detail
/notes                         Notes List
/notes/:id                     Note Editor/Viewer
/notes/new                     New Note
/assignments                   Assignment List
/assignments/:id               Assignment Detail
/exams                         Exam List and Predictor
/flashcards                    Flashcard Deck List
/flashcards/review             Flashcard Review Session
/timetable                     Weekly Timetable
/calendar                      Monthly Calendar
/knowledge-base                Knowledge Base Search
/analytics                     Analytics Dashboard
/pdf/:id                       PDF Viewer
/settings                      Settings
/settings/profile              Profile Settings
/settings/academic             Academic Profile Settings
/settings/subscription         Subscription Management
/login                         Login Page
/register                      Registration Page
/onboarding                    Onboarding Flow
```

### 40.2 Navigation Hierarchy

- **Level 0:** Authentication (login, register, onboarding)
- **Level 1:** Dashboard (home) — the daily command center
- **Level 2:** Features (study plan, attendance, notes, etc.) — each a self-contained module
- **Level 3:** Detail views (individual note, PDF, conversation) — deep content engagement

---

## 41. Voice Assistant

**Purpose:** Enable hands-free interaction with ScholarOS in Tamil, English, and Tanglish via natural streaming conversation.

**Problem Solved:** Students cannot type while commuting, cooking, or lying in bed. Voice makes ScholarOS accessible during 40% of a student's waking hours when they cannot use a keyboard or touch screen.

### 41.1 Architecture

```
[Microphone Input]
      |
      v
[STT Service (Deepgram/AssemblyAI)]
  +-- WebSocket streaming
  +-- Real-time transcription
  +-- Language auto-detection
      |
      v
[Transcribed Text]
      |
      v
[Gemini 2.5 Flash]
  +-- Student context injected
  +-- Tool calls as needed
  +-- Response generated
      |
      v
[TTS Service (Google Cloud TTS)]
  +-- Voice: Tamil/English neural voice
  +-- Streaming audio output
  +-- SSML for natural pauses
      |
      v
[Speaker Output]
```

### 41.2 STT Integration

- **Provider:** Deepgram (primary) or AssemblyAI (fallback). Both support real-time streaming and Indian English accents.
- **Protocol:** WebSocket from client to backend. Backend forwards audio chunks to STT service.
- **Latency Target:** First partial transcript within 300ms of speech.
- **Endpointing:** VAD (Voice Activity Detection) with 800ms silence threshold to detect end-of-utterance.

### 41.3 TTS Integration

- **Provider:** Google Cloud Text-to-Speech with WaveNet/Neural2 voices.
- **Voices:** `ta-IN-Wavenet-A` (Tamil female), `en-IN-Neural2-A` (English female), with configurable voice preference.
- **Streaming:** Audio chunks streamed to client as they are generated. Client plays audio using Web Audio API for seamless playback.
- **SSML:** Used for natural pauses, emphasis, and number pronunciation.

---

## 42. Tamil

### 42.1 Tamil Language Support

- **UI Strings:** Full Tamil translation of all UI labels, buttons, menus, and error messages. Stored in `/public/locales/ta.json`.
- **AI Responses:** System prompt instructs Gemini to respond in Tamil when user language is set to Tamil. Gemini has strong Tamil capability.
- **Voice:** Tamil STT and TTS fully supported via Deepgram and Google Cloud TTS.
- **Font:** Noto Sans Tamil loaded conditionally. Fallback to Latha.
- **Typography:** Tamil text uses 10% larger line-height (1.8 vs 1.6) for readability due to diacritics.
- **Input:** Tamil keyboard input supported via OS keyboard. No custom input method needed.

---

## 43. English

### 43.1 English Language Support

- **UI Strings:** English is the default language. All strings in `/public/locales/en.json`.
- **AI Responses:** Natural English responses with Indian-English conventions (e.g., "marks" not "grades", "semester" not "term").
- **Voice:** Indian English accent via `en-IN-Neural2-A` voice.
- **Technical Terms:** Academic terminology kept in English even when the interface language is Tamil (e.g., "Binary Tree" stays as "Binary Tree", not transliterated).

---

## 44. Tanglish

### 44.1 Tanglish (Tamil + English) Support

- **Definition:** Code-mixed speech and text where Tamil and English words are used interchangeably within the same sentence. Example: "Naalaikku Data Structures padikanum."
- **AI Handling:** System prompt explicitly instructs Gemini to respond in Tanglish when the user's language preference is set to Tanglish. Example instruction: "Respond naturally mixing Tamil and English, as a college student in Tamil Nadu would speak."
- **STT Challenge:** Standard STT services struggle with code-switching. Solution: Use Deepgram's code-switching model or configure AssemblyAI with dual-language detection.
- **TTS:** Generate TTS in the dominant language of the response. For mixed sentences, use the English voice with Tamil pronunciation hints where possible.
- **UI:** Interface remains in English when Tanglish is selected. Only AI responses and voice are in Tanglish.

---

## 45. Streaming Voice

### 45.1 Bi-directional Streaming Architecture

```
[Client]                              [Server]
   |                                     |
   |-- WebSocket Connect --------------->|
   |                                     |
   |-- Audio Chunks (16kHz PCM) -------->|-- Forward to STT Service
   |                                     |
   |<--- Partial Transcripts ------------|<-- STT partial results
   |                                     |
   |   [User stops speaking]             |
   |                                     |-- Full transcript to Gemini
   |                                     |-- Tool calls executed
   |                                     |-- Response generated
   |                                     |
   |<--- TTS Audio Chunks --------------|<-- TTS streaming
   |<--- Text Transcript  --------------|
   |                                     |
   |   [User interrupts]                 |
   |-- Interrupt Signal ----------------->|-- Cancel current TTS
   |-- New Audio Chunks ----------------->|-- Process new input
```

### 45.2 Interruption Handling

- If the user starts speaking while the AI is responding, the AI response is immediately cancelled.
- Partial AI response is preserved in the conversation history.
- User's new input is processed with the context of the interrupted response.

### 45.3 Latency Budget

| Stage | Target | Measurement |
|-------|--------|-------------|
| Audio capture to first partial transcript | Under 300ms | Client-side |
| Full transcript to Gemini API call | Under 50ms | Server-side |
| Gemini first token | Under 500ms | API response |
| First TTS audio chunk to speaker | Under 200ms after first text token | Server-side |
| **Total perceived latency** | **Under 1.2 seconds** | End-to-end |

---

## 46. Conversation Memory

### 46.1 Memory Architecture

Conversations are stored in the `conversations` and `messages` tables. Before each Gemini API call, the system assembles the context window:

1. **System Prompt** (always included): AI personality, rules, tool definitions.
2. **Student Context** (always included): Current academic state, attendance, upcoming exams.
3. **Conversation History** (sliding window): Last N messages from the current conversation.
4. **Relevant Tool Results** (selective): Previous tool call results that provide important context.

### 46.2 Context Window Management

- **Maximum context:** 32,000 tokens (conservative limit within Gemini's 1M window to control cost).
- **Truncation strategy:** Oldest messages are removed first. Tool results are summarized. System prompt and student context are never truncated.
- **Conversation isolation:** Each conversation is independent. Starting a "New Chat" clears the conversation history but retains student context.

### 46.3 Cross-Conversation Memory

For important facts the student mentions across conversations (e.g., "I have a part-time job on weekends"), these are stored in a `user_preferences` JSONB column on the `users` table and injected into every system prompt.

---

## 47. AI Personality

### 47.1 Personality Definition

**Name:** Scholar (no last name, no gender assignment)

**Traits:**
- **Encouraging but honest.** "You are improving! Your OS score went up by 8 points. Keep going."
- **Concise by default.** Responses are short unless the student asks for detail. No walls of text.
- **Tamil Nadu aware.** Understands local context — Anna University, state board, coaching centers, hostel life.
- **Adaptive formality.** Matches the student's tone. If they use casual Tanglish, Scholar responds casually. If they write formally, Scholar matches.
- **Never condescending.** Never says "This is easy" or "You should know this." Treats every question with respect.
- **Proactively helpful.** "I noticed you have not reviewed Organic Chemistry in 8 days. Want me to schedule a session?"

### 47.2 Things Scholar Never Does

- Generates complete assignment answers.
- Provides medical, legal, or financial advice.
- Comments on a student's intelligence or capability.
- Uses emojis excessively (max 1 per message, and only when contextually appropriate).
- Gives unsolicited advice outside of study recommendations.

---

## 48. Prompt Engineering

### 48.1 System Prompt Structure

```
[ROLE]
You are Scholar, an AI study companion inside ScholarOS. Your job is to help
students study effectively, manage their academic life, and improve their
learning outcomes.

[STUDENT CONTEXT]
{student_context_json}

[LANGUAGE]
Respond in {language_preference}. If Tanglish, mix Tamil and English naturally
as a Tamil Nadu college student would speak.

[RULES]
1. Always use the available tools to get data before answering factual questions
   about the student's academics.
2. Never generate complete assignment or exam answers.
3. When unsure, say so. Never fabricate information.
4. Keep responses concise. Use bullet points for lists.
5. Cite sources when answering from the student's notes or PDFs.
6. For study advice, ground recommendations in the student's actual data
   (scores, attendance, study hours).
7. When the student seems stressed or overwhelmed, be empathetic first,
   then practical.

[TOOL USAGE]
You have access to the following tools. Use them proactively.
Do not guess data that a tool can provide.
{tool_definitions}
```

### 48.2 Prompt Optimization

- System prompt is tokenized once and cached. Only the dynamic portions (student context, recent messages) change per request.
- Tool descriptions are written with Gemini-specific optimization: clear trigger phrases, explicit input/output descriptions, negative examples ("Do NOT use this tool for...").
- Temperature is 0.7 for conversational responses, 0.3 for factual tool-augmented responses (dynamically adjusted based on tool call presence).

---

## 49. Function Calling

Covered in detail in [Section 14: Gemini Tool Calling Architecture](#14-gemini-tool-calling-architecture). This section provides the implementation reference.

### 49.1 Function Call Flow (Code Level)

```python
async def process_ai_message(user: User, message: str, conversation_id: UUID):
    # 1. Load conversation history
    history = await conversation_repo.get_messages(conversation_id, limit=50)
    
    # 2. Assemble context
    context = await build_student_context(user)
    system_prompt = build_system_prompt(context, user.preferred_language)
    
    # 3. Build Gemini messages
    gemini_messages = format_messages_for_gemini(history, system_prompt)
    gemini_messages.append({"role": "user", "parts": [{"text": message}]})
    
    # 4. Call Gemini with streaming
    async for chunk in gemini_client.generate_content_stream(
        model="gemini-2.5-flash",
        contents=gemini_messages,
        tools=tool_registry.get_all_definitions(),
        generation_config=get_generation_config()
    ):
        if chunk.has_tool_calls():
            # 5. Execute tool calls
            for tool_call in chunk.tool_calls:
                result = await tool_executor.execute(
                    tool_name=tool_call.name,
                    arguments=tool_call.args,
                    user=user
                )
                # 6. Send tool result back to Gemini
                yield {"type": "tool_call", "name": tool_call.name, "status": "executing"}
                gemini_messages.append({"role": "tool", "parts": [{"text": json.dumps(result)}]})
            
            # 7. Continue generation with tool results
            continue
        
        if chunk.text:
            # 8. Stream text to client
            yield {"type": "text", "content": chunk.text}
    
    # 9. Save to conversation history
    await conversation_repo.save_messages(conversation_id, gemini_messages)
```

---

## 50. Agent Architecture

### 50.1 Single-Agent Design

ScholarOS uses a **single-agent architecture** — one Gemini instance with access to all tools. There is no multi-agent orchestration, no "planner" agent routing to "specialist" agents. This is intentional:

- **Simplicity:** One agent means one system prompt, one context window, one failure mode.
- **Consistency:** The student always talks to the same "Scholar" personality.
- **Cost:** No inter-agent communication overhead.
- **Debugging:** Conversation transcripts are linear, not branching.

### 50.2 Agent Capabilities

The single agent can perform any combination of:
- **Information retrieval:** Get data from the student's academic records.
- **Content generation:** Create study plans, flashcards, practice questions, summaries.
- **Data mutation:** Mark attendance, create notes, update plans (via tools).
- **Analysis:** Predict exam scores, identify weak topics, calculate attendance risk.
- **Conversation:** Explain concepts, answer questions, provide encouragement.

All of these are tool-mediated. The agent itself only reasons and generates natural language.

---

## 51. Study Planner

**Purpose:** Generate, manage, and optimize personalized study schedules that maximize learning outcomes based on educational psychology principles.

**Problem Solved:** Students either study without a plan (random topic selection) or follow rigid plans that do not adapt to their changing needs. ScholarOS creates dynamic, AI-optimized study plans.

**Algorithm Foundation:**
- **Spaced Repetition (SM-2):** Review intervals calculated using the SuperMemo 2 algorithm based on recall quality.
- **Interleaving:** Mix subjects within a study day rather than blocking entire days per subject.
- **Distributed Practice:** Spread study across days rather than cramming.
- **Priority Weighting:** Subjects closer to exams and with lower scores get more study time.

**User Flow:**
1. Student opens Study Plan screen or asks AI "Create a study plan."
2. AI calls `create_study_plan` tool with date range and student context.
3. Tool queries student's subjects, exam dates, attendance, scores, and weak topics.
4. Algorithm generates time blocks with subject, topic, and duration.
5. Plan saved to database, rendered as interactive timeline.
6. Student can drag-and-drop to reorder, mark blocks complete, or ask AI to regenerate.

**Data Flow:** Client -> `POST /api/v1/study-plans` -> StudyPlanService -> Gemini (for topic prioritization) -> StudyPlanRepository -> PostgreSQL.

**Database Impact:** `study_plans` and `study_blocks` tables. Indexed on (user_id, date).

**Edge Cases:**
- No exam dates entered: Generate a generic review-focused plan.
- Student completes plan early: AI suggests bonus topics or rest.
- Student misses a day: AI automatically reschedules missed topics to future days.
- Too many subjects: AI prioritizes based on exam proximity and weakness.

---

## 52. Attendance

**Purpose:** Track class attendance per subject with prediction of attendance percentage at semester end.

**Problem Solved:** Students lose track of attendance across 6-8 subjects. Many discover they are below the mandatory 75% threshold too late to recover.

**User Flow:**
1. Student sees today's classes on dashboard with "Mark Attendance" buttons.
2. One tap: "Present" or "Absent" per subject per period.
3. Dashboard shows live attendance percentage per subject with color coding (green/yellow/red).
4. Prediction engine: "You can miss 3 more DBMS classes and stay above 75%."

**Prediction Algorithm:**
```
remaining_classes = total_classes_in_semester - classes_elapsed
current_percentage = present_count / classes_elapsed * 100
min_required = 0.75 * total_classes_in_semester
can_miss = present_count + remaining_classes - min_required
```

**Database Impact:** `attendance_records` table, partitioned by month. Heavy write pattern (multiple records per day per user).

**Edge Cases:**
- Class cancelled: Student can mark "Cancelled" (does not count toward total).
- Holiday: Auto-populated from academic calendar if available.
- Retroactive marking: Student can mark past dates (up to 7 days back).
- Multiple periods same subject: Supports period-level tracking.

---

## 53. Notes

**Purpose:** Create, organize, and search rich-text notes with AI-powered features.

**Problem Solved:** Students use scattered tools for notes (physical notebooks, phone gallery, random files, WhatsApp messages). ScholarOS centralizes all notes with semantic search and AI augmentation.

**Features:**
- Rich text editor (headings, bold, italic, lists, code blocks, images, tables).
- Auto-categorization by subject and unit when AI detects the topic.
- OCR integration: Photograph handwritten notes, extract text automatically.
- AI actions on selected text: Summarize, Explain, Generate flashcards, Find related notes.
- Full-text search (PostgreSQL pg_trgm) + semantic search (pgvector embeddings).
- Offline creation and editing with sync.

**Database Impact:** `notes` table (text content), `note_embeddings` table (vector chunks). Embeddings generated asynchronously via Celery task on note save.

---

## 54. Assignments

**Purpose:** Track assignment lifecycle from creation to submission with AI-powered review.

**Problem Solved:** Students forget deadlines, lose track of partial work, and submit incomplete assignments.

**User Flow:**
1. Student creates assignment (title, subject, due date, description, rubric).
2. Dashboard shows countdown to due date.
3. Student works on assignment using rich text editor.
4. AI reviews against rubric and suggests improvements.
5. Student marks as submitted.
6. Post-submission: Student can enter received grade for analytics.

**Database Impact:** `assignments` table with `status` enum: 'not_started', 'in_progress', 'submitted', 'graded'.

---

## 55. Exam Predictor

**Purpose:** Predict exam scores based on preparation data and provide actionable improvement recommendations.

**Problem Solved:** Students study without knowing if they are on track. They cannot objectively assess their preparedness.

**Prediction Model (Deterministic, not ML):**
```
predicted_score = (
    0.30 * quiz_average +           # Historical test performance
    0.25 * topic_coverage_pct +      # % of syllabus topics studied
    0.20 * flashcard_retention +     # Spaced repetition recall rate
    0.15 * study_hours_ratio +       # Actual vs recommended study hours
    0.10 * attendance_pct            # Class attendance
) * 100
```

Each factor is normalized to 0-1 range. The weights are configurable per education level (competitive exams weight quiz_average higher, college exams weight attendance higher).

**User Flow:**
1. Student navigates to Exams screen.
2. Each subject shows a predicted score with confidence interval.
3. Clicking a subject shows breakdown: "Your quiz average is 65%, topic coverage is 40%, you need to improve coverage to reach your target of 80%."
4. AI suggests specific actions: "Study Unit 4 (Deadlocks) and Unit 6 (File Systems) to increase coverage from 40% to 65%."

**Database Impact:** Uses data from `exam_scores`, `study_sessions`, `flashcard_reviews`, `attendance_records`. Calculated on-demand or cached via Celery task.

---

## 56. Timetable

**Purpose:** Display the weekly class schedule with room numbers, faculty names, and subject details.

**Problem Solved:** Students reference paper timetables or photos of notice boards. ScholarOS digitizes the timetable and integrates it with attendance and study planning.

**User Flow:**
1. During onboarding or in Settings, student enters their timetable (day, period, subject, time, room).
2. Timetable displayed as a weekly grid.
3. Today's classes highlighted.
4. Integration: Attendance marking shows only classes from today's timetable.
5. Study planner avoids scheduling study blocks during class hours.

**Database Impact:** `timetable_entries` table (user_id, day_of_week, period, subject_id, start_time, end_time, room, faculty_name).

---

## 57. Notifications

**Purpose:** Proactive alerts that keep students on track without being intrusive.

**Notification Types:**

| Type | Trigger | Channel | Priority |
|------|---------|---------|----------|
| Attendance Risk | Subject drops below 76% | Push + In-app | HIGH |
| Assignment Due | 48h and 24h before deadline | Push + In-app | HIGH |
| Study Reminder | At scheduled study block time | Push | MEDIUM |
| Flashcard Due | Morning reminder for due cards | In-app | MEDIUM |
| Exam Countdown | 7 days, 3 days, 1 day before exam | Push + In-app | HIGH |
| Study Streak | Streak milestone (7, 30, 100 days) | In-app | LOW |
| Weekly Summary | Sunday evening | In-app | LOW |

**Implementation:**
- In-app notifications via WebSocket (real-time) and REST API (polling fallback).
- Push notifications via Firebase Cloud Messaging (FCM) for Android/web, APNs for iOS.
- Notification preferences configurable in Settings. Students can mute specific types.

**Database Impact:** `notifications` table (user_id, type, title, body, is_read, created_at).

---

## 58. Calendar

**Purpose:** Unified calendar view combining classes, study blocks, assignments, exams, and custom events.

**User Flow:**
1. Monthly view shows all events color-coded by type.
2. Tap a day to see detailed schedule.
3. Drag to create custom events.
4. AI can create calendar events via tool call.

**Integration:** Timetable entries, study plan blocks, assignment due dates, and exam dates are automatically overlaid on the calendar. No manual entry required for academic events.

**Database Impact:** `calendar_events` table for custom user events. Academic events are assembled from other tables at query time.

---

## 59. PDF Reader

**Purpose:** Read, annotate, and extract knowledge from PDF documents with AI assistance.

**Problem Solved:** Students accumulate hundreds of PDFs (textbooks, papers, handouts) and cannot search across them or extract study material efficiently.

**Features:**
- Full PDF rendering with zoom, search, page navigation.
- Highlight text and add annotations.
- AI sidebar: "Summarize this page", "Explain highlighted text", "Generate flashcards from this section."
- Semantic search across all uploaded PDFs.
- Offline viewing (if previously loaded).

**Architecture:**
1. PDF uploaded to S3 via pre-signed URL.
2. Celery task `process_pdf` extracts text using `PyMuPDF` (fitz).
3. Text chunked into 512-token segments.
4. Each chunk embedded via Gemini Embedding API.
5. Chunks and embeddings stored in `pdf_chunks` table.
6. Semantic search queries against `pdf_chunks.embedding` using pgvector.

**Database Impact:** `pdf_documents` (metadata), `pdf_chunks` (text + VECTOR(768) embedding).

---

## 60. OCR

**Purpose:** Extract text from photographs of handwritten notes, whiteboards, and printed material.

**Problem Solved:** Students take photos of whiteboard diagrams and handwritten notes that are unsearchable and unorganized.

**User Flow:**
1. Student taps camera icon or uploads an image.
2. Image sent to backend via pre-signed S3 upload.
3. Celery task `process_ocr` runs OCR.
4. Extracted text displayed for review and editing.
5. Student confirms, and text is saved as a new note (auto-categorized by subject if detectable).

**OCR Provider:** Google Cloud Vision API (supports handwritten text, Tamil script, and printed text with high accuracy).

**Edge Cases:**
- Poor image quality: Show warning and suggest re-capture.
- Mixed handwritten and printed: Process both; let student edit result.
- Tamil handwriting: Google Vision supports Tamil script recognition.
- Mathematical equations: Limited support; student can manually correct LaTeX.

---

## 61. Knowledge Base

**Purpose:** A personal, searchable knowledge base built from the student's notes, PDFs, and AI-generated content.

**Problem Solved:** Over a semester, students accumulate hundreds of notes and PDFs. Finding specific information requires remembering where it was stored. The knowledge base makes everything searchable by meaning, not just keywords.

**Architecture:**
- Every note and PDF chunk is embedded and stored in pgvector.
- Search queries are embedded at query time and compared using cosine similarity.
- Results ranked by relevance with source attribution (note title, PDF name, page number).
- AI can traverse the knowledge base via `search_knowledge_base` tool to answer questions grounded in the student's own materials.

---

## 62. Search

**Purpose:** Fast, accurate search across all student content.

**Search Types:**

| Type | Implementation | Use Case |
|------|---------------|----------|
| **Keyword Search** | PostgreSQL pg_trgm with GIN index | Find notes by exact title, tag, or keyword |
| **Full-Text Search** | PostgreSQL tsvector with GIN index | Find notes containing specific words/phrases |
| **Semantic Search** | pgvector cosine similarity | Find notes by meaning (e.g., "how does memory management work" finds notes about paging and virtual memory) |
| **Faceted Search** | SQL WHERE clauses | Filter by subject, date range, source type |

**User Flow:**
1. Student types in search bar or uses command palette.
2. As-you-type results from keyword search (debounced 300ms).
3. Toggle "Semantic Search" for meaning-based results.
4. Results show source, preview snippet, and relevance score.

---

## 63. Semantic Search

**Purpose:** Find content by meaning rather than exact keywords using vector embeddings.

**Implementation:**

```sql
-- Semantic search query
SELECT nc.chunk_text, n.title, n.subject_id,
       1 - (nc.embedding <=> $1) AS similarity
FROM note_embeddings nc
JOIN notes n ON nc.note_id = n.id
WHERE n.user_id = $2
ORDER BY nc.embedding <=> $1
LIMIT 10;
```

Where `$1` is the query embedding (generated at query time via Gemini Embedding API) and `$2` is the user_id.

**Embedding Model:** Gemini `text-embedding-004` (768 dimensions). One embedding per 512-token chunk.

**Index:** HNSW index on `embedding` column with `lists = 100`, `ef_construction = 200` for production-scale performance.

---

## 64. RAG

**Purpose:** Retrieval-Augmented Generation enables the AI to answer questions using the student's own materials rather than general knowledge.

**Decision: RAG is used, but minimally.**

RAG is justified in ScholarOS because:
1. Students upload domain-specific content (lecture notes, textbook PDFs) that Gemini does not have access to.
2. Grounding AI responses in the student's own materials increases trust and accuracy.
3. It prevents hallucination about syllabus-specific content.

**RAG Pipeline:**
1. Student asks a question (text or voice).
2. Backend generates an embedding of the question.
3. pgvector retrieves the top 5 most similar chunks from the student's notes and PDFs.
4. Retrieved chunks are injected into the Gemini prompt as context.
5. Gemini generates a response grounded in the retrieved content.
6. Response includes source citations (note title, PDF page number).

**When RAG is NOT used:**
- General knowledge questions ("What is photosynthesis?") — Gemini answers from its training data.
- Operational queries ("What is my attendance?") — Tool calls, not RAG.
- Non-academic queries — Declined by the AI.

---

## 65. Embeddings

**Purpose:** Convert text into numerical vectors for semantic search and RAG.

**Implementation:**
- **Model:** Gemini `text-embedding-004` (768-dimensional vectors).
- **Chunk Size:** 512 tokens per chunk with 50-token overlap between chunks.
- **Generation:** Asynchronous via Celery task. Triggered on note create/update and PDF upload.
- **Storage:** `VECTOR(768)` column in PostgreSQL via pgvector extension.
- **Indexing:** HNSW (Hierarchical Navigable Small World) for sub-10ms approximate nearest neighbor queries.
- **Cost:** Embedding API calls are significantly cheaper than generation calls. Estimated INR 0.50 per 1000 chunks.

**Chunking Strategy:**
```python
def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    tokens = tokenizer.encode(text)
    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk_tokens))
    return chunks
```

**Database Impact:** `note_embeddings` and `pdf_chunks` tables. Each with a VECTOR(768) column and HNSW index. Expected volume: ~100 chunks per active user per month.

---

## 66. Spaced Repetition

**Purpose:** Optimize long-term memory retention by scheduling flashcard reviews at scientifically determined intervals.

**Problem Solved:** Students review notes once before an exam and forget 80% within a week. Spaced repetition distributes review over increasing intervals, achieving 90%+ retention.

**Algorithm:** SM-2 (SuperMemo 2). See [Section 67](#67-sm-2-algorithm) for full implementation.

**Integration:**
- Flashcards generated from notes, PDFs, and AI are automatically enrolled in the spaced repetition system.
- The AI assistant proactively reminds students about due reviews.
- Study planner incorporates spaced repetition sessions into daily schedules.
- Analytics track retention rates per subject.

**User Flow:**
1. Student navigates to Flashcards → Review.
2. Due cards are presented one by one.
3. Student flips card and rates recall: Again (1), Hard (2), Good (3), Easy (4).
4. SM-2 algorithm recalculates next review date based on rating.
5. Session ends when all due cards are reviewed.
6. Summary screen shows cards reviewed, accuracy, and next session date.

---

## 67. SM-2 Algorithm

**Purpose:** Calculate optimal review intervals for flashcards based on recall quality.

**Implementation:**

```python
def sm2(quality: int, repetitions: int, easiness: float, interval: int) -> tuple[int, float, int]:
    """
    SM-2 Algorithm Implementation.
    
    Args:
        quality: User's recall rating (0-5, mapped from 1-4 UI buttons)
        repetitions: Number of successful reviews
        easiness: Easiness factor (minimum 1.3)
        interval: Current interval in days
    
    Returns:
        Tuple of (new_repetitions, new_easiness, new_interval)
    """
    # Map UI buttons (1-4) to SM-2 quality (0-5)
    quality_map = {1: 0, 2: 2, 3: 4, 4: 5}  # Again=0, Hard=2, Good=4, Easy=5
    q = quality_map.get(quality, 4)
    
    if q >= 3:  # Correct response
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * easiness)
        new_repetitions = repetitions + 1
    else:  # Incorrect response
        new_repetitions = 0
        new_interval = 1
    
    # Update easiness factor
    new_easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_easiness = max(1.3, new_easiness)
    
    return new_repetitions, new_easiness, new_interval
```

**Quality Rating Mapping:**

| UI Button | Label | SM-2 Quality | Effect |
|-----------|-------|-------------|--------|
| 1 | Again | 0 | Reset interval to 1 day. Card is "relearning." |
| 2 | Hard | 2 | Reduce interval slightly. Easiness decreases. |
| 3 | Good | 4 | Normal progression. Interval increases by easiness factor. |
| 4 | Easy | 5 | Aggressive increase. Card seen less frequently. |

---

## 68. Bloom's Taxonomy

**Purpose:** Classify flashcards and study activities by cognitive complexity to ensure balanced learning.

**Bloom's Levels and ScholarOS Application:**

| Level | Description | Example Flashcard | Study Activity |
|-------|-------------|------------------|----------------|
| **Remember** | Recall facts | "What is the time complexity of binary search?" | Read notes, review definitions |
| **Understand** | Explain concepts | "Explain why binary search requires a sorted array." | Summarize notes, watch explanations |
| **Apply** | Use knowledge | "Write pseudocode for binary search on a linked list." | Practice problems, coding exercises |
| **Analyze** | Break down | "Compare binary search and linear search. When would you choose each?" | Case studies, comparison tables |
| **Evaluate** | Judge/critique | "Is binary search always the best algorithm for searching? Justify." | Debates, critical reviews |
| **Create** | Produce original | "Design a search algorithm that works on partially sorted arrays." | Projects, original solutions |

**Implementation:**
- When AI generates flashcards, each card is tagged with a Bloom's level (`bloom_level` column in `flashcards` table).
- Analytics dashboard shows distribution of flashcards across Bloom's levels per subject.
- AI recommends creating higher-order flashcards when a subject is dominated by "Remember" level cards.

---

## 69. Analytics

**Purpose:** Comprehensive academic performance analytics that help students understand their progress and make data-driven study decisions.

**Dashboard Metrics:**

| Metric | Visualization | Data Source |
|--------|--------------|-------------|
| Study hours (daily/weekly/monthly) | Line chart | `study_sessions` table |
| Study streak | Counter with flame icon | `study_sessions` (consecutive days) |
| Subject time distribution | Pie/donut chart | `study_blocks` aggregated |
| Attendance per subject | Progress rings | `attendance_records` aggregated |
| Exam predictions per subject | Bar chart with confidence | Calculated from multiple sources |
| Flashcard retention rate | Line chart (trend) | `flashcard_reviews` aggregated |
| Topic coverage per subject | Heatmap | `study_blocks` vs `syllabus_json` |
| Weekly comparison | Bar chart (this week vs last) | `study_sessions` aggregated |

**Data Collection:**
- Study sessions tracked via the study timer (start/end timestamps).
- Study block completion tracked via plan interaction.
- Flashcard reviews tracked per card per session.
- All metrics aggregated nightly via `daily_analytics_snapshot` Celery task.

**Database Impact:** `analytics_snapshots` table stores pre-computed daily aggregates. Dashboard reads from snapshots for performance.

---

## 70. Gamification

**Purpose:** Motivate consistent study habits through achievement systems and progress visualization.

**Gamification Elements:**

| Element | Implementation | Psychology |
|---------|---------------|------------|
| **Study Streak** | Consecutive days with at least 1 study session | Loss aversion (do not want to break streak) |
| **Badges** | Awarded for milestones (7-day streak, 100 flashcards, first mock test) | Achievement motivation |
| **Level System** | XP earned per study hour, flashcard review, and plan completion | Progress visualization |
| **Weekly Goal** | Student sets target study hours; progress bar shows completion | Goal-setting theory |
| **Subject Mastery** | Star rating (1-5) per subject based on topic coverage and retention | Competence feedback |

**Rules:**
- Gamification is subtle, not childish. ScholarOS is a productivity tool, not a game.
- No leaderboards (avoids social comparison anxiety). ScholarOS is a personal tool.
- No punishments for missed days. Only positive reinforcement.
- Badges are displayed on the profile but never pop up intrusively during study.

---

## 71. Study Timer

**Purpose:** Focused study session timer with Pomodoro and custom duration options.

**Modes:**
- **Pomodoro:** 25 min study + 5 min break, with a 15 min long break every 4 sessions.
- **Custom:** Student sets duration (10 min to 4 hours).
- **Stopwatch:** Open-ended timer. Student stops when done.

**Features:**
- Circular progress animation.
- Audio alert when session ends (configurable sound or vibration).
- Tracks which subject and topic the session is for.
- Records duration in `study_sessions` table for analytics.
- Optional: Block distracting app notifications during study (Capacitor only).

**Database Impact:** `study_sessions` table (user_id, subject_id, topic, start_time, end_time, duration_minutes, timer_mode).

---

## 72. Onboarding

**Purpose:** Collect student information and configure ScholarOS in an engaging, step-by-step flow.

**Onboarding Steps:**

| Step | Screen | Data Collected |
|------|--------|---------------|
| 1 | Welcome | Language preference (Tamil/English/Tanglish) |
| 2 | About You | Name, education level (school/college/professional/competitive) |
| 3 | Your Field | Field (engineering/medical/commerce/arts/law/MBA) + specialization |
| 4 | Institution | Institution name, board/university, year, semester |
| 5 | Subjects | Subject selection from catalog or manual entry |
| 6 | Timetable | Enter weekly class schedule (optional, can skip) |
| 7 | Goals | Target GPA/score, study hours per day |
| 8 | AI Introduction | Meet Scholar (AI personality). First conversation demonstrating capabilities. |

**Design:**
- Each step is a single-focus card with large text and minimal inputs.
- Progress indicator (step X of 8) at the top.
- Back button on every step. Skip button on optional steps.
- Smooth slide-left transitions between steps.
- Celebration animation on completion (confetti + welcome message from Scholar).

**Technical:** Onboarding data saved incrementally (each step saves to backend). If the user drops off and returns, they resume from their last completed step.

---

## 73. Settings

**Purpose:** User preferences and account management.

Detailed in [Section 38.7](#387-settings-screen). Technical details:

- **Theme toggle:** Persisted in Zustand store with `persist` middleware (saved to localStorage). Applied via CSS class on `<html>` element.
- **Language change:** Updates `preferred_language` in user profile. Triggers re-render of all translated strings. AI responses switch language immediately.
- **Notification preferences:** Saved to `notification_preferences` JSONB column on `users` table.
- **Data export:** Celery task generates a ZIP file containing all user data (notes as markdown, attendance as CSV, flashcards as JSON). Download link sent via notification.
- **Account deletion:** Soft-delete immediately (is_active = false). Hard-delete after 30-day grace period via scheduled task. User data purged from all tables.

---

## 74. Error Handling

### 74.1 Backend Error Handling

```python
# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = request.state.request_id
    logger.error(f"Unhandled exception", exc_info=exc, extra={"request_id": request_id})
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "error": {"code": "HTTP_ERROR", "message": exc.detail}}
        )
    
    if isinstance(exc, ValidationError):
        return JSONResponse(
            status_code=422,
            content={"status": "error", "error": {"code": "VALIDATION_ERROR", "message": str(exc)}}
        )
    
    # Never expose internal errors to client
    return JSONResponse(
        status_code=500,
        content={"status": "error", "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}}
    )
```

### 74.2 Frontend Error Handling

- **API errors:** Caught by TanStack Query's `onError` callback. Displayed as toast notifications.
- **Network errors:** Detected by `navigator.onLine`. UI shows offline indicator and switches to cached data.
- **React errors:** Error Boundaries catch component render failures. Fallback UI shows "Something went wrong" with a retry button.
- **AI streaming errors:** If SSE connection drops, retry with exponential backoff (1s, 2s, 4s). After 3 retries, show error message.

---

## 75. Logging

### 75.1 Structured Logging

```python
import structlog

logger = structlog.get_logger()

# Every log entry includes
logger.info(
    "study_plan_created",
    user_id=str(user.id),
    plan_id=str(plan.id),
    subjects=len(plan.subjects),
    blocks=len(plan.blocks),
    duration_ms=elapsed_ms,
    request_id=request_id
)
```

### 75.2 Log Levels

| Level | Use |
|-------|-----|
| DEBUG | Detailed debugging (SQL queries, cache hit/miss, tool call args). Disabled in production. |
| INFO | Normal operations (user login, plan created, attendance marked, AI query processed). |
| WARNING | Recoverable issues (rate limit approaching, cache miss, slow query). |
| ERROR | Failures requiring attention (API error, database error, tool execution failure). |
| CRITICAL | System-level failures (database connection lost, Redis unavailable, Gemini API down). |

### 75.3 Log Aggregation

- **Development:** Console output with colorized formatting.
- **Production:** JSON-formatted logs shipped to a centralized logging service (Elasticsearch/Loki/CloudWatch). Retention: 30 days.

---

## 76. Monitoring

### 76.1 Application Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|----------------|
| API response time (p95) | Prometheus + Grafana | Greater than 500ms |
| Error rate (5xx) | Prometheus + Grafana | Greater than 1% |
| Gemini API latency | Custom metrics | Greater than 2000ms |
| Celery task failure rate | Flower + Prometheus | Greater than 5% |
| Database connection pool utilization | SQLAlchemy metrics | Greater than 80% |
| Redis memory usage | Redis INFO | Greater than 80% |
| Disk usage (S3/PostgreSQL) | Infrastructure monitoring | Greater than 75% |

### 76.2 Health Checks

```python
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_db_connection(),
        "redis": await check_redis_connection(),
        "gemini": await check_gemini_api(),
    }
    status = "healthy" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

### 76.3 Uptime Target

- **SLA:** 99.9% uptime (8.76 hours downtime per year maximum).
- **Maintenance window:** Sunday 02:00-04:00 IST (lowest traffic).

---

## 77. Security

### 77.1 Security Checklist

| Category | Measure |
|----------|---------|
| **Transport** | HTTPS everywhere. HSTS enabled. TLS 1.3. |
| **Authentication** | Argon2id hashing. JWT with short-lived access tokens. Refresh token rotation. |
| **Authorization** | User-scoped queries at repository layer. No cross-user data access. |
| **Input Validation** | Pydantic V2 on all inputs. SQL parameterization via ORM. |
| **XSS** | React auto-escapes. Content-Security-Policy headers. No dangerouslySetInnerHTML. |
| **CSRF** | SameSite=Strict cookies. CSRF token for state-changing requests. |
| **Rate Limiting** | Nginx IP-based + Redis user-based sliding window. |
| **Data at Rest** | PostgreSQL transparent data encryption. S3 server-side encryption. |
| **Secrets** | Environment variables. Never committed to source code. Rotated quarterly. |
| **Dependencies** | Automated vulnerability scanning (Dependabot/Snyk). Weekly updates. |
| **AI Safety** | Gemini safety filters active. Backend content filtering. Academic integrity guardrails. |
| **Privacy** | GDPR-aligned data practices. User can export and delete all data. |

### 77.2 OWASP Top 10 Coverage

All OWASP Top 10 (2021) risks are addressed:
1. **Broken Access Control:** User-scoped queries, RBAC, no IDOR.
2. **Cryptographic Failures:** Argon2id, TLS 1.3, encrypted storage.
3. **Injection:** ORM prevents SQL injection. Pydantic prevents NoSQL injection. CSP prevents XSS.
4. **Insecure Design:** Threat modeling during design phase. Security-by-default architecture.
5. **Security Misconfiguration:** Hardened Docker images. No default credentials. Minimal attack surface.
6. **Vulnerable Components:** Automated dependency scanning. Regular updates.
7. **Authentication Failures:** Token rotation, brute force protection, MFA-ready.
8. **Data Integrity Failures:** Signed JWTs, verified uploads, CI/CD pipeline integrity.
9. **Security Logging Failures:** Structured logging with security events. Alert on anomalies.
10. **SSRF:** No user-controlled URLs in server-side requests. API allowlisting.

---

## 78. Testing

### 78.1 Testing Strategy

| Type | Coverage Target | Tools | Scope |
|------|----------------|-------|-------|
| **Unit Tests** | 80%+ | pytest, jest, React Testing Library | Individual functions, components, services |
| **Integration Tests** | 70%+ | pytest (with test DB), httpx | API endpoints, service → repository chains |
| **E2E Tests** | Critical paths | Playwright | Onboarding, login, study plan creation, AI chat |
| **AI Tests** | Tool call accuracy | Custom harness | Tool call selection, parameter extraction, response quality |
| **Performance Tests** | Key endpoints | Locust | Concurrent users, response time under load |

### 78.2 Test Database

- Integration tests use a dedicated PostgreSQL instance created per test run.
- Alembic migrations applied before tests. Database dropped after.
- Factory functions generate test data (users, subjects, attendance records).

### 78.3 AI Testing

- Recorded conversation transcripts are replayed against new tool definitions to ensure backward compatibility.
- A suite of 100 representative student queries is tested after every prompt or tool definition change.
- Each query is evaluated for: correct tool selection, parameter accuracy, response relevance.

---

## 79. CI/CD

### 79.1 Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint Frontend
        run: npm run lint
      - name: Lint Backend
        run: ruff check .
      - name: Type Check Frontend
        run: npx tsc --noEmit
      - name: Type Check Backend
        run: mypy app/

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - name: Backend Tests
        run: pytest --cov=app --cov-report=xml
      - name: Frontend Tests
        run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Build Frontend
        run: npm run build
      - name: Build Docker Images
        run: docker compose build

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: ./scripts/deploy.sh staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: ./scripts/deploy.sh production
```

---

## 80. Docker

### 80.1 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.9'

services:
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://scholar:scholar@postgres:5432/scholar_os
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - postgres
      - redis

  celery-worker:
    build:
      context: ./backend
      target: development
    command: celery -A app.core.celery_app worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://scholar:scholar@postgres:5432/scholar_os
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - postgres
      - redis

  celery-beat:
    build:
      context: ./backend
      target: development
    command: celery -A app.core.celery_app beat --loglevel=info
    volumes:
      - ./backend:/app
    depends_on:
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: scholar
      POSTGRES_PASSWORD: scholar
      POSTGRES_DB: scholar_os
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: scholar
      MINIO_ROOT_PASSWORD: scholarpassword
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 80.2 Backend Dockerfile (Multi-Stage)

```dockerfile
# Base stage
FROM python:3.12-slim AS base
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Development stage
FROM base AS development
RUN uv sync --frozen
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base AS production
COPY . .
RUN adduser --disabled-password --no-create-home appuser
USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 81. Deployment

### 81.1 Deployment Architecture (Production)

```
[CloudFlare CDN]
      |
      v
[Load Balancer (AWS ALB / GCP LB)]
      |
      +-- /api/* --> Backend Service (2+ instances)
      +-- /* --> Frontend Service (2+ instances)
      |
[Backend Service]
      +-- FastAPI (Uvicorn, 4 workers per instance)
      +-- Auto-scaled based on CPU and request count
      |
[Celery Workers]
      +-- 2-4 worker instances
      +-- Auto-scaled based on queue depth
      |
[PostgreSQL]
      +-- AWS RDS / GCP Cloud SQL
      +-- Primary + 1 Read Replica
      +-- Automated backups (daily, 30-day retention)
      |
[Redis]
      +-- AWS ElastiCache / GCP Memorystore
      +-- Single instance (failover enabled)
      |
[S3/GCS]
      +-- Object storage for PDFs, images, exports
```

### 81.2 Deployment Strategy

- **Blue-Green Deployment:** Two production environments. New version deployed to inactive (green). Traffic switched after health checks pass. Instant rollback by switching back.
- **Database Migrations:** Run before deployment. Must be backward-compatible (no destructive changes without a migration plan).
- **Zero-Downtime:** Rolling updates ensure at least one instance is always serving traffic.

---

## 82. Environment Variables

### 82.1 Complete Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | - | Redis connection string |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `SECRET_KEY` | Yes | - | JWT signing secret (256-bit) |
| `REFRESH_SECRET_KEY` | Yes | - | Refresh token signing secret |
| `CORS_ORIGINS` | Yes | - | Comma-separated allowed origins |
| `S3_BUCKET_NAME` | Yes | - | Object storage bucket name |
| `S3_ACCESS_KEY` | Yes | - | Object storage access key |
| `S3_SECRET_KEY` | Yes | - | Object storage secret key |
| `S3_ENDPOINT_URL` | No | AWS default | S3-compatible endpoint (MinIO) |
| `STT_API_KEY` | Yes (Scholar+) | - | Deepgram/AssemblyAI API key |
| `TTS_API_KEY` | Yes (Scholar+) | - | Google Cloud TTS API key |
| `OCR_API_KEY` | Yes (Scholar+) | - | Google Cloud Vision API key |
| `FCM_SERVER_KEY` | No | - | Firebase Cloud Messaging key |
| `SENTRY_DSN` | No | - | Sentry error tracking DSN |
| `LOG_LEVEL` | No | INFO | Logging level |
| `ENVIRONMENT` | No | development | 'development', 'staging', 'production' |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | 15 | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | 7 | Refresh token TTL |

---

## 83. Migrations

### 83.1 Alembic Configuration

```python
# alembic/env.py
from app.models.base import Base
from app.core.config import settings

target_metadata = Base.metadata

def run_migrations_online():
    connectable = create_async_engine(settings.DATABASE_URL)
    
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()
```

### 83.2 Migration Rules

1. **Never delete a column in production.** Add a new column, migrate data, then deprecate. Delete in a future release after verification.
2. **Always make migrations backward-compatible.** The previous code version must still function with the new schema.
3. **Test migrations against a copy of production data** before deploying.
4. **Name migrations descriptively:** `001_create_users_table.py`, `015_add_bloom_level_to_flashcards.py`.
5. **Run migrations as a separate step** before deploying application code.

---

## 84. Performance

### 84.1 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| First Contentful Paint (FCP) | Under 1.0s | 2.0s |
| Largest Contentful Paint (LCP) | Under 1.5s | 2.5s |
| Cumulative Layout Shift (CLS) | Under 0.05 | 0.1 |
| Interaction to Next Paint (INP) | Under 100ms | 200ms |
| Time to First Byte (TTFB) | Under 200ms | 500ms |
| API response (p95) | Under 200ms | 500ms |
| AI first token (streaming) | Under 500ms | 1000ms |
| Dashboard load (cached) | Under 500ms | 1000ms |

### 84.2 Optimization Strategies

| Area | Strategy |
|------|----------|
| **Frontend Bundle** | Next.js code splitting, dynamic imports, tree shaking. Target under 150KB initial JS. |
| **Images** | Next/Image with automatic WebP conversion, lazy loading, blur placeholders. |
| **Fonts** | `font-display: swap`. Inter subset for Latin + Latin Extended. Tamil font loaded on demand. |
| **API Calls** | TanStack Query with staleTime/cacheTime. Avoid redundant fetches. |
| **Database** | Indexed queries. Connection pooling. Read replicas for analytics. |
| **Caching** | Redis for hot data. Browser cache for static assets. CDN for public content. |
| **SSR/RSC** | Server Components for data-heavy pages. Client Components only for interactivity. |

---

## 85. Scalability

### 85.1 Scaling Strategy

| Component | Horizontal Scaling | Vertical Scaling |
|-----------|-------------------|-----------------|
| Frontend (Next.js) | Multiple instances behind load balancer | Increase CPU/memory per instance |
| Backend (FastAPI) | Multiple instances behind load balancer | Increase workers per instance |
| Celery Workers | Add worker instances based on queue depth | Increase prefetch multiplier |
| PostgreSQL | Read replicas for read-heavy queries | Increase instance size |
| Redis | Redis Cluster for sharding | Increase instance memory |
| Object Storage | S3/GCS scales automatically | N/A |

### 85.2 Scaling Triggers

| Users | Architecture Changes |
|-------|---------------------|
| 0 - 10,000 | Single instance per service. Docker Compose. Managed DB. |
| 10,000 - 100,000 | 2-3 instances per service. Kubernetes. Read replica. CDN. |
| 100,000 - 1,000,000 | Auto-scaling groups. Database partitioning. Redis Cluster. Dedicated Celery queues. |
| 1,000,000+ | Microservice extraction (AI service, notification service). Multi-region deployment. Database sharding. |

---

## 86. Feature Flags

### 86.1 Feature Flag System

Feature flags control the rollout of new features without code deployment.

**Implementation:** Simple database-backed system. No external service needed at MVP scale.

```python
# Feature flag table
class FeatureFlag(Base):
    __tablename__ = "feature_flags"
    name: str = Column(String(100), primary_key=True)
    enabled: bool = Column(Boolean, default=False)
    rollout_percentage: int = Column(Integer, default=0)  # 0-100
    allowed_user_ids: list = Column(JSONB, default=[])     # Specific users for beta testing
    description: str = Column(Text)

# Usage in code
async def is_feature_enabled(flag_name: str, user_id: UUID) -> bool:
    flag = await get_flag(flag_name)
    if not flag or not flag.enabled:
        return False
    if str(user_id) in flag.allowed_user_ids:
        return True
    return hash(str(user_id)) % 100 < flag.rollout_percentage
```

**Planned Feature Flags:**

| Flag | Purpose |
|------|---------|
| `voice_assistant` | Roll out voice features to Scholar+ users first |
| `exam_predictor_v2` | Test improved prediction algorithm |
| `ai_study_plan_generation` | Control AI plan generation rollout |
| `pdf_semantic_search` | Roll out PDF semantic search |
| `tanglish_mode` | Control Tanglish language support |

---

## 87. Contributing

### 87.1 Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/scholar-os/scholar-os.git

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your Gemini API key

# 3. Start all services
docker compose up -d

# 4. Run database migrations
docker compose exec backend alembic upgrade head

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
# MinIO console: http://localhost:9001
```

### 87.2 Code Standards

| Area | Standard |
|------|----------|
| **Python** | Ruff for linting and formatting. Type hints required. Docstrings on public functions. |
| **TypeScript** | ESLint + Prettier. Strict mode. No `any` type. |
| **Git** | Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). |
| **Branches** | `main` (production), `develop` (staging), `feat/feature-name` (feature branches). |
| **Pull Requests** | Require 1 approval. CI must pass. No direct commits to main. |
| **Database** | All schema changes via Alembic migrations. No manual SQL in production. |

---

## 88. Glossary

| Term | Definition |
|------|-----------|
| **ScholarOS** | The AI Operating System for Students. The product. |
| **Scholar** | The AI personality name. The conversational assistant. |
| **Tool** | A function exposed to Gemini for invocation via function calling. |
| **Tool Call** | A Gemini response that invokes a tool instead of generating text. |
| **Study Block** | A single time-boxed study session within a study plan (e.g., "DBMS: Normalization, 10:00-11:00"). |
| **SM-2** | SuperMemo 2 algorithm for calculating spaced repetition intervals. |
| **Easiness Factor** | SM-2 parameter representing how easy a flashcard is to recall (minimum 1.3). |
| **Bloom's Level** | Cognitive complexity classification of a learning activity (Remember through Create). |
| **RAG** | Retrieval-Augmented Generation. Grounding AI responses in retrieved documents. |
| **pgvector** | PostgreSQL extension for vector storage and similarity search. |
| **HNSW** | Hierarchical Navigable Small World. An efficient approximate nearest neighbor index. |
| **Tanglish** | Code-mixed Tamil + English speech/text common among Tamil Nadu students. |
| **PWA** | Progressive Web App. A web application that can be installed and used offline. |
| **SSE** | Server-Sent Events. One-way streaming from server to client over HTTP. |
| **RSC** | React Server Components. Server-rendered components that reduce client bundle size. |

---

## 89. References

### 89.1 Technical References

| Topic | Reference |
|-------|-----------|
| Gemini API | [Google AI for Developers](https://ai.google.dev/docs) |
| Gemini Function Calling | [Function Calling Documentation](https://ai.google.dev/gemini-api/docs/function-calling) |
| Next.js App Router | [Next.js Documentation](https://nextjs.org/docs/app) |
| FastAPI | [FastAPI Documentation](https://fastapi.tiangolo.com/) |
| SQLAlchemy 2.0 | [SQLAlchemy Documentation](https://docs.sqlalchemy.org/en/20/) |
| pgvector | [pgvector GitHub](https://github.com/pgvector/pgvector) |
| Tailwind CSS | [Tailwind Documentation](https://tailwindcss.com/docs) |
| shadcn/ui | [shadcn/ui Documentation](https://ui.shadcn.com/) |
| Framer Motion | [Framer Motion Documentation](https://www.framer.com/motion/) |
| Celery | [Celery Documentation](https://docs.celeryq.dev/) |
| Dexie.js | [Dexie.js Documentation](https://dexie.org/docs/) |
| Workbox | [Workbox Documentation](https://developer.chrome.com/docs/workbox/) |
| Capacitor | [Capacitor Documentation](https://capacitorjs.com/docs) |

### 89.2 Educational Psychology References

| Topic | Reference |
|-------|-----------|
| SM-2 Algorithm | Wozniak, P.A. (1990). *Optimization of repetition spacing in the practice of learning.* |
| Spaced Repetition | Ebbinghaus, H. (1885). *Über das Gedächtnis.* |
| Bloom's Taxonomy | Anderson, L.W., & Krathwohl, D.R. (2001). *A Taxonomy for Learning, Teaching, and Assessing.* |
| Interleaving | Rohrer, D. (2012). *Interleaving helps students distinguish among similar concepts.* |
| Active Recall | Karpicke, J.D. (2011). *Retrieval-based learning: Active retrieval promotes meaningful learning.* |
| Pomodoro Technique | Cirillo, F. (2006). *The Pomodoro Technique.* |

---

## 90. Milestones

### 90.1 Development Phases

#### Phase 0: Foundation (Weeks 1-4)
- [ ] Project scaffolding (Next.js + FastAPI + Docker Compose)
- [ ] Database schema design and initial Alembic migrations
- [ ] Authentication system (email/password + JWT)
- [ ] User model and onboarding API
- [ ] Design system (Tailwind tokens, shadcn/ui setup)
- [ ] CI/CD pipeline (lint, test, build)

#### Phase 1: Core Features (Weeks 5-12)
- [ ] Attendance tracking (mark, view, percentage calculation)
- [ ] Subject and timetable management
- [ ] Notes CRUD with rich text editor
- [ ] Study plan generation (deterministic algorithm)
- [ ] Flashcard CRUD with SM-2 spaced repetition
- [ ] Basic dashboard (today's plan, attendance, deadlines)
- [ ] Offline storage (Dexie.js IndexedDB)
- [ ] PWA setup (manifest, service worker)

#### Phase 2: AI Integration (Weeks 13-20)
- [ ] Gemini API integration with streaming (SSE)
- [ ] Tool registry and executor implementation
- [ ] AI chat panel with conversation history
- [ ] AI-generated study plans (via tool calling)
- [ ] AI-generated flashcards from notes
- [ ] Semantic search with pgvector embeddings
- [ ] Note summarization and explanation
- [ ] Context assembly pipeline

#### Phase 3: Advanced Features (Weeks 21-28)
- [ ] PDF upload, processing, and viewer
- [ ] OCR for handwritten notes
- [ ] Exam predictor
- [ ] Knowledge base with RAG
- [ ] Calendar view integration
- [ ] Analytics dashboard
- [ ] Notifications (in-app + push via FCM)
- [ ] Study timer (Pomodoro + custom)

#### Phase 4: Voice & Language (Weeks 29-36)
- [ ] Voice assistant (STT + TTS integration)
- [ ] Tamil language support (UI strings + AI responses)
- [ ] Tanglish mode
- [ ] Voice streaming (WebSocket bi-directional)
- [ ] Voice interruption handling

#### Phase 5: Polish & Launch (Weeks 37-44)
- [ ] Performance optimization (Core Web Vitals targets)
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Security audit (OWASP Top 10)
- [ ] Google OAuth integration
- [ ] Phone OTP login
- [ ] Subscription management (Razorpay/Stripe integration)
- [ ] Capacitor mobile builds (Android + iOS)
- [ ] Beta testing (100 students, 5 colleges)
- [ ] Production deployment
- [ ] Public launch

### 90.2 Success Metrics (Launch + 90 Days)

| Metric | Target |
|--------|--------|
| Registered users | 10,000 |
| Daily active users | 2,000 |
| Average session duration | 15+ minutes |
| Study plan completion rate | 60%+ |
| Flashcard daily review rate | 40%+ of active users |
| AI queries per active user per day | 5+ |
| App store rating | 4.5+ |
| NPS score | 70+ |
| Paid conversion rate | 5%+ |
| Churn rate (monthly) | Under 8% |

---

**END OF IMPLEMENTATION PLAN**

*This document is the single source of truth for the ScholarOS project. Every technical decision, UI screen, database table, API endpoint, and AI behavior has been specified. An engineer reading this document should be able to build the complete application without asking a single question.*

*Document version: 1.0*
*Last updated: August 2026*
*Author: Staff Software Architect*
*Total sections: 90*
