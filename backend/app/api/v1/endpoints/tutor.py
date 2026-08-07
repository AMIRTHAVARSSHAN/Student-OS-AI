from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json
import logging

from app.dependencies import get_current_user
from app.models.user import User
from app.models.tutor import TutorSession, AcademicMemory, SessionAsset, ConceptNode
from app.schemas.tutor import (
    TutorSessionCreate,
    TutorSessionResponse,
    SessionAssetCreate,
    SessionAssetResponse,
    AcademicMemoryResponse,
    TutorChatMessage,
    ActiveStudyStepRequest,
    ConceptNodeResponse
)
from app.services.tutor.context_engine import context_engine
from app.services.tutor.tutor_pipeline import tutor_pipeline
from app.core.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/sessions", response_model=List[TutorSessionResponse])
async def get_user_tutor_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(TutorSession)
        .where(TutorSession.user_id == current_user.id)
        .order_by(TutorSession.last_activity_at.desc())
    )
    return res.scalars().all()

@router.post("/sessions", response_model=TutorSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_tutor_session(
    req: TutorSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = TutorSession(
        user_id=current_user.id,
        title=req.title,
        subject_id=str(req.subject_id) if req.subject_id else None,
        chapter=req.chapter or "Chapter 1",
        goal=req.goal or f"Master concepts in {req.title}",
        difficulty=req.difficulty,
        teaching_style=req.teaching_style,
        status="active"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/sessions/{session_id}", response_model=TutorSessionResponse)
async def get_tutor_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(TutorSession)
        .where(TutorSession.id == session_id)
        .where(TutorSession.user_id == current_user.id)
    )
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Tutor session not found")
    return session

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tutor_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(TutorSession)
        .where(TutorSession.id == session_id)
        .where(TutorSession.user_id == current_user.id)
    )
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Tutor session not found")
    await db.delete(session)
    await db.commit()

@router.get("/memory", response_model=AcademicMemoryResponse)
async def get_user_academic_memory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    memory = await context_engine.get_or_create_academic_memory(db, current_user.id)
    return memory

@router.get("/concept-graph", response_model=List[ConceptNodeResponse])
async def get_concept_graph(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(ConceptNode)
        .where(ConceptNode.user_id == current_user.id)
        .order_by(ConceptNode.created_at.desc())
    )
    nodes = res.scalars().all()

    # Seed default nodes if none exist
    if not nodes:
        default_concepts = [
            ConceptNode(user_id=current_user.id, concept_name="Cellular Biology", subject_name="Biology", parent_concept_name=None, prerequisites=[], mastery_level=0.9),
            ConceptNode(user_id=current_user.id, concept_name="DNA & Genetics", subject_name="Biology", parent_concept_name="Cellular Biology", prerequisites=["Cellular Biology"], mastery_level=0.8),
            ConceptNode(user_id=current_user.id, concept_name="Transcription & Translation", subject_name="Biology", parent_concept_name="DNA & Genetics", prerequisites=["DNA & Genetics"], mastery_level=0.7),
            ConceptNode(user_id=current_user.id, concept_name="Gene Mutations", subject_name="Biology", parent_concept_name="Transcription & Translation", prerequisites=["Transcription & Translation"], mastery_level=0.5),
        ]
        for node in default_concepts:
            db.add(node)
        await db.commit()
        res = await db.execute(select(ConceptNode).where(ConceptNode.user_id == current_user.id))
        nodes = res.scalars().all()

    return nodes

@router.post("/chat")
async def tutor_chat_stream(
    req: TutorChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session_id = str(req.session_id) if req.session_id else None

    # Build multi-source context
    context = await context_engine.build_full_academic_context(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
        query=req.message
    )

    messages = [{"role": "user", "content": req.message}]

    async def event_generator():
        collected = ""
        async for chunk in tutor_pipeline.stream_tutor_response(
            messages=messages,
            context=context,
            action=req.action,
            style_override=req.teaching_style
        ):
            if chunk["type"] == "text":
                collected += chunk["content"]
                yield f"data: {json.dumps(chunk)}\n\n"
            elif chunk["type"] == "error":
                yield f"data: {json.dumps(chunk)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/study-step")
async def execute_study_step(
    req: ActiveStudyStepRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await tutor_pipeline.execute_active_study_step(
        db=db,
        user_id=current_user.id,
        session_id=str(req.session_id),
        topic=req.current_topic,
        student_response=req.student_response,
        step_type=req.step_type
    )
    return result

@router.get("/sessions/{session_id}/assets", response_model=List[SessionAssetResponse])
async def get_session_assets(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(SessionAsset)
        .where(SessionAsset.session_id == session_id)
        .order_by(SessionAsset.created_at.desc())
    )
    return res.scalars().all()

@router.post("/assets", response_model=SessionAssetResponse, status_code=status.HTTP_201_CREATED)
async def create_session_asset(
    req: SessionAssetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    asset = SessionAsset(
        session_id=str(req.session_id),
        asset_type=req.asset_type,
        title=req.title,
        content=req.content,
        file_path=req.file_path,
        metadata_json=req.metadata_json
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset
