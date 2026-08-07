from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import List, Dict, Any, Optional
import uuid
import json
import logging

from app.dependencies import get_current_user
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from app.models.connect import (
    UserConnection,
    ConnectGroup,
    GroupMember,
    ConnectMessage,
    CollaborativeNoteState,
    AcademicReputationLog
)
from app.schemas.connect import (
    UserConnectionResponse,
    ConnectGroupCreate,
    ConnectGroupResponse,
    ConnectMessageCreate,
    ConnectMessageResponse,
    PartnerRecommendationResponse,
    AcademicFeedItemResponse
)
from app.core.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Realtime WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, channel_id: str, websocket: WebSocket):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)

    def disconnect(self, channel_id: str, websocket: WebSocket):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]

    async def broadcast(self, channel_id: str, message: dict):
        if channel_id in self.active_connections:
            data = json.dumps(message)
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_text(data)
                except Exception:
                    pass

ws_manager = ConnectionManager()

# --- 1. FRIENDSHIPS & CONNECTIONS ---

@router.get("/friends", response_model=List[UserConnectionResponse])
async def get_user_friends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(UserConnection)
        .where(
            or_(
                UserConnection.requester_id == current_user.id,
                UserConnection.addressee_id == current_user.id
            )
        )
    )
    connections = res.scalars().all()
    out = []
    for c in connections:
        req_res = await db.execute(select(User).where(User.id == c.requester_id))
        add_res = await db.execute(select(User).where(User.id == c.addressee_id))
        req = req_res.scalars().first()
        add = add_res.scalars().first()

        out.append(UserConnectionResponse(
            id=c.id,
            requester_id=c.requester_id,
            addressee_id=c.addressee_id,
            status=c.status,
            created_at=c.created_at,
            requester_name=req.full_name if req else "Student",
            addressee_name=add.full_name if add else "Student",
            requester_avatar=req.avatar_url if req else None,
            addressee_avatar=add.avatar_url if add else None
        ))
    return out

@router.post("/friends/request", response_model=UserConnectionResponse, status_code=status.HTTP_201_CREATED)
async def send_friend_request(
    target_email_or_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(User)
        .where(or_(User.email == target_email_or_id, User.id == target_email_or_id))
    )
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Student not found")
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    conn = UserConnection(
        requester_id=current_user.id,
        addressee_id=target_user.id,
        status="pending"
    )
    db.add(conn)
    await db.commit()
    await db.refresh(conn)

    return UserConnectionResponse(
        id=conn.id,
        requester_id=conn.requester_id,
        addressee_id=conn.addressee_id,
        status=conn.status,
        created_at=conn.created_at,
        requester_name=current_user.full_name,
        addressee_name=target_user.full_name,
        requester_avatar=current_user.avatar_url,
        addressee_avatar=target_user.avatar_url
    )

@router.patch("/friends/{connection_id}/accept")
async def accept_friend_request(
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(UserConnection).where(UserConnection.id == connection_id))
    conn = res.scalars().first()
    if not conn or (conn.addressee_id != current_user.id and conn.requester_id != current_user.id):
        raise HTTPException(status_code=404, detail="Connection request not found")

    conn.status = "accepted"
    await db.commit()
    return {"message": "Friend request accepted!"}

# --- 2. STUDY GROUPS & ROOMS ---

@router.get("/groups", response_model=List[ConnectGroupResponse])
async def get_study_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(ConnectGroup).order_by(ConnectGroup.created_at.desc()))
    groups = res.scalars().all()
    out = []
    for g in groups:
        m_res = await db.execute(select(GroupMember).where(GroupMember.group_id == g.id))
        count = len(m_res.scalars().all())
        out.append(ConnectGroupResponse(
            id=g.id,
            owner_id=g.owner_id,
            name=g.name,
            description=g.description,
            subject_name=g.subject_name,
            is_private=g.is_private,
            invite_code=g.invite_code,
            created_at=g.created_at,
            member_count=count
        ))
    return out

@router.post("/groups", response_model=ConnectGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_study_group(
    req: ConnectGroupCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invite_code = str(uuid.uuid4())[:8].upper()
    group = ConnectGroup(
        owner_id=current_user.id,
        name=req.name,
        description=req.description,
        subject_name=req.subject_name,
        is_private=req.is_private,
        invite_code=invite_code
    )
    db.add(group)
    await db.flush()

    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(member)
    await db.commit()
    await db.refresh(group)

    return ConnectGroupResponse(
        id=group.id,
        owner_id=group.owner_id,
        name=group.name,
        description=group.description,
        subject_name=group.subject_name,
        is_private=group.is_private,
        invite_code=group.invite_code,
        created_at=group.created_at,
        member_count=1
    )

# --- 3. MESSAGING & ARTIFACT SHARING ---

@router.get("/messages/{channel_id}", response_model=List[ConnectMessageResponse])
async def get_channel_messages(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(ConnectMessage)
        .where(ConnectMessage.channel_id == channel_id)
        .order_by(ConnectMessage.created_at.asc())
    )
    messages = res.scalars().all()
    out = []
    for m in messages:
        u_res = await db.execute(select(User).where(User.id == m.sender_id))
        u = u_res.scalars().first()
        out.append(ConnectMessageResponse(
            id=m.id,
            channel_id=m.channel_id,
            sender_id=m.sender_id,
            sender_name=u.full_name if u else "Student",
            sender_avatar=u.avatar_url if u else None,
            content=m.content,
            message_type=m.message_type,
            attachment_metadata=m.attachment_metadata,
            is_read=m.is_read,
            created_at=m.created_at
        ))
    return out

@router.post("/messages", response_model=ConnectMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_connect_message(
    req: ConnectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    msg = ConnectMessage(
        channel_id=req.channel_id,
        sender_id=current_user.id,
        content=req.content,
        message_type=req.message_type,
        attachment_metadata=req.attachment_metadata or {}
    )
    db.add(msg)

    # Award Academic Reputation points for sharing notes or helping peers
    if req.message_type.startswith("shared_"):
        log = AcademicReputationLog(
            user_id=current_user.id,
            action_type=req.message_type,
            points=15,
            description=f"Shared academic artifact ({req.message_type}) in {req.channel_id}"
        )
        db.add(log)

    await db.commit()
    await db.refresh(msg)

    resp = ConnectMessageResponse(
        id=msg.id,
        channel_id=msg.channel_id,
        sender_id=msg.sender_id,
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=msg.content,
        message_type=msg.message_type,
        attachment_metadata=msg.attachment_metadata,
        is_read=msg.is_read,
        created_at=msg.created_at
    )

    # Broadcast via WebSocket
    await ws_manager.broadcast(req.channel_id, {
        "type": "new_message",
        "message": resp.model_dump(mode="json")
    })

    return resp

# --- 4. AI STUDY PARTNER RECOMMENDER ---

@router.get("/recommendations", response_model=List[PartnerRecommendationResponse])
async def get_ai_partner_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch profiles of other students
    res = await db.execute(
        select(AcademicProfile)
        .where(AcademicProfile.user_id != current_user.id)
    )
    profiles = res.scalars().all()

    my_prof_res = await db.execute(select(AcademicProfile).where(AcademicProfile.user_id == current_user.id))
    my_prof = my_prof_res.scalars().first()
    my_subjects = set(my_prof.subjects if my_prof and my_prof.subjects else [])

    out = []
    for p in profiles:
        u_res = await db.execute(select(User).where(User.id == p.user_id))
        u = u_res.scalars().first()
        if not u:
            continue

        their_subjects = set(p.subjects if p.subjects else [])
        common = list(my_subjects.intersection(their_subjects))
        match_score = round(min(0.98, 0.65 + (len(common) * 0.1)), 2)

        out.append(PartnerRecommendationResponse(
            user_id=p.user_id,
            full_name=u.full_name or "Peer Student",
            avatar_url=u.avatar_url,
            institution_name=p.institution_name,
            field=p.field,
            specialization=p.specialization,
            matching_score=match_score,
            common_subjects=common or (p.subjects[:2] if p.subjects else ["Data Structures"]),
            complementary_topics=["Exam Practice", "Formula Review"]
        ))

    return out[:6]

# --- 5. ACADEMIC REPUTATION & PROGRESS FEED ---

@router.get("/feed", response_model=List[AcademicFeedItemResponse])
async def get_academic_progress_feed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AcademicReputationLog)
        .order_by(AcademicReputationLog.created_at.desc())
        .limit(20)
    )
    logs = res.scalars().all()
    out = []
    for l in logs:
        u_res = await db.execute(select(User).where(User.id == l.user_id))
        u = u_res.scalars().first()
        out.append(AcademicFeedItemResponse(
            id=l.id,
            user_id=l.user_id,
            user_name=u.full_name if u else "Student",
            user_avatar=u.avatar_url if u else None,
            action_type=l.action_type,
            points=l.points,
            description=l.description,
            created_at=l.created_at
        ))

    # Fallback default feed item if empty
    if not out:
        out.append(AcademicFeedItemResponse(
            id="default-1",
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_avatar=current_user.avatar_url,
            action_type="welcome",
            points=50,
            description="Joined ScholarConnect AI Academic Network 🚀",
            created_at=datetime.utcnow()
        ))

    return out

# --- 6. REALTIME WEBSOCKET RELAY ---

@websocket_router := APIRouter()

@router.websocket("/ws/{channel_id}")
async def websocket_connect_endpoint(websocket: WebSocket, channel_id: str):
    await ws_manager.connect(channel_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            event = json.loads(data)
            # Relay event to all users in channel (typing indicators, read receipts, whiteboard drawing)
            await ws_manager.broadcast(channel_id, event)
    except WebSocketDisconnect:
        ws_manager.disconnect(channel_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(channel_id, websocket)
