"""Database configuration and async session lifecycle management."""

import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

logger = logging.getLogger(__name__)

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./autotrader_dev.db"


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_engine(db_url: str) -> AsyncEngine:
    """Build SQLAlchemy async engine configured for postgresql+asyncpg or sqlite+aiosqlite."""
    if db_url.startswith("postgresql"):
        # Normalize postgres:// to postgresql+asyncpg:// if needed
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        return create_async_engine(
            db_url,
            pool_size=settings.DATABASE_POOL_SIZE,
            max_overflow=settings.DATABASE_MAX_OVERFLOW,
            pool_pre_ping=True,
            echo=False,
        )
    else:
        # SQLite dev/test mode
        return create_async_engine(
            db_url,
            connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
            echo=False,
        )


# Default engine and sessionmaker
primary_url = settings.DATABASE_URL
try:
    engine = get_engine(primary_url)
except Exception as e:
    logger.warning(f"Failed to create engine with primary URL {primary_url}: {e}. Falling back to SQLite.")
    engine = get_engine(SQLITE_FALLBACK_URL)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables (used for SQLite local dev or fallback)."""
    global engine, async_session_factory
    try:
        async with engine.begin() as conn:
            # Test connection
            await conn.run_sync(lambda _: None)
    except Exception as exc:
        logger.warning(f"Database connection to {primary_url} failed ({exc}). Falling back to local SQLite ({SQLITE_FALLBACK_URL}).")
        engine = get_engine(SQLITE_FALLBACK_URL)
        async_session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )

    # In SQLite fallback or dev mode, auto-create tables if they don't exist
    if "sqlite" in str(engine.url):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Initialized local SQLite database schema.")
