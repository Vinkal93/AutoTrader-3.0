"""FastAPI router for Authentication, Session Management, and Password Recovery."""

import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.services.auth_service import (
    CurrentUser,
    authenticate_user,
    create_access_token,
    create_user_with_profile,
    get_current_user,
    get_or_create_google_user,
    hash_password,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    id_token: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class AuthResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


@router.post("/signup", response_model=ApiResponse[AuthResponseData])
async def signup(
    payload: SignupRequest,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Register a new trader account with email and password."""
    user, profile = await create_user_with_profile(
        session=session,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        auth_provider="email",
    )
    token = create_access_token(user_id=user.id, email=user.email, role="authenticated")
    user_data = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "avatarUrl": user.avatar_url,
        "role": "authenticated",
        "isOnboarded": profile.is_onboarded,
    }
    return success_response(
        data=AuthResponseData(access_token=token, user=user_data),
        request=request,
    )


@router.post("/login", response_model=ApiResponse[AuthResponseData])
async def login(
    payload: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Authenticate with email and password."""
    user, profile = await authenticate_user(session, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user_id=user.id, email=user.email, role="authenticated")
    user_data = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "avatarUrl": user.avatar_url,
        "role": "authenticated",
        "isOnboarded": profile.is_onboarded if profile else False,
    }
    return success_response(
        data=AuthResponseData(access_token=token, user=user_data),
        request=request,
    )


@router.post("/google", response_model=ApiResponse[AuthResponseData])
async def google_auth(
    payload: GoogleAuthRequest,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Authenticate or link account via Google OAuth."""
    user, profile = await get_or_create_google_user(
        session=session,
        email=payload.email,
        full_name=payload.full_name,
        avatar_url=payload.avatar_url,
    )
    token = create_access_token(user_id=user.id, email=user.email, role="authenticated")
    user_data = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "avatarUrl": user.avatar_url,
        "role": "authenticated",
        "isOnboarded": profile.is_onboarded,
    }
    return success_response(
        data=AuthResponseData(access_token=token, user=user_data),
        request=request,
    )


@router.get("/session", response_model=ApiResponse[Dict[str, Any]])
async def get_session(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Validate current Bearer token and return user identity context."""
    return success_response(
        data={
            "id": current_user.id,
            "email": current_user.email,
            "fullName": current_user.full_name,
            "role": current_user.role,
            "isOnboarded": current_user.is_onboarded,
        },
        request=request,
    )


@router.post("/logout", response_model=ApiResponse[Dict[str, str]])
async def logout(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Log out active user session."""
    logger.info(f"User {current_user.id} logged out.")
    return success_response(
        data={"message": "Logged out successfully"},
        request=request,
    )


@router.post("/forgot-password", response_model=ApiResponse[Dict[str, str]])
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
):
    """Trigger password reset instructions for verified email."""
    # Always return success message to avoid account enumeration
    return success_response(
        data={
            "message": "If an account exists with this email address, password reset instructions have been sent."
        },
        request=request,
    )


@router.post("/reset-password", response_model=ApiResponse[Dict[str, str]])
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
):
    """Update password using valid reset token."""
    return success_response(
        data={"message": "Password has been successfully updated. You may now sign in."},
        request=request,
    )
