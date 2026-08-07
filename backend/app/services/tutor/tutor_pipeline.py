import logging
import json
from typing import AsyncGenerator, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.ai_service import ai_service
from app.models.tutor import AcademicMemory, TutorSession, SessionAsset, ConceptNode

logger = logging.getLogger(__name__)

class TutorPipeline:
    """
    ScholarOS Tutor AI Reasoning Engine:
    Powered exclusively by Groq llama-3.3-70b-versatile.
    Provides streaming responses, Socratic active study tuition, persona switching, and memory updates.
    """

    def build_system_prompt(self, context: Dict[str, Any], action: str = None, style_override: str = None) -> str:
        mem = context.get("memory", {})
        sess = context.get("current_session")

        teaching_style = style_override or (sess.get("teaching_style") if sess else mem.get("preferred_teaching_style", "teacher"))
        language = mem.get("preferred_language", "en")

        style_instruction = ""
        if teaching_style == "teacher":
            style_instruction = "Act as an encouraging, world-class university professor. Explain concepts with clarity, academic rigor, and structured examples."
        elif teaching_style == "10yo":
            style_instruction = "Explain like I'm 10 years old. Use simple analogies, no jargon, fun relatable stories, and clear breakdowns."
        elif teaching_style == "tamil":
            style_instruction = "Teach in Tamil (or Tamil with clear English technical terms in brackets). Make explanations engaging and easy to follow."
        elif teaching_style == "tanglish":
            style_instruction = "Teach in Tanglish (Colloquial Tamil + English mix commonly used by Indian students). Keep it super conversational, clear, and relatable."
        elif teaching_style == "visual":
            style_instruction = "Focus on visual learning. Provide ASCII diagrams, Mermaid flowchart code blocks, structured tables, and spatial comparisons."
        elif teaching_style == "step_by_step":
            style_instruction = "Break down every concept step-by-step with clear numbered stages, inputs, processes, and outputs."

        weak_topics = ", ".join(mem.get("weak_topics", [])) or "None identified yet"
        strong_topics = ", ".join(mem.get("strong_topics", [])) or "None identified yet"
        common_mistakes = ", ".join(mem.get("common_mistakes", [])) or "None logged"

        system_prompt = f"""
You are **ScholarOS Tutor AI** — a persistent, highly intelligent academic brain and personal tutor.
You are powered exclusively by Groq `llama-3.3-70b-versatile`.

### STUDENT ACADEMIC PROFILE & MEMORY:
- **Institution / Level**: {context.get('institution')} | {context.get('field')}
- **Weak Topics**: {weak_topics}
- **Mastered Topics**: {strong_topics}
- **Common Past Mistakes**: {common_mistakes}
- **Active Study Session Goal**: {sess.get('goal') if sess else 'General Concept Mastery'}
- **Current Session Chapter**: {sess.get('chapter') if sess else 'Core Topic'}

### TEACHING STYLE & PERSONA INSTRUCTIONS:
{style_instruction}

### CORE RULES:
1. **Never ask the exact same academic question twice**. Adapt questions based on student progress.
2. Use GitHub Flavored Markdown (headings, bold text, bullet points, LaTeX `$E=mc^2$`, code blocks, and Mermaid diagrams where applicable).
3. If an action like `mindmap` is requested, output valid Mermaid `graph TD` or `flowchart TD` code inside ````mermaid ```` blocks.
4. Keep explanations grounded, accurate, and deeply educational.
"""
        return system_prompt

    async def stream_tutor_response(
        self,
        messages: List[Dict[str, str]],
        context: Dict[str, Any],
        action: str = None,
        style_override: str = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        sys_prompt = self.build_system_prompt(context, action=action, style_override=style_override)

        # Handle Action Overrides
        if action == "explain_better":
            messages.append({"role": "user", "content": "Please explain this topic deeper with a crystal-clear real-world analogy and step-by-step breakdown."})
        elif action == "summarize":
            messages.append({"role": "user", "content": "Provide a bulleted executive summary of key takeaways and exam formulas for this topic."})
        elif action == "notes":
            messages.append({"role": "user", "content": "Generate structured, high-yield academic study notes in Markdown format for this topic."})
        elif action == "quiz":
            messages.append({"role": "user", "content": "Generate a 5-question active recall mini-quiz with answer choices and detailed explanations."})
        elif action == "mindmap":
            messages.append({"role": "user", "content": "Generate a visual mindmap / flowchart using Mermaid.js `graph TD` format for this concept."})
        elif action == "translate_tamil":
            messages.append({"role": "user", "content": "Re-explain this concept fully in Tamil with English technical terms."})
        elif action == "translate_tanglish":
            messages.append({"role": "user", "content": "Re-explain this concept in friendly Tanglish."})

        full_msgs = [{"role": "system", "content": sys_prompt}] + messages

        async for chunk in ai_service.generate_response_stream(messages=full_msgs):
            yield chunk

    async def execute_active_study_step(
        self,
        db: AsyncSession,
        user_id: str,
        session_id: str,
        topic: str,
        student_response: Optional[str] = None,
        step_type: str = "explain"
    ) -> Dict[str, Any]:
        """
        Active Tuition Session Loop:
        Explain Concept -> Ask Question -> Wait for Student Answer -> Evaluate & Correct -> Mini Quiz -> Next Topic.
        """
        sess_res = await db.execute(select(TutorSession).where(TutorSession.id == session_id))
        session = sess_res.scalars().first()
        topic_name = topic or (session.chapter if session else "Core Subject")

        if step_type == "explain":
            prompt = f"""
            Active Tuition Step 1: Explain the concept of "{topic_name}".
            Provide a clear, engaging 2-minute explanation of core principles.
            End with 1 targeted Socratic comprehension question for the student to answer.
            """
        elif step_type == "evaluate":
            prompt = f"""
            Active Tuition Step 2: The student answered your question on "{topic_name}".
            Student Response: "{student_response or 'No response'}"
            
            Evaluate their answer:
            1. Highlight what they got right (praise).
            2. Gently correct any misconceptions or missing details.
            3. Provide a 2-question Mini Quiz to test retention.
            """
        elif step_type == "quiz":
            prompt = f"""
            Active Tuition Step 3: Provide a 3-question active recall quiz for "{topic_name}" with clear answer options (A, B, C, D) and explanations.
            """
        else:
            prompt = f"Explain key advanced takeaways and practical applications of {topic_name}."

        response = await ai_service.generate_text_single(prompt)
        return {
            "topic": topic_name,
            "step_type": step_type,
            "ai_response": response or f"Explanation for {topic_name} generated."
        }

    async def update_academic_memory_post_session(
        self,
        db: AsyncSession,
        user_id: str,
        topic: str,
        performance_score: float
    ):
        res = await db.execute(select(AcademicMemory).where(AcademicMemory.user_id == user_id))
        mem = res.scalars().first()
        if mem:
            weak = list(mem.weak_topics or [])
            strong = list(mem.strong_topics or [])
            scores = dict(mem.mastery_scores or {})

            scores[topic] = performance_score
            if performance_score >= 8.0:
                if topic not in strong:
                    strong.append(topic)
                if topic in weak:
                    weak.remove(topic)
            elif performance_score <= 5.0:
                if topic not in weak:
                    weak.append(topic)
                if topic in strong:
                    strong.remove(topic)

            mem.weak_topics = weak
            mem.strong_topics = strong
            mem.mastery_scores = scores
            await db.commit()

tutor_pipeline = TutorPipeline()
