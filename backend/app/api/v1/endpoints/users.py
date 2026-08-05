from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.dependencies import get_current_user
from app.models.user import User
from app.models.academic_profile import AcademicProfile
from app.models.subject import Subject
from app.schemas.user import UserResponse, UserUpdate, UserProfileResponse, UserProfileUpdate
from app.core.database import get_db
from app.services.college_search_service import college_search_service

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/profile", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Return the full user profile with academic memory (college, course, subjects, etc.)."""
    res = await db.execute(
        select(AcademicProfile)
        .where(AcademicProfile.user_id == current_user.id)
        .where(AcademicProfile.is_active == True)
    )
    profile = res.scalars().first()

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        preferred_language=current_user.preferred_language,
        subscription_tier=current_user.subscription_tier,
        onboarding_completed=current_user.onboarding_completed,
        education_level=profile.education_level if profile else None,
        field=profile.field if profile else None,
        specialization=profile.specialization if profile else None,
        institution_name=profile.institution_name if profile else None,
        institution_details=profile.institution_details_json if profile else None,
        duration_years=profile.duration_years if profile else None,
        current_year=profile.current_year if profile else None,
        current_semester=profile.current_semester if profile else None,
        subjects=profile.subjects_json if profile and profile.subjects_json else [],
    )

@router.patch("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.preferred_language is not None:
        current_user.preferred_language = req.preferred_language
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.timezone is not None:
        current_user.timezone = req.timezone

    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.patch("/me/profile", response_model=UserProfileResponse)
async def update_my_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates user identity and full academic memory (College, Course, Duration, Subjects)."""
    # 1. Update User basic info
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.preferred_language is not None:
        current_user.preferred_language = req.preferred_language

    # 2. Get or create AcademicProfile
    res = await db.execute(
        select(AcademicProfile)
        .where(AcademicProfile.user_id == current_user.id)
        .where(AcademicProfile.is_active == True)
    )
    profile = res.scalars().first()
    if not profile:
        profile = AcademicProfile(
            user_id=current_user.id,
            is_active=True,
            education_level="college"
        )
        db.add(profile)

    if req.education_level is not None:
        profile.education_level = req.education_level
    if req.field is not None:
        profile.field = req.field
    if req.specialization is not None:
        profile.specialization = req.specialization
    if req.duration_years is not None:
        profile.duration_years = req.duration_years
    if req.current_year is not None:
        profile.current_year = req.current_year
    if req.current_semester is not None:
        profile.current_semester = req.current_semester

    # 3. Update college and run web search if college name changed
    if req.institution_name is not None and req.institution_name != profile.institution_name:
        profile.institution_name = req.institution_name
        college_info = college_search_service.search_college_info(req.institution_name)
        if college_info:
            profile.institution_details_json = college_info

    # 4. Sync enrolled subjects
    if req.subjects is not None:
        clean_subjects = [s.strip() for s in req.subjects if s.strip()]
        profile.subjects_json = clean_subjects

        # Sync Subject DB table
        existing_res = await db.execute(select(Subject).where(Subject.user_id == current_user.id))
        existing_subjs = existing_res.scalars().all()
        existing_map = {s.name.lower(): s for s in existing_subjs}

        for subj_name in clean_subjects:
            if subj_name.lower() not in existing_map:
                new_subj = Subject(
                    user_id=current_user.id,
                    name=subj_name,
                    education_level=profile.education_level or "college",
                    field=profile.field or "engineering"
                )
                db.add(new_subj)

    await db.commit()
    await db.refresh(current_user)
    await db.refresh(profile)

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        preferred_language=current_user.preferred_language,
        subscription_tier=current_user.subscription_tier,
        onboarding_completed=current_user.onboarding_completed,
        education_level=profile.education_level,
        field=profile.field,
        specialization=profile.specialization,
        institution_name=profile.institution_name,
        institution_details=profile.institution_details_json,
        duration_years=profile.duration_years,
        current_year=profile.current_year,
        current_semester=profile.current_semester,
        subjects=profile.subjects_json or [],
    )
