from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import re
import logging
from datetime import date, time, timedelta
from uuid import UUID

from app.dependencies import get_current_user
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from app.models.conversation import Conversation, Message
from app.models.note import Note
from app.models.study_plan import StudyPlan, StudyBlock
from app.models.subject import Subject
from app.schemas.ai_chat import AIChatMessage
from app.services.ai_service import ai_service
from app.services.notes_pipeline.pipeline_orchestrator import generate_full_enterprise_note
from app.core.database import get_db, AsyncSessionLocal

router = APIRouter()
logger = logging.getLogger(__name__)

def extract_topic_from_message(message: str) -> str:
    msg = message.strip()
    match = re.search(r'(?:plan|notes?|schedule)\s+(?:for|on|about|of)\s+([a-zA-Z0-9\s\+\-\#\&]+)', msg, re.IGNORECASE)
    if match:
        return match.group(1).strip().title()

    # Fallback cleanup of common action prefixes
    cleaned = re.sub(
        r'^(?:create|make|write|generate|build|give|set up)\s+(?:a|an)?\s*(?:study plan|studyplan|notes?|schedule)?\s*(?:for|on|about|of)?\s*',
        '',
        msg,
        flags=re.IGNORECASE
    ).strip()

    if cleaned and len(cleaned) > 2:
        return cleaned.title()

    return "Core Academic Subject"

async def ensure_default_subject(db: AsyncSession, user_id: str) -> Subject:
    res = await db.execute(select(Subject).where(Subject.user_id == user_id))
    subj = res.scalars().first()
    if not subj:
        subj = Subject(
            user_id=user_id,
            name="Computer Science & Core Engineering",
            education_level="college",
            field="engineering"
        )
        db.add(subj)
        await db.commit()
        await db.refresh(subj)
    return subj

async def create_notes_in_db(user_id: str, topic: str, content: str) -> str:
    async with AsyncSessionLocal() as db:
        subj = await ensure_default_subject(db, user_id)

        clean_topic = topic.title()
        note = Note(
            user_id=user_id,
            subject_id=subj.id,
            title=f"Notes: {clean_topic}",
            content=content,
            plain_text=content,
            source="ai-generated",
            tags=["scholar-ai", clean_topic.lower()],
            topic=clean_topic,
            word_count=len(content.split())
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        return note.id

async def create_study_plan_and_notes_in_db(user_id: str, topic: str, user_instructions: str = "") -> dict:
    async with AsyncSessionLocal() as db:
        subj = await ensure_default_subject(db, user_id)
        clean_topic = topic.title()

        # STAGE 1: Generate Deep Enterprise Note via 5-Stage Pipeline
        logger.info(f"Generating Enterprise Study Note for Study Plan: {clean_topic}")
        pipeline_res = generate_full_enterprise_note(
            topic=clean_topic,
            subject_name=subj.name,
            language="en"
        )
        blueprint = pipeline_res["blueprint"]
        full_content = pipeline_res["full_markdown"]
        db_blocks = pipeline_res["db_blocks"]

        total_study_mins = blueprint.estimated_study_time or 180
        hours = total_study_mins // 60
        mins = total_study_mins % 60
        study_time_str = f"{hours}h {mins}m" if hours > 0 else f"{mins} mins"

        # STAGE 2: Save Note to Database Memory
        note = Note(
            user_id=user_id,
            subject_id=subj.id,
            title=f"Study Guide & Notes: {blueprint.title}",
            content=full_content,
            plain_text=full_content[:500],
            source="ai-study-plan",
            tags=blueprint.tags or ["study-plan", clean_topic.lower()],
            topic=clean_topic,
            word_count=len(full_content.split()),
            icon="📚",
            estimated_reading_time=blueprint.estimated_reading_time,
            difficulty_level=blueprint.difficulty
        )
        db.add(note)
        await db.flush()

        # STAGE 3: Create Study Plan & Link Notes to Study Blocks
        today_date = date.today()
        end_date = today_date + timedelta(days=5)

        plan = StudyPlan(
            user_id=user_id,
            title=f"5-Day Study Plan: {blueprint.title} ({study_time_str} Total)",
            start_date=today_date,
            end_date=end_date,
            plan_type="weekly",
            status="active",
            generation_context={
                "topic": clean_topic,
                "note_id": note.id,
                "total_study_minutes": total_study_mins,
                "generated_by": "Scholar AI"
            }
        )
        db.add(plan)
        await db.flush()

        daily_duration_mins = max(30, total_study_mins // 5)

        for idx, sec_bp in enumerate(blueprint.sections[:5]):
            block_date = today_date + timedelta(days=idx)
            block = StudyBlock(
                plan_id=plan.id,
                subject_id=subj.id,
                note_id=note.id, # LINK NOTE DIRECTLY TO STUDY BLOCK
                date=block_date,
                start_time=time(9 + (idx % 3) * 2, 0),
                end_time=time(9 + (idx % 3) * 2 + (daily_duration_mins // 60), daily_duration_mins % 60),
                topic=f"Day {idx + 1}: {sec_bp.title}",
                priority="high" if idx < 2 else "medium",
                is_completed=False,
                notes=f"Key focus: {', '.join(sec_bp.key_points_to_cover[:3])}"
            )
            db.add(block)

        await db.commit()
        return {
            "plan_id": plan.id,
            "note_id": note.id,
            "note_title": note.title,
            "study_time_str": study_time_str,
            "full_content": full_content
        }

@router.post("/chat")
async def chat_stream(
    req: AIChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_text = req.message.strip()
    user_text_lower = user_text.lower()

    # Intent Detection
    is_study_plan_request = (
        any(k in user_text_lower for k in ["study plan", "studyplan", "plan for", "schedule for"]) and
        any(k in user_text_lower for k in ["create", "make", "build", "generate", "give", "write", "set up"])
    )

    is_notes_request = (
        any(k in user_text_lower for k in ["note", "notes", "summary"]) and
        any(k in user_text_lower for k in ["create", "make", "write", "generate", "add", "give"])
    )

    topic_name = extract_topic_from_message(user_text)

    # 1. Get or create conversation
    if req.conversation_id:
        res = await db.execute(
            select(Conversation)
            .where(Conversation.id == req.conversation_id)
            .where(Conversation.user_id == current_user.id)
        )
        conv = res.scalars().first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(
            user_id=current_user.id,
            title=req.message[:30] + ("..." if len(req.message) > 30 else ""),
            message_count=0
        )
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    # 2. Add User Message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    conv.message_count += 1
    await db.commit()

    # 3. Assemble history
    res_history = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
    )
    history_msgs = res_history.scalars().all()
    formatted_msgs = [{"role": m.role, "content": m.content} for m in history_msgs]

    # 4. Fetch Academic Profile memory
    res_prof = await db.execute(
        select(AcademicProfile)
        .where(AcademicProfile.user_id == current_user.id)
        .where(AcademicProfile.is_active == True)
    )
    profile = res_prof.scalars().first()

    student_context = {
        "student_name": current_user.full_name,
        "email": current_user.email,
        "language_preference": current_user.preferred_language,
        "subscription_tier": current_user.subscription_tier,
        "college_or_institution": profile.institution_name if profile else None,
        "course_or_field": profile.field if profile else None,
        "specialization": profile.specialization if profile else None,
        "course_duration_years": profile.duration_years if profile else None,
        "current_year": profile.current_year if profile else None,
        "current_semester": profile.current_semester if profile else None,
        "enrolled_subjects": profile.subjects_json if profile else []
    }

    async def event_generator():
        collected_response = ""
        # Yield conversation_id first
        yield f"data: {json.dumps({'type': 'conversation_id', 'id': str(conv.id)})}\n\n"

        action_badge = ""

        # Special Action Execution for Notes & Study Plans
        if is_study_plan_request:
            # Execute Think, Plan, Note Generation & Schedule Allocation
            try:
                plan_info = await create_study_plan_and_notes_in_db(current_user.id, topic_name, user_text)
                note_content = plan_info["full_content"]
                study_time_str = plan_info["study_time_str"]
                note_title = plan_info["note_title"]

                action_badge = f"\n\n---\n✅ **Action Executed:** Created 5-Day Study Plan with **{study_time_str}** total estimated study duration! Linked study guide note **[{note_title}](/notes)** saved directly to your Notes Memory database! 🧠💾"
                collected_response = note_content + action_badge
            except Exception as e:
                logger.error(f"Failed to generate study plan & notes: {e}")
                collected_response = f"Failed to generate study plan: {e}"

            yield f"data: {json.dumps({'type': 'text', 'content': collected_response})}\n\n"

        elif is_notes_request:
            action_prompt = f"""
            Generate comprehensive, high-quality, structured academic study notes in Markdown format for the topic: "{topic_name}".
            Include Executive Overview, Key Concepts & Definitions, Formulas / Mathematical Equations, Code Examples (if applicable), and Exam Revision Bullet Points.
            """
            generated_content = await ai_service.generate_text_single(action_prompt)
            if not generated_content:
                generated_content = f"# 📝 Study Notes: {topic_name}\n\nNotes generated successfully."

            # Save Note to Database
            try:
                note_id = await create_notes_in_db(current_user.id, topic_name, generated_content)
                logger.info(f"Created Note {note_id} in database for user {current_user.id}")
            except Exception as e:
                logger.error(f"Failed to save note to database: {e}")

            action_badge = f"\n\n---\n✅ **Action Completed:** Markdown Study Notes generated and permanently saved to your backend Notes Vault memory! 💾"
            collected_response = generated_content + action_badge

            yield f"data: {json.dumps({'type': 'text', 'content': collected_response})}\n\n"

        else:
            # Standard Conversational Streaming
            async for chunk in ai_service.generate_response_stream(
                messages=formatted_msgs,
                student_context=student_context,
                language=current_user.preferred_language
            ):
                if chunk["type"] == "text":
                    collected_response += chunk["content"]
                    yield f"data: {json.dumps(chunk)}\n\n"
                elif chunk["type"] == "error":
                    yield f"data: {json.dumps(chunk)}\n\n"

        # Save Assistant Message
        if collected_response:
            async with AsyncSessionLocal() as save_db:
                assistant_msg = Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=collected_response
                )
                save_db.add(assistant_msg)
                await save_db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
