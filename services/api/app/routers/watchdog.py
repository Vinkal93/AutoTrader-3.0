"""
Watchdog, System Incidents, Notifications, and Recovery API Routers.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import (
    AlertDeliveryLog as AlertDeliveryLogModel,
    NotificationChannel as NotificationChannelModel,
)
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.monitoring import (
    AlertDeliveryLog,
    EmergencyRunbookStep,
    NotificationChannelConfig,
    RecoveryActionRequest,
    RecoveryReconciliationResult,
    SystemIncident,
    WatchdogHealthStatus,
)
from app.services.auth_service import CurrentUser, get_current_user
from app.services.monitoring_service import MonitoringService

router = APIRouter(prefix="/api/v1", tags=["Watchdog & Recovery"])


@router.get("/watchdog/status", response_model=ApiResponse[WatchdogHealthStatus])
async def get_watchdog_status(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[WatchdogHealthStatus]:
    """Inspects real-time heartbeat, broker session, feed staleness, and safety locks."""
    health_status = await MonitoringService.inspect_system_health(db)
    return success_response(health_status, request=request, data_source="SYSTEM")


@router.post("/watchdog/check", response_model=ApiResponse[WatchdogHealthStatus])
async def trigger_watchdog_check(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[WatchdogHealthStatus]:
    """Forces an immediate watchdog diagnostic check across all subsystems."""
    health_status = await MonitoringService.inspect_system_health(db)
    return success_response(health_status, request=request, data_source="SYSTEM")


@router.get("/system/incidents", response_model=ApiResponse[List[SystemIncident]])
async def get_system_incidents(
    request: Request,
    status: Optional[str] = Query("ALL", description="Incident status: ALL, ACTIVE, ACKNOWLEDGED, RESOLVED"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[SystemIncident]]:
    """Retrieves persisted system incident history with severity and state."""
    incidents = await MonitoringService.get_all_incidents(db, status_filter=status)
    return success_response(incidents, request=request, data_source="DATABASE")


@router.post("/system/incidents/action")
async def execute_incident_action(
    request: Request,
    payload: RecoveryActionRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    """Executes an operator recovery or incident lifecycle transition."""
    result = await MonitoringService.perform_recovery_action(
        db=db,
        payload=payload,
        operator_email=user.email,
    )
    return success_response(result, request=request, data_source="DATABASE")


@router.get("/watchdog/runbook", response_model=ApiResponse[List[EmergencyRunbookStep]])
async def get_emergency_runbook(
    request: Request,
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[EmergencyRunbookStep]]:
    """Returns authoritative manual emergency response instructions."""
    steps = MonitoringService.get_emergency_runbook_steps()
    return success_response(steps, request=request, data_source="STATIC")


@router.get("/notifications/config", response_model=ApiResponse[List[NotificationChannelConfig]])
async def get_notification_channels(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[NotificationChannelConfig]]:
    """Retrieves configured alert notification channels (Email, Webhook, Telegram, Slack)."""
    stmt = select(NotificationChannelModel).order_by(desc(NotificationChannelModel.created_at))
    rows = (await db.execute(stmt)).scalars().all()

    if not rows:
        # Provide default system channels
        return success_response(
            [
                NotificationChannelConfig(
                    id="chan_default_email",
                    channel_type="EMAIL",
                    name="Operator Security Email",
                    is_enabled=True,
                    destination=user.email,
                    min_severity="CRITICAL",
                    rate_limit_per_minute=5,
                ),
                NotificationChannelConfig(
                    id="chan_default_webhook",
                    channel_type="WEBHOOK",
                    name="Incident Response Webhook",
                    is_enabled=False,
                    destination="https://hooks.slack.com/services/autotrader/alerts",
                    min_severity="WARNING",
                    rate_limit_per_minute=10,
                ),
            ],
            request=request,
            data_source="DATABASE",
        )

    channels = [
        NotificationChannelConfig(
            id=r.id,
            channel_type=r.channel_type,
            name=r.name,
            is_enabled=r.is_enabled,
            destination=r.destination,
            min_severity=r.min_severity,
            rate_limit_per_minute=r.rate_limit_per_minute,
        )
        for r in rows
    ]
    return success_response(channels, request=request, data_source="DATABASE")


@router.get("/notifications/deliveries", response_model=ApiResponse[List[AlertDeliveryLog]])
async def get_alert_deliveries(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[AlertDeliveryLog]]:
    """Retrieves recent alert delivery attempts, deduplication records, and retry statuses."""
    stmt = select(AlertDeliveryLogModel).order_by(desc(AlertDeliveryLogModel.delivered_at)).limit(limit)
    rows = (await db.execute(stmt)).scalars().all()

    deliveries = [
        AlertDeliveryLog(
            id=r.id,
            incident_id=r.incident_id,
            channel_type=r.channel_type,
            destination=r.destination,
            status=r.status,
            attempt_count=r.attempt_count,
            error_message=r.error_message,
            delivered_at=r.delivered_at.isoformat(),
        )
        for r in rows
    ]
    return success_response(deliveries, request=request, data_source="DATABASE")


@router.post("/recovery/reconcile", response_model=ApiResponse[RecoveryReconciliationResult])
async def trigger_recovery_reconciliation(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[RecoveryReconciliationResult]:
    """Runs broker position, orderbook, and tradebook reconciliation."""
    res = await MonitoringService.reconcile_positions_and_orders(db)
    return success_response(res["data"], request=request, data_source="BROKER_RECONCILED")
