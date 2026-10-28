"""FastAPI main application entry point."""

import logging
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.broker.factory import get_broker_adapter
from app.config import settings
from app.database import async_session_factory, init_db
from app.routers import all_routers
from app.routers.deps import build_meta
from app.schemas.common import ApiError, ApiResponse
from app.services.strategy_service import StrategyService

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("autotrader.api")


class RequestIdAndSecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds X-Request-ID and security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        request.state.request_id = req_id

        response: Response = await call_next(request)

        # Attach request ID header
        response.headers["X-Request-ID"] = req_id

        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup initialization and shutdown cleanup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.APP_ENV})")

    # 1. Initialize DB / tables
    try:
        await init_db()
    except Exception as exc:
        logger.warning(f"Database initialization warning: {exc}")

    # 2. Seed default strategy if empty
    try:
        async with async_session_factory() as session:
            await StrategyService.seed_default_strategy_if_empty(session)
    except Exception as exc:
        logger.warning(f"Strategy seed check warning: {exc}")

    yield

    # Shutdown: cleanly disconnect broker
    logger.info("Shutting down API. Terminating broker sessions...")
    try:
        broker = get_broker_adapter()
        await broker.disconnect()
    except Exception as exc:
        logger.warning(f"Error during broker shutdown: {exc}")
    logger.info("API shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade API backend for NIFTY Auto Trader 3.0",
    docs_url="/docs" if settings.is_debug else None,
    redoc_url="/redoc" if settings.is_debug else None,
    lifespan=lifespan,
)

# CORS Middleware
origins = settings.API_CORS_ORIGINS if settings.API_CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Security Headers Middleware
app.add_middleware(RequestIdAndSecurityHeadersMiddleware)

# Mount all domain routers
for router in all_routers:
    app.include_router(router)


# Global Exception Handlers conforming to ApiResponse envelope
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    meta = build_meta(request=request, data_source="DATABASE")
    error = ApiError(
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
        details=None,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse[None](
            success=False,
            data=None,
            error=error,
            meta=meta,
        ).model_dump(by_alias=True),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    meta = build_meta(request=request, data_source="DATABASE")
    error = ApiError(
        code="VALIDATION_ERROR",
        message="Request payload validation failed",
        details={"errors": exc.errors()},
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ApiResponse[None](
            success=False,
            data=None,
            error=error,
            meta=meta,
        ).model_dump(by_alias=True),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    meta = build_meta(request=request, data_source="DATABASE")
    error = ApiError(
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected server error occurred." if not settings.is_debug else str(exc),
        details={"exception": type(exc).__name__} if settings.is_debug else None,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ApiResponse[None](
            success=False,
            data=None,
            error=error,
            meta=meta,
        ).model_dump(by_alias=True),
    )
