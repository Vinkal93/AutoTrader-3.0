"""
Pydantic v2 schemas for Phase 8: System Monitoring, Watchdog, Incidents, and Recovery.
"""

from typing import Any, Dict, List, Literal, Optional
from app.schemas.base import CamelModel


class SystemIncident(CamelModel):
    id: str
    incident_type: str
    title: str
    severity: Literal["INFO", "WARNING", "CRITICAL"]
    status: Literal["ACTIVE", "ACKNOWLEDGED", "RESOLVED"]
    details: Optional[Dict[str, Any]] = None
    triggered_at: str
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None
    resolution_notes: Optional[str] = None


class NotificationChannelConfig(CamelModel):
    id: str
    channel_type: Literal["EMAIL", "WEBHOOK", "TELEGRAM", "SLACK"]
    name: str
    is_enabled: bool = True
    destination: str
    min_severity: Literal["INFO", "WARNING", "CRITICAL"] = "WARNING"
    rate_limit_per_minute: int = 10


class AlertDeliveryLog(CamelModel):
    id: str
    incident_id: str
    channel_type: str
    destination: str
    status: Literal["DELIVERED", "FAILED", "DEDUPLICATED", "RETRYING"]
    attempt_count: int = 1
    error_message: Optional[str] = None
    delivered_at: str


class UnprotectedPositionInfo(CamelModel):
    trading_symbol: str
    quantity: int
    option_type: Optional[str] = None
    opened_at: str


class WatchdogHealthStatus(CamelModel):
    is_healthy: bool
    worker_heartbeat_status: Literal["ACTIVE", "TIMEOUT", "UNKNOWN"]
    last_heartbeat_age_seconds: Optional[int] = None
    broker_session_status: Literal["VALID", "EXPIRED", "NOT_CONFIGURED"]
    market_feed_status: Literal["LIVE", "STALE", "DISCONNECTED"]
    market_feed_staleness_seconds: Optional[int] = None
    order_feed_status: Literal["CONNECTED", "DISCONNECTED"]
    static_ip_status: Literal["MATCHED", "MISMATCH", "UNVERIFIED"]
    current_static_ip: Optional[str] = None
    open_unprotected_positions_count: int = 0
    unprotected_positions: List[UnprotectedPositionInfo] = []
    active_incidents_count: int = 0
    safe_state_verified: bool = True
    recovery_mode_active: bool = False
    block_new_entries_reason: Optional[str] = None


class RecoveryReconciliationResult(CamelModel):
    is_safe_to_resume: bool
    open_positions_reconciled: int = 0
    unprotected_positions_count: int = 0
    orphaned_orders_detected: int = 0
    discrepancies: List[str] = []
    reconciled_at: str


class RecoveryActionRequest(CamelModel):
    action: Literal[
        "RUN_RECONCILIATION",
        "ACKNOWLEDGE_INCIDENT",
        "RESOLVE_INCIDENT",
        "ESCALATE_RISK_LOCK",
        "RESET_RECOVERY",
    ]
    incident_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    operator_notes: Optional[str] = None


class EmergencyRunbookStep(CamelModel):
    step_number: int
    title: str
    action_required: str
    tool_or_location: str
    caveat: Optional[str] = None
    critical_notice: Optional[str] = None
