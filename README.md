<div align="center">

# 🎓 ScholarOS - AI Academic Operating System

### *An Intelligent 3D AI Workspace, Vector PDF RAG Vault, and Automated Study Companion for Students*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

</div>

## 🌟 Overview

**ScholarOS** is an all-in-one, high-performance **AI Academic Operating System** built for high school, college, and university students. Powered by **Google Gemini AI**, **Three.js 60fps WebGL 3D graphics**, and a **FastAPI backend**, ScholarOS automates study schedules, converts textbooks into interactive RAG chatbots, calculates attendance safety margins, and generates structured Markdown study notes saved directly to backend database memory.

---

## ✨ Key Features

### 🤖 1. Scholar AI Conversational Companion
- **Multi-Model Gemini Failover**: Auto-fails over across `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-2.0-flash-lite`, and `gemini-flash-latest` to guarantee **0 rate-limiting downtime**.
- **Automated Intent Action Engine**:
  - Prompting *"create notes for [Topic]"* automatically generates structured Markdown study notes and inserts a record into the `notes` database table.
  - Prompting *"create a study plan for [Topic]"* automatically generates a 5-day interactive schedule, creates 5 `StudyBlock`s in the `study_blocks` database table, and saves full Markdown study notes to `notes` memory.
- **Multilingual Intelligence**: Supports **English**, **Tamil (தமிழ்)**, and **Tanglish** (casual college student speech).

### 📚 2. Vector PDF RAG & Textbook Vault
- **Real PDF Document Upload**: Drag and drop real PDF textbooks, syllabus sheets, and lab manuals.
- **PyPDF Text Extraction**: Extracts page counts, file sizes, and full raw text indexed in PostgreSQL/SQLite database memory.
- **Interactive AI Document Chat**: Ask questions directly about any uploaded PDF document with context-grounded responses.
- **1-Click Study Note Generation**: Synthesizes complete Markdown Study Notes from PDF textbooks and saves them directly into your Notes Vault.

### 🎯 3. Attendance Cockpit & Predictor
- **Safety Margin Predictor**: Calculates exact safe missable classes above the 75% mandatory threshold.
- **Real-Time Attendance Log**: Log present and absent classes per date with instant backend database synchronization.
- **Academic Risk Flags**: Identifies low-attendance subjects before hall ticket issuance.

### 📅 4. AI Study Schedule Planner
- **Dynamic 5-Day Mastery Plans**: Generates daily focus topics, priority levels, and scheduled time blocks.
- **Interactive Progress Tracking**: Check off daily study blocks as you complete them.

### 📝 5. Notes & OCR Vault
- **Markdown & Math Rendering**: Full support for headings, code blocks, bullet points, and LaTeX equations (`$$ \text{MSE} = \frac{1}{n} \sum (y - \hat{y})^2 $$`).
- **PDF Export & Fullscreen View**: View notes in full screen or export rendered views to PDF.

### ⚙️ 6. Settings & Web-Searched Academic Profile
- **Personal Identity**: Avatar preset selection or custom image URL, name, and language preference.
- **Web-Searched College Intelligence**: Automatic DuckDuckGo web search lookup for college location, NAAC grade, and CGPA grading scale upon updating institution name.
- **Enrolled Subject Pills Manager**: Add, edit, or remove enrolled courses in real time.

---

## 🏗️ System Architecture

```
                               ┌─────────────────────────┐
                               │   ScholarOS Frontend    │
                               │  (Next.js 15 + React 19)│
                               └────────────┬────────────┘
                                            │ HTTP / SSE
                                            ▼
                               ┌─────────────────────────┐
                               │   FastAPI Python API    │
                               │  (Uvicorn + Pydantic)   │
                               └───────┬──────────┬──────┘
                                       │          │
                     ┌─────────────────┘          └─────────────────┐
                     ▼                                              ▼
┌─────────────────────────┐                            ┌─────────────────────────┐
│ Supabase / SQLite DB    │                            │ Google Gemini AI API    │
│ (Users, Notes, Plans)   │                            │ (Multi-Model Failover)  │
└─────────────────────────┘                            └─────────────────────────┘
```

---

## 🚀 Quickstart (Run Locally)

### Prerequisites
- **Node.js**: `v18+` or `v20+`
- **Python**: `v3.11+` or `v3.12+`
- **Google Gemini API Key**: Get a free API key at [ai.google.dev](https://ai.google.dev/)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/student-os-ai.git
cd student-os-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file inside `backend/`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_random_secret_key_string
DATABASE_URL=sqlite+aiosqlite:///./scholar_os_dev.db
```

Start Backend Server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create `.env.local` file inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start Frontend Dev Server:
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser! 🎉

---

## 🌐 Deploy Completely for FREE

| Component | Host | Free Features |
| :--- | :--- | :--- |
| **Backend** | [Render.com](https://render.com) | Python FastAPI, automatic HTTPS, Git deploy (`render.yaml` included) |
| **Frontend** | [Vercel.com](https://vercel.com) | Next.js 15, global CDN, 1-click GitHub deploy (`vercel.json` included) |

Detailed step-by-step instructions available in **[deployment_guide.md](deployment_guide.md)**.

---

## 📁 Repository Structure

```
Student OS AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # PDF, Notes, AI Chat, Attendance, Users endpoints
│   │   ├── core/               # Database session & security config
│   │   ├── models/             # SQLAlchemy ORM models (User, Note, Document, Plan)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   └── services/           # AI Service & College Search Service
│   ├── Procfile                # Web process runner
│   ├── render.yaml             # Render.com IaC config
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages (ai, pdf, study-plan, etc.)
│   │   ├── components/         # ThreeCanvas, MarkdownRenderer, Sidebar, Topbar
│   │   └── stores/             # Zustand state management
│   └── vercel.json             # Vercel deployment config
├── .gitignore                  # Clean git exclusion rules
└── README.md                   # Project Documentation
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Built with ❤️ by the ScholarOS Engineering Team.</sub>
</div>
