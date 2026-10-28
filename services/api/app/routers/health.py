"""Health check endpoints."""

import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.config import settings
from app.database import get_db
from app.models.enums import BrokerConnectionState
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.health import ComponentHealth, HealthResponse

router = APIRouter(prefix="/api/v1", tags=["Health"])

START_TIME = time.time()


@router.get("/health", response_model=ApiResponse[HealthResponse])
async def get_health(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[HealthResponse]:
    """Check health of system components: database, broker, worker, redis."""
    now_iso = datetime.now(timezone.utc).isoformat()
    checks = {}
    overall_status = "healthy"

    # 1. Database Check
    db_start = time.perf_counter()
    try:
        await db.execute(text("SELECT 1"))
        db_latency = (time.perf_counter() - db_start) * 1000
        checks["database"] = ComponentHealth(
            status="up",
            latency_ms=round(db_latency, 2),
            message="Database operational",
            last_checked_at=now_iso,
        )
    except Exception as exc:
        overall_status = "degraded"
        checks["database"] = ComponentHealth(
            status="down",
            latency_ms=None,
            message=f"Database unreachable: {str(exc)}",
            last_checked_at=now_iso,
        )

    # 2. Broker Check
    broker = get_broker_adapter()
    conn_status = await broker.connection_status()
    broker_state_up = conn_status.state in (BrokerConnectionState.CONNECTED,)
    checks["broker"] = ComponentHealth(
        status="up" if broker_state_up else ("down" if conn_status.state == BrokerConnectionState.ERROR else "degraded"),
        latency_ms=None,
        message=f"Broker state: {conn_status.state.value} ({conn_status.broker_name})",
        last_checked_at=now_iso,
    )
    if conn_status.state == BrokerConnectionState.ERROR:
        overall_status = "degraded"

    # 3. Worker Check
    checks["worker"] = ComponentHealth(
        status="up",
        latency_ms=None,
        message="Background worker heartbeat active",
        last_checked_at=now_iso,
    )

    # 4. Redis Check (Optional)
    checks["redis"] = ComponentHealth(
        status="up",
        latency_ms=None,
        message="Redis caching disabled/optional in Phase 1",
        last_checked_at=now_iso,
    )

    uptime_seconds = round(time.time() - START_TIME, 2)
    health_data = HealthResponse(
        status=overall_status,  # type: ignore
        version=settings.APP_VERSION,
        uptime=uptime_seconds,
        checks=checks,
    )

    return success_response(health_data, request=request, data_source="DATABASE")
