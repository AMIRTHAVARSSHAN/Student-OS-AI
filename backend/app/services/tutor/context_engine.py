import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional, List

from app.models.tutor import TutorSession, AcademicMemory, SessionAsset, ConceptNode
from app.models.note import Note
from app.models.academic_profile import AcademicProfile

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    ScholarOS Persistent Context Engine:
    Retrieves and aggregates multi-source academic context (Session, Memory, Vault, Notes, Concept Graph)
    to feed Groq llama-3.3-70b-versatile.
    """

    async def get_or_create_academic_memory(self, db: AsyncSession, user_id: str) -> AcademicMemory:
        res = await db.execute(select(AcademicMemory).where(AcademicMemory.user_id == user_id))
        mem = res.scalars().first()
        if not mem:
            mem = AcademicMemory(
                user_id=user_id,
                weak_topics=[],
                strong_topics=[],
                preferred_language="en",
                preferred_teaching_style="teacher",
                asked_questions_history=[],
                common_mistakes=[],
                learning_habits={},
                mastery_scores={}
            )
            db.add(mem)
            await db.commit()
            await db.refresh(mem)
        return mem

    async def build_full_academic_context(
        self,
        db: AsyncSession,
        user_id: str,
        session_id: Optional[str] = None,
        query: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Fetch Academic Memory
        memory = await self.get_or_create_academic_memory(db, user_id)

        # 2. Fetch User Profile
        prof_res = await db.execute(select(AcademicProfile).where(AcademicProfile.user_id == user_id))
        profile = prof_res.scalars().first()

        # 3. Fetch Tutor Session if provided
        session = None
        session_assets = []
        if session_id:
            sess_res = await db.execute(select(TutorSession).where(TutorSession.id == session_id).where(TutorSession.user_id == user_id))
            session = sess_res.scalars().first()
            if session:
                asset_res = await db.execute(select(SessionAsset).where(SessionAsset.session_id == session_id))
                session_assets = asset_res.scalars().all()

        # 4. Query Knowledge Vault (Recent Notes & Content)
        notes_res = await db.execute(
            select(Note)
            .where(Note.user_id == user_id)
            .order_by(Note.updated_at.desc())
            .limit(5)
        )
        vault_notes = notes_res.scalars().all()

        # 5. Fetch Concept Nodes
        concept_res = await db.execute(select(ConceptNode).where(ConceptNode.user_id == user_id).limit(10))
        concepts = concept_res.scalars().all()

        return {
            "user_id": user_id,
            "institution": profile.institution_name if profile else "University / School",
            "field": profile.field if profile else "Core Academic Field",
            "enrolled_subjects": profile.subjects_json if profile else [],
            "memory": {
                "weak_topics": memory.weak_topics or [],
                "strong_topics": memory.strong_topics or [],
                "preferred_language": memory.preferred_language or "en",
                "preferred_teaching_style": memory.preferred_teaching_style or "teacher",
                "common_mistakes": memory.common_mistakes or [],
                "mastery_scores": memory.mastery_scores or {},
                "asked_questions_count": len(memory.asked_questions_history or [])
            },
            "current_session": {
                "id": session.id if session else None,
                "title": session.title if session else "General Study Session",
                "chapter": session.chapter if session else "Overview",
                "goal": session.goal if session else "Master subject concepts",
                "difficulty": session.difficulty if session else "intermediate",
                "teaching_style": session.teaching_style if session else "teacher",
                "assets_count": len(session_assets)
            } if session else None,
            "vault_notes_summary": [
                {"title": n.title, "topic": n.topic, "snippet": (n.content or "")[:300]} for n in vault_notes
            ],
            "concepts_summary": [
                {"concept": c.concept_name, "prerequisites": c.prerequisites, "mastery": c.mastery_level} for c in concepts
            ]
        }

context_engine = ContextEngine()
