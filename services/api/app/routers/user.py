"""FastAPI router for User Profiles, Preferences, and Onboarding."""

import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import Profile, User, UserPreference, BrokerConnection, now_utc, gen_uuid
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/user", tags=["User & Profile"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    risk_appetite: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    theme: Optional[str] = None
    default_lot_size: Optional[int] = Field(None, ge=1, le=50)
    sound_enabled: Optional[bool] = None
    default_broker_id: Optional[str] = None


class CompleteOnboardingRequest(BaseModel):
    selected_broker_id: Optional[str] = None
    connect_broker_now: bool = False
    theme: Optional[str] = "light"
    default_lot_size: Optional[int] = 1
    risk_appetite: Optional[str] = "MODERATE"
    broker_account_id: Optional[str] = None
    api_key_masked: Optional[str] = None


@router.get("/profile", response_model=ApiResponse[Dict[str, Any]])
async def get_profile(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieve verified profile for current tenant."""
    query = select(Profile).where(Profile.user_id == current_user.id)
    res = await session.execute(query)
    profile = res.scalar_one_or_none()

    user_q = select(User).where(User.id == current_user.id)
    user_res = await session.execute(user_q)
    user = user_res.scalar_one_or_none()

    if not profile:
        profile = Profile(
            id=gen_uuid(),
            user_id=current_user.id,
            is_onboarded=False,
        )
        session.add(profile)
        await session.commit()

    return success_response(
        data={
            "id": profile.id,
            "userId": profile.user_id,
            "email": user.email if user else current_user.email,
            "fullName": user.full_name if user else current_user.full_name,
            "avatarUrl": user.avatar_url if user else None,
            "phoneNumber": profile.phone_number,
            "panNumberMasked": profile.pan_number_masked,
            "kycStatus": profile.kyc_status,
            "riskAppetite": profile.risk_appetite,
            "maxCapitalAllocation": float(profile.max_capital_allocation),
            "isOnboarded": profile.is_onboarded,
            "onboardedAt": profile.onboarded_at.isoformat() if profile.onboarded_at else None,
            "createdAt": profile.created_at.isoformat(),
            "updatedAt": profile.updated_at.isoformat(),
        },
        request=request,
    )


@router.put("/profile", response_model=ApiResponse[Dict[str, Any]])
async def update_profile(
    payload: UpdateProfileRequest,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Update user profile contact and risk appetite settings."""
    query = select(Profile).where(Profile.user_id == current_user.id)
    res = await session.execute(query)
    profile = res.scalar_one_or_none()

    user_q = select(User).where(User.id == current_user.id)
    user_res = await session.execute(user_q)
    user = user_res.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.full_name is not None and user:
        user.full_name = payload.full_name
    if payload.phone_number is not None:
        profile.phone_number = payload.phone_number
    if payload.risk_appetite is not None:
        profile.risk_appetite = payload.risk_appetite

    profile.updated_at = now_utc()
    await session.commit()

    return success_response(
        data={"message": "Profile updated successfully"},
        request=request,
    )


@router.get("/preferences", response_model=ApiResponse[Dict[str, Any]])
async def get_preferences(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieve UI and trading execution preferences."""
    query = select(UserPreference).where(UserPreference.user_id == current_user.id)
    res = await session.execute(query)
    pref = res.scalar_one_or_none()

    if not pref:
        pref = UserPreference(
            id=gen_uuid(),
            user_id=current_user.id,
            theme="light",
            default_lot_size=1,
            sound_enabled=True,
        )
        session.add(pref)
        await session.commit()

    return success_response(
        data={
            "id": pref.id,
            "userId": pref.user_id,
            "theme": pref.theme,
            "defaultLotSize": pref.default_lot_size,
            "soundEnabled": pref.sound_enabled,
            "defaultBrokerId": pref.default_broker_id,
        },
        request=request,
    )


@router.post("/onboarding/complete", response_model=ApiResponse[Dict[str, Any]])
async def complete_onboarding(
    payload: CompleteOnboardingRequest,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Mark first-time onboarding as completed and persist preferences."""
    # 1. Update Profile
    prof_q = select(Profile).where(Profile.user_id == current_user.id)
    prof_res = await session.execute(prof_q)
    profile = prof_res.scalar_one_or_none()

    if not profile:
        profile = Profile(
            id=gen_uuid(),
            user_id=current_user.id,
        )
        session.add(profile)

    profile.is_onboarded = True
    profile.onboarded_at = now_utc()
    if payload.risk_appetite:
        profile.risk_appetite = payload.risk_appetite

    # 2. Update Preferences
    pref_q = select(UserPreference).where(UserPreference.user_id == current_user.id)
    pref_res = await session.execute(pref_q)
    pref = pref_res.scalar_one_or_none()

    if not pref:
        pref = UserPreference(
            id=gen_uuid(),
            user_id=current_user.id,
        )
        session.add(pref)

    if payload.theme:
        pref.theme = payload.theme
    if payload.default_lot_size:
        pref.default_lot_size = payload.default_lot_size
    if payload.selected_broker_id:
        pref.default_broker_id = payload.selected_broker_id

    # 3. Create initial Broker Connection if requested
    if payload.connect_broker_now and payload.selected_broker_id:
        existing_conn_q = select(BrokerConnection).where(
            BrokerConnection.user_id == current_user.id,
            BrokerConnection.provider_id == payload.selected_broker_id,
        )
        existing_conn = (await session.execute(existing_conn_q)).scalar_one_or_none()
        if not existing_conn:
            new_conn = BrokerConnection(
                id=gen_uuid(),
                user_id=current_user.id,
                provider_id=payload.selected_broker_id,
                account_id=payload.broker_account_id or "DEMO-CLIENT",
                alias=f"{payload.selected_broker_id} Primary",
                is_active=True,
                state="NOT_CONFIGURED" if not payload.api_key_masked else "READY",
                api_key_masked=payload.api_key_masked,
            )
            session.add(new_conn)

    await session.commit()
    logger.info(f"User {current_user.id} completed onboarding.")

    return success_response(
        data={
            "message": "Onboarding completed successfully.",
            "isOnboarded": True,
        },
        request=request,
    )
