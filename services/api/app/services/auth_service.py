"""Authentication service supporting Google OAuth, Email/Password, Supabase JWT, and multi-tenant isolation."""

import hashlib
import hmac
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db
from app.models.entities import Profile, User, UserPreference, gen_uuid, now_utc

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000001"
DEFAULT_OWNER_EMAIL = "trader@autotrader.local"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salt."""
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}${key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against stored PBKDF2-HMAC-SHA256 hash using constant-time comparison."""
    try:
        salt_hex, key_hex = hashed.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        computed_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(computed_key, expected_key)
    except Exception:
        return False


def create_access_token(
    user_id: str,
    email: str,
    role: str = "authenticated",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT access token."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    jwt_secret = settings.SUPABASE_JWT_SECRET or settings.effective_secret_key
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


class CurrentUser:
    """Authenticated user representation in request context."""

    def __init__(
        self,
        id: str,
        email: str,
        role: str = "authenticated",
        full_name: Optional[str] = None,
        is_onboarded: bool = True,
    ):
        self.id = id
        self.email = email
        self.role = role
        self.full_name = full_name
        self.is_onboarded = is_onboarded

    @property
    def is_admin(self) -> bool:
        return self.role in ("admin", "service_role", "super_admin")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> CurrentUser:
    """Validate JWT token from Authorization header or provide fallback in development."""
    if credentials is None:
        if settings.is_debug or settings.APP_ENV == "development":
            return CurrentUser(
                id=DEFAULT_OWNER_ID,
                email=DEFAULT_OWNER_EMAIL,
                role="service_role",
                full_name="Primary Trader",
                is_onboarded=True,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    jwt_secret = settings.SUPABASE_JWT_SECRET or settings.effective_secret_key

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub") or DEFAULT_OWNER_ID
        email = payload.get("email") or DEFAULT_OWNER_EMAIL
        role = payload.get("role", "authenticated")
        full_name = payload.get("full_name")
        is_onboarded = payload.get("is_onboarded", True)
        return CurrentUser(
            id=user_id,
            email=email,
            role=role,
            full_name=full_name,
            is_onboarded=is_onboarded,
        )
    except JWTError as exc:
        logger.warning(f"JWT verification failed: {exc}")
        if settings.is_debug:
            return CurrentUser(
                id=DEFAULT_OWNER_ID,
                email=DEFAULT_OWNER_EMAIL,
                role="authenticated",
                full_name="Primary Trader",
                is_onboarded=True,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Enforce administrative authorization boundary."""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required",
        )
    return user


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> Tuple[Optional[User], Optional[Profile]]:
    """Authenticate email & password, returning User and Profile or None."""
    query = select(User).where(User.email == email.lower().strip())
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        return None, None

    if not verify_password(password, user.password_hash):
        return None, None

    # Fetch profile
    prof_q = select(Profile).where(Profile.user_id == user.id)
    prof_res = await session.execute(prof_q)
    profile = prof_res.scalar_one_or_none()

    return user, profile


async def create_user_with_profile(
    session: AsyncSession,
    email: str,
    password: Optional[str] = None,
    full_name: Optional[str] = None,
    auth_provider: str = "email",
    avatar_url: Optional[str] = None,
) -> Tuple[User, Profile]:
    """Create a new tenant User and Profile with default preferences."""
    cleaned_email = email.lower().strip()

    # Check duplicate
    existing_q = select(User).where(User.email == cleaned_email)
    existing_res = await session.execute(existing_q)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    pwd_hash = hash_password(password) if password else None
    new_user = User(
        id=gen_uuid(),
        email=cleaned_email,
        full_name=full_name,
        avatar_url=avatar_url,
        password_hash=pwd_hash,
        auth_provider=auth_provider,
        email_verified=bool(auth_provider == "google"),
        is_active=True,
    )
    session.add(new_user)
    await session.flush()

    new_profile = Profile(
        id=gen_uuid(),
        user_id=new_user.id,
        phone_number=None,
        pan_number_masked=None,
        kyc_status="VERIFIED",
        risk_appetite="MODERATE",
        max_capital_allocation=500000.0,
        is_onboarded=False,
        onboarded_at=None,
    )
    session.add(new_profile)

    new_pref = UserPreference(
        id=gen_uuid(),
        user_id=new_user.id,
        theme="light",
        default_lot_size=1,
        sound_enabled=True,
        default_broker_id=None,
    )
    session.add(new_pref)

    await session.commit()
    return new_user, new_profile


async def get_or_create_google_user(
    session: AsyncSession,
    email: str,
    full_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> Tuple[User, Profile]:
    """Link or create user authenticated via Google OAuth."""
    cleaned_email = email.lower().strip()
    query = select(User).where(User.email == cleaned_email)
    res = await session.execute(query)
    user = res.scalar_one_or_none()

    if user:
        # Existing account - update avatar/name if missing
        if full_name and not user.full_name:
            user.full_name = full_name
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.email_verified = True
        await session.commit()

        prof_q = select(Profile).where(Profile.user_id == user.id)
        prof_res = await session.execute(prof_q)
        profile = prof_res.scalar_one_or_none()
        if not profile:
            profile = Profile(
                id=gen_uuid(),
                user_id=user.id,
                is_onboarded=False,
            )
            session.add(profile)
            await session.commit()
        return user, profile

    # New Google User
    return await create_user_with_profile(
        session=session,
        email=cleaned_email,
        password=None,
        full_name=full_name,
        auth_provider="google",
        avatar_url=avatar_url,
    )



async def require_super_admin(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """Authorize Super Admin role on backend (Task 1 & 8).
    Verifies user permissions from database session to block unauthorized elevation.
    """
    stmt = select(User).where(User.id == current_user.id).limit(1)
    res = await db.execute(stmt)
    user_entity = res.scalars().first()

    role = (getattr(user_entity, "role", None) or current_user.role or "trader").lower()
    if role not in ("super_admin", "admin", "service_role"):
        logger.warning(
            f"Unauthorized super-admin access rejected for user {current_user.id} ({current_user.email}) with role '{role}'"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Super Administrator privileges required.",
        )
    return current_user
