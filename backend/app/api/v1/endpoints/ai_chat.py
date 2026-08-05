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

async def create_study_plan_and_notes_in_db(user_id: str, topic: str, content: str) -> str:
    async with AsyncSessionLocal() as db:
        subj = await ensure_default_subject(db, user_id)
        clean_topic = topic.title()

        # 1. Create Study Note in DB
        note = Note(
            user_id=user_id,
            subject_id=subj.id,
            title=f"Study Plan Notes: {clean_topic}",
            content=content,
            plain_text=content,
            source="ai-study-plan",
            tags=["scholar-ai", "study-plan", clean_topic.lower()],
            topic=clean_topic,
            word_count=len(content.split())
        )
        db.add(note)

        # 2. Create Study Plan in DB
        today_date = date.today()
        end_date = today_date + timedelta(days=5)

        plan = StudyPlan(
            user_id=user_id,
            title=f"5-Day Mastery Plan: {clean_topic}",
            start_date=today_date,
            end_date=end_date,
            plan_type="weekly",
            status="active",
            generation_context={"topic": clean_topic, "generated_by": "Scholar AI"}
        )
        db.add(plan)
        await db.commit()
        await db.refresh(plan)

        # 3. Create 5 Daily Study Blocks
        daily_topics = [
            f"Day 1: Foundations & Core Concepts of {clean_topic}",
            f"Day 2: Mathematical Formulation & Rules of {clean_topic}",
            f"Day 3: Implementation, Algorithms & Code for {clean_topic}",
            f"Day 4: Performance Evaluation & Optimization for {clean_topic}",
            f"Day 5: Exam Practice Questions & Problem Solving for {clean_topic}"
        ]

        for idx, block_topic in enumerate(daily_topics):
            block_date = today_date + timedelta(days=idx)
            block = StudyBlock(
                plan_id=plan.id,
                subject_id=subj.id,
                date=block_date,
                start_time=time(9, 0),
                end_time=time(10, 30),
                topic=block_topic,
                priority="high" if idx < 2 else "medium",
                is_completed=False,
                notes=f"Study block created by Scholar AI for {clean_topic}."
            )
            db.add(block)

        await db.commit()
        return plan.id

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
            action_prompt = f"""
            Generate a detailed 5-day Study Plan and comprehensive Markdown Study Notes for the topic: "{topic_name}".
            Structure the response using GitHub Flavored Markdown:
            - Start with `# 📅 5-Day Study Plan: {topic_name}`
            - Provide Day 1 to Day 5 breakdown with Goals, Topics, Formulas/Math, Code/Examples, and Actionable Tasks.
            - Provide a `# 📝 Comprehensive Study Notes: {topic_name}` section with full definitions, equations, and exam revision summary points.
            """
            generated_content = await ai_service.generate_text_single(action_prompt)
            if not generated_content:
                generated_content = f"# 📅 Study Plan: {topic_name}\n\nPlan created successfully."

            # Save Study Plan & Notes to Database
            try:
                plan_id = await create_study_plan_and_notes_in_db(current_user.id, topic_name, generated_content)
                logger.info(f"Created StudyPlan {plan_id} and Note in database for user {current_user.id}")
            except Exception as e:
                logger.error(f"Failed to save study plan to database: {e}")

            action_badge = f"\n\n---\n✅ **Action Completed:** Created 5-Day Study Plan in database & generated Markdown Notes saved to your Notes Vault memory! 🚀"
            collected_response = generated_content + action_badge

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
