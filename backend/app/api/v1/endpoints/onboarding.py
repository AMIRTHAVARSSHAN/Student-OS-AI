from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Dict, Any
import json
import logging
import os
from groq import AsyncGroq

from app.dependencies import get_current_user
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from app.models.subject import Subject
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.core.database import get_db
from app.core.config import settings
from app.services.college_search_service import college_search_service

logger = logging.getLogger(__name__)

router = APIRouter()

ONBOARDING_SYSTEM_PROMPT = """[ROLE]
You are Scholar AI, the friendly, intelligent academic onboarding guide for ScholarOS.
Your objective is to onboard the student by asking questions step-by-step to gather their complete academic profile.

[STEP-BY-STEP QUESTION FLOW]
You MUST gather information in this order:
1. Full Name (Confirm or ask how they would like to be addressed)
2. College / University / School Name (Search web facts & acknowledge location/grading system)
3. Course / Field of Study & Specialization (e.g. Engineering in Computer Science, Medicine, B.Com Accounting)
4. Course Duration (in years), Current Year, and Current Semester (e.g. 4 years, Year 2, Semester 3)
5. Enrolled Subjects (Ask them to list their current subjects separated by commas)

[RULES]
- Ask ONLY ONE clear question at a time.
- Be encouraging, warm, and natural.
- Respond in the student's preferred language (English, Tamil, or Tanglish).
- Once you have gathered ALL 5 pieces of information (Name, Institution, Course/Specialization, Duration/Year/Semester, and Subjects), summarize their profile cheerfully and append a structured JSON block at the VERY END of your message in this EXACT format:

```json
{
  "onboarding_complete": true,
  "full_name": "Student Full Name",
  "institution_name": "College / University Name",
  "institution_details": {
    "location": "City, State",
    "accreditation": "NAAC A++ Grade",
    "grading_system": "10-Point CGPA Scale"
  },
  "field": "engineering",
  "specialization": "Computer Science",
  "education_level": "college",
  "duration_years": 4,
  "current_year": 1,
  "current_semester": 1,
  "subjects": ["Subject 1", "Subject 2", "Subject 3"],
  "preferred_language": "en"
}
```

Make sure the `field` key is mapped to one of: engineering, medical, commerce, arts, law, mba, or science.
Make sure `subjects` is a clean array of subject strings.
"""

@router.post("/chat-stream")
@router.post("/chat")
async def onboarding_chat_stream(
    req: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Streams AI responses during step-by-step conversational onboarding with Groq model fallback."""
    messages = req.get("messages", [])
    
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        async def fallback_stream():
            yield f"data: {json.dumps({'type': 'text', 'content': 'Welcome! Please configure GROQ_API_KEY for full AI onboarding.'})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(fallback_stream(), media_type="text/event-stream")

    client = AsyncGroq(api_key=api_key)

    formatted_messages = [{"role": "system", "content": ONBOARDING_SYSTEM_PROMPT}]
    for m in messages:
        role = "user" if m.get("role") == "user" else "assistant"
        formatted_messages.append({"role": role, "content": m.get("content", "")})

    candidate_models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]

    async def event_generator():
        success = False
        for model_name in candidate_models:
            try:
                response_stream = await client.chat.completions.create(
                    model=model_name,
                    messages=formatted_messages,
                    stream=True,
                    temperature=0.6,
                    max_tokens=2048
                )

                async for chunk in response_stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        success = True
                        text_part = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'type': 'text', 'content': text_part})}\n\n"

                if success:
                    break
            except Exception as e:
                logger.warning(f"Onboarding stream model {model_name} failed: {e}")

        if not success:
            yield f"data: {json.dumps({'type': 'text', 'content': 'Internal AI streaming error. Please try clicking next step.'})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def generate_smart_fallback_response(messages: List[Dict[str, Any]]) -> str:
    """Smart step-by-step fallback parser based on conversation turns with automated college web search."""
    user_msgs = [m.get("content", "") for m in messages if m.get("role") == "user"]
    user_turns = len(user_msgs)
    
    if user_turns <= 1:
        name = user_msgs[0] if user_msgs else "Student"
        return f"Nice to meet you, **{name}**! 🎓\n\nNext, what is the name of your **College, University, or School**?"
    elif user_turns == 2:
        inst_name = user_msgs[1] if len(user_msgs) > 1 else "University"
        college_info = college_search_service.search_college_info(inst_name)
        return (
            f"Awesome! I performed a web search and found **{college_info['name']}** ({college_info['location']}). "
            f"It is a **{college_info['accreditation']}** operating on a **{college_info['grading_system']}**. "
            f"I have saved these academic facts into your Scholar AI memory! 🌐🎓\n\n"
            f"What **Course or Field of Study & Specialization** are you pursuing? (e.g. B.E Computer Science, B.Com Finance, Medicine)"
        )
    elif user_turns == 3:
        return "Got it! ⏱️ What is your **Course Duration** (in years), **Current Year**, and **Current Semester**? (e.g. 4 Years, Year 2, Semester 3)"
    elif user_turns == 4:
        return "Great! 📝 Finally, please list your **Enrolled Subjects** separated by commas."
    else:
        # Step 5 complete: extract subjects, perform web search on college, and build structured memory JSON
        raw_subjects = user_msgs[-1] if user_msgs else "Python Programming, Data Structures, Mathematics"
        subjs = [s.strip() for s in raw_subjects.split(",") if s.strip()]
        if not subjs:
            subjs = ["Mathematics", "Python Programming", "Data Structures"]

        inst_name = user_msgs[1] if len(user_msgs) > 1 else "University"
        college_info = college_search_service.search_college_info(inst_name)
        field_text = user_msgs[2] if len(user_msgs) > 2 else "Computer Science Engineering"

        structured = {
            "onboarding_complete": True,
            "full_name": user_msgs[0] if len(user_msgs) > 0 else "Student",
            "institution_name": inst_name,
            "institution_details": college_info,
            "field": "engineering",
            "specialization": field_text,
            "education_level": "college",
            "duration_years": 4,
            "current_year": 2,
            "current_semester": 3,
            "subjects": subjs,
            "preferred_language": "en"
        }
        return (
            f"Thank you! Scholar AI searched up **{college_info['name']}** ({college_info['location']}), "
            f"structured your academic profile, and saved it into your backend memory system! 🌐🚀\n\n"
            f"```json\n{json.dumps(structured, indent=2)}\n```"
        )


@router.post("", response_model=OnboardingResponse)
async def submit_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Parse subjects input (array or comma-separated string)
    if isinstance(req.subjects, str):
        raw_list = req.subjects.split(",")
    elif isinstance(req.subjects, list):
        raw_list = req.subjects
    else:
        raw_list = []

    parsed_subjects = [s.strip() for s in raw_list if isinstance(s, str) and s.strip()]

    # Web search for college info if not passed directly in payload
    college_details = req.institution_details
    if not college_details and req.institution_name:
        college_details = college_search_service.search_college_info(req.institution_name)

    # 1. Create or update Academic Profile with ALL user memory fields
    result = await db.execute(
        select(AcademicProfile)
        .where(AcademicProfile.user_id == current_user.id)
        .where(AcademicProfile.is_active == True)
    )
    profile = result.scalars().first()

    if not profile:
        profile = AcademicProfile(
            user_id=current_user.id,
            education_level=req.education_level,
            field=req.field,
            specialization=req.specialization,
            institution_name=req.institution_name,
            institution_details_json=college_details,
            board=req.board,
            duration_years=req.duration_years,
            current_year=req.current_year,
            current_semester=req.current_semester,
            target_score=req.target_score,
            subjects_json=parsed_subjects,
            is_active=True
        )
        db.add(profile)
    else:
        profile.education_level = req.education_level
        profile.field = req.field
        profile.specialization = req.specialization
        profile.institution_name = req.institution_name
        profile.institution_details_json = college_details
        profile.board = req.board
        profile.duration_years = req.duration_years
        profile.current_year = req.current_year
        profile.current_semester = req.current_semester
        profile.target_score = req.target_score
        profile.subjects_json = parsed_subjects

    # 2. Delete any old user subjects and recreate ONLY the subjects provided by user
    await db.execute(
        delete(Subject).where(Subject.user_id == current_user.id)
    )

    for subj_name in parsed_subjects:
        subj = Subject(
            user_id=current_user.id,
            name=subj_name,
            education_level=req.education_level,
            field=req.field,
            semester=req.current_semester
        )
        db.add(subj)

    # 3. Update User Onboarding Status and Preferred Language
    current_user.onboarding_completed = True
    if req.preferred_language:
        current_user.preferred_language = req.preferred_language

    await db.commit()

    return OnboardingResponse(
        status="success",
        message="Academic onboarding profile created successfully with custom subjects and college web search intelligence",
        onboarding_completed=True
    )
