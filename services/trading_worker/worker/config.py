"""
Trading Worker Configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class WorkerSettings(BaseSettings):
    APP_NAME: str = "NIFTY Auto Trader Worker"
    APP_ENV: str = "development"
    WORKER_ID: str = "worker-1"
    HEARTBEAT_INTERVAL_SECONDS: int = 5
    LEADER_LOCK_KEY: str = "autotrader:worker:leader"
    LEADER_LOCK_TTL_SECONDS: int = 15
    DATABASE_URL: str = "postgresql+asyncpg://autotrader:localdev@localhost:5432/autotrader"
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    API_URL: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


worker_settings = WorkerSettings()
