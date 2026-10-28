"""System status, mode switcher, and system event auditing routers."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import SystemEvent as SystemEventModel
from app.models.enums import SystemEventSeverity, TradingMode
from app.routers.deps import paginated_response, success_response
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.dashboard import SystemEvent
from app.schemas.execution_engine import FailureModeItem, LiveAuthorizationStatus
from app.schemas.health import ModeSwitchRequest, SystemStatusResponse
from app.services.auth_service import CurrentUser, get_current_user
from app.services.execution_engine import (
    ExecutionEngine,
    LIVE_AUTHORIZATION_REGISTRY,
)
from app.services.state_service import StateService

router = APIRouter(prefix="/api/v1/system", tags=["System"])


@router.get("/status", response_model=ApiResponse[SystemStatusResponse])
async def get_system_status(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[SystemStatusResponse]:
    """Retrieve full system status, engine state, broker connection, and market hours."""
    status_data = await StateService.get_system_status(db=db)
    return success_response(status_data, request=request, data_source="DATABASE")


@router.post("/mode", response_model=ApiResponse[SystemStatusResponse])
async def switch_trading_mode(
    request: Request,
    payload: ModeSwitchRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[SystemStatusResponse]:
    """Switch trading mode (OFF, PAPER, LIVE). Blocked if risk limits or broker requirements unmet."""
    try:
        await StateService.set_mode(
            new_mode=payload.mode,
            reason=f"{payload.reason} (by {user.email})",
            db=db,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    updated_status = await StateService.get_system_status(db=db)
    return success_response(updated_status, request=request, data_source="DATABASE")


@router.post("/engine-state", response_model=ApiResponse[SystemStatusResponse])
async def transition_engine_state(
    request: Request,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[SystemStatusResponse]:
    """Transition engine state (e.g. PAUSED, RUNNING, READY, STOPPED)."""
    raw_state = payload.get("state")
    reason = payload.get("reason", f"Manual transition by {user.email}")

    try:
        from app.models.enums import EngineState
        new_state = EngineState(raw_state)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid engine state: '{raw_state}'",
        )

    await StateService.transition_engine_state(
        new_state=new_state,
        reason=reason,
        db=db,
    )

    updated_status = await StateService.get_system_status(db=db)
    return success_response(updated_status, request=request, data_source="DATABASE")


@router.get("/events", response_model=PaginatedResponse[SystemEvent])
async def get_system_events(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    severity: Optional[SystemEventSeverity] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> PaginatedResponse[SystemEvent]:
    """Fetch paginated audit log of system events."""
    base_query = select(SystemEventModel)
    count_query = select(func.count(SystemEventModel.id))

    if severity:
        base_query = base_query.where(SystemEventModel.severity == severity.value)
        count_query = count_query.where(SystemEventModel.severity == severity.value)
    if category:
        base_query = base_query.where(SystemEventModel.category == category)
        count_query = count_query.where(SystemEventModel.category == category)

    total_items = (await db.execute(count_query)).scalar() or 0

    offset = (page - 1) * page_size
    stmt = base_query.order_by(desc(SystemEventModel.timestamp)).offset(offset).limit(page_size)
    events_raw = (await db.execute(stmt)).scalars().all()

    items = [
        SystemEvent(
            id=e.id,
            severity=SystemEventSeverity(e.severity),
            category=e.category,
            message=e.message,
            details=e.details_json,
            timestamp=e.timestamp.isoformat(),
        )
        for e in events_raw
    ]

    return paginated_response(
        items=items,
        total_items=total_items,
        page=page,
        page_size=page_size,
        request=request,
        data_source="DATABASE",
    )


@router.get("/failure-modes", response_model=ApiResponse[List[FailureModeItem]])
async def get_failure_modes(
    request: Request,
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[FailureModeItem]]:
    """Returns complete catalog of 18 analyzed failure modes and recovery procedures."""
    items = ExecutionEngine.get_failure_modes_catalog()
    return success_response(items, request=request, data_source="STATIC")


@router.get("/live-authorization", response_model=ApiResponse[LiveAuthorizationStatus])
async def get_live_authorization_status(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[LiveAuthorizationStatus]:
    """Inspects live readiness and explicit consent status."""
    engine = ExecutionEngine()
    status_obj = await engine.get_live_authorization_status(db=db)
    return success_response(status_obj, request=request, data_source="SYSTEM")


@router.post("/live-authorization", response_model=ApiResponse[LiveAuthorizationStatus])
async def grant_live_authorization(
    request: Request,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[LiveAuthorizationStatus]:
    """
    Submits explicit operator consent token for LIVE trading mode.
    Requires matching secret token and compliant preconditions.
    """
    token = payload.get("consentToken", "")
    expected = LIVE_AUTHORIZATION_REGISTRY["requiredSecret"]

    from datetime import datetime, timezone

    if token != expected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid consent token. Explicit confirmation token '{expected}' is required.",
        )

    LIVE_AUTHORIZATION_REGISTRY["hasExplicitConsent"] = True
    LIVE_AUTHORIZATION_REGISTRY["authorizedAt"] = datetime.now(timezone.utc).isoformat()
    LIVE_AUTHORIZATION_REGISTRY["authorizedBy"] = user.email

    engine = ExecutionEngine()
    status_obj = await engine.get_live_authorization_status(db=db)
    if not status_obj.blockers:
        LIVE_AUTHORIZATION_REGISTRY["isAuthorized"] = True
        status_obj.is_authorized = True

    return success_response(status_obj, request=request, data_source="SYSTEM")
