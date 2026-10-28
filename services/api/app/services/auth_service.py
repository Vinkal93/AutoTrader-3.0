"""Authentication service supporting Supabase JWT and single-owner trading system mode."""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000001"
DEFAULT_OWNER_EMAIL = "trader@autotrader.local"


class CurrentUser:
    """Authenticated user representation."""

    def __init__(self, id: str, email: str, role: str = "authenticated"):
        self.id = id
        self.email = email
        self.role = role


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> CurrentUser:
    """Validate JWT token from Supabase Auth or provide single-owner fallback in development."""
    # In development mode, allow single-owner bypass if no token is passed
    if credentials is None:
        if settings.is_debug or settings.APP_ENV == "development":
            return CurrentUser(
                id=DEFAULT_OWNER_ID,
                email=DEFAULT_OWNER_EMAIL,
                role="service_role",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    jwt_secret = settings.SUPABASE_JWT_SECRET or settings.effective_secret_key

    try:
        # Validate JWT token
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub") or DEFAULT_OWNER_ID
        email = payload.get("email") or DEFAULT_OWNER_EMAIL
        role = payload.get("role", "authenticated")
        return CurrentUser(id=user_id, email=email, role=role)
    except JWTError as exc:
        logger.warning(f"JWT verification failed: {exc}")
        if settings.is_debug:
            # Tolerant in development with warning
            return CurrentUser(
                id=DEFAULT_OWNER_ID,
                email=DEFAULT_OWNER_EMAIL,
                role="authenticated",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
