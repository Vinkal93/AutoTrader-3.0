"""Application Configuration using Pydantic Settings."""

import os
from typing import List, Optional, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Production application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Application Settings ----
    APP_NAME: str = "NIFTY Auto Trader"
    APP_VERSION: str = "3.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_DEBUG: Optional[bool] = None

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    SECRET_KEY: str = "change-this-in-production-default-secure-secret-key-32b"
    API_SECRET_KEY: Optional[str] = None

    # ---- Database Settings ----
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/autotrader"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # ---- Supabase Settings ----
    SUPABASE_URL: Optional[str] = None
    NEXT_PUBLIC_SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    # ---- Kotak Neo Broker Credentials ----
    KOTAK_NEO_CONSUMER_KEY: Optional[str] = None
    KOTAK_NEO_CONSUMER_SECRET: Optional[str] = None
    KOTAK_NEO_MOBILE_NUMBER: Optional[str] = None
    KOTAK_NEO_PASSWORD: Optional[str] = None

    # ---- Redis Settings ----
    REDIS_URL: str = "redis://localhost:6379/0"

    # ---- Security & CORS ----
    API_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    RATE_LIMIT_PER_MINUTE: int = 60
    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = "lax"

    # ---- Logging ----
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    @field_validator("API_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if not v.strip():
                return []
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return []

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if not v.strip():
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    @property
    def is_debug(self) -> bool:
        if self.API_DEBUG is not None:
            return self.API_DEBUG
        return self.DEBUG

    @property
    def effective_secret_key(self) -> str:
        return self.API_SECRET_KEY or self.SECRET_KEY

    @property
    def effective_supabase_url(self) -> Optional[str]:
        return self.SUPABASE_URL or self.NEXT_PUBLIC_SUPABASE_URL

    @property
    def effective_supabase_anon_key(self) -> Optional[str]:
        return self.SUPABASE_ANON_KEY or self.NEXT_PUBLIC_SUPABASE_ANON_KEY

    @property
    def has_kotak_credentials(self) -> bool:
        return bool(
            self.KOTAK_NEO_CONSUMER_KEY
            and self.KOTAK_NEO_CONSUMER_SECRET
            and self.KOTAK_NEO_MOBILE_NUMBER
            and self.KOTAK_NEO_PASSWORD
        )


settings = Settings()
