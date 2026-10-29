"""Pydantic schemas for Super Admin and SaaS Management (Codex Phase 8)."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from app.models.enums import EngineState
from app.schemas.base import CamelModel


class WorkerQueueHealth(CamelModel):
    worker_id: str
    is_leader: bool
    state: str
    uptime_seconds: int
    last_heartbeat: str


class TradingFeatureAvailability(CamelModel):
    paper_trading_enabled: bool = True
    live_trading_enabled: bool = False
    global_trading_halted: bool = False


class AdminDashboardMetrics(CamelModel):
    total_registered_users: int
    active_users_24h: int
    total_broker_connections: int
    active_broker_connections: int
    broker_connections_by_provider: Dict[str, int]
    connection_failures_24h: int
    active_subscriptions: int
    total_revenue_inr: str
    monthly_recurring_revenue_inr: str
    system_errors_24h: int
    worker_queue_health: WorkerQueueHealth
    trading_feature_availability: TradingFeatureAvailability
    open_incidents_count: int
    timestamp: str


class AdminUserListItem(CamelModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    email_verified: bool
    kyc_status: str
    plan_name: str
    subscription_status: str
    broker_connections_count: int
    connected_brokers: List[str]
    created_at: str
    last_login_at: Optional[str] = None


class AdminUserAuditItem(CamelModel):
    id: str
    action: str
    performed_by: str
    reason: Optional[str] = None
    timestamp: str


class AdminUserDetail(AdminUserListItem):
    phone_masked: Optional[str] = None
    pan_masked: Optional[str] = None
    feature_overrides: Optional[Dict[str, bool]] = None
    recent_orders_count: int = 0
    active_positions_count: int = 0
    audit_trail: List[AdminUserAuditItem] = []


class AdminUserStatusUpdate(CamelModel):
    is_active: bool
    role: Optional[str] = None
    reason: str


class EnvironmentEndpoints(CamelModel):
    auth_url: str
    api_base_url: str
    ws_url: Optional[str] = None


class RateLimits(CamelModel):
    orders_per_second: int = 5
    quotes_per_minute: int = 60


class AdminBrokerConfig(CamelModel):
    id: str
    name: str
    provider_code: str
    auth_method: str
    is_enabled: bool
    is_maintenance_mode: bool
    is_partner_approved: bool
    supports_live_orders: bool
    supports_websockets: bool
    environment_endpoints: EnvironmentEndpoints
    rate_limits: RateLimits
    active_connections_count: int
    last_health_check: str
    health_status: Literal["HEALTHY", "DEGRADED", "OUTAGE"]


class RateLimitsUpdate(CamelModel):
    orders_per_second: Optional[int] = None
    quotes_per_minute: Optional[int] = None


class AdminBrokerUpdateRequest(CamelModel):
    is_enabled: Optional[bool] = None
    is_maintenance_mode: Optional[bool] = None
    is_partner_approved: Optional[bool] = None
    supports_live_orders: Optional[bool] = None
    rate_limits: Optional[RateLimitsUpdate] = None
    reason: str


class AdminPlan(CamelModel):
    id: str
    name: str
    description: str
    billing_interval: Literal["MONTHLY", "ANNUAL"] = "MONTHLY"
    price_inr: str
    is_active: bool
    max_broker_connections: int
    max_active_strategies: int
    live_trading_enabled: bool
    historical_retention_days: int
    reporting_access: bool
    webhook_alerts_enabled: bool
    subscribers_count: int


class AdminPlanCreateUpdate(CamelModel):
    name: str
    description: str
    price_inr: str
    billing_interval: Literal["MONTHLY", "ANNUAL"] = "MONTHLY"
    is_active: Optional[bool] = True
    max_broker_connections: int
    max_active_strategies: int
    live_trading_enabled: bool = False
    historical_retention_days: int = 30
    reporting_access: bool = True
    webhook_alerts_enabled: bool = False


class AdminInvoice(CamelModel):
    id: str
    user_id: str
    user_email: str
    plan_id: str
    plan_name: str
    amount_inr: str
    status: Literal["PAID", "PENDING", "FAILED", "REFUNDED"]
    payment_provider: Literal["RAZORPAY", "STRIPE"]
    payment_id: Optional[str] = None
    invoice_number: str
    billing_period_start: str
    billing_period_end: str
    created_at: str


class PaymentWebhookPayload(CamelModel):
    event_id: str
    provider: Literal["RAZORPAY", "STRIPE"] = "RAZORPAY"
    event_type: str
    signature: str
    payload: Dict[str, Any]


class PaymentWebhookResult(CamelModel):
    processed: bool
    event_id: str
    status: str
    invoice_id: Optional[str] = None
    subscription_id: Optional[str] = None
    message: str


class AdminFeatureFlag(CamelModel):
    key: str
    description: str
    is_globally_enabled: bool
    enabled_user_ids_count: int
    updated_at: str


class AdminAuditLog(CamelModel):
    id: str
    actor_user_id: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    entity_name: str
    entity_id: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    timestamp: str


class PlatformEmergencyControlRequest(CamelModel):
    action: Literal["HALT_ALL_TRADING", "DISABLE_NEW_ENTRIES", "RESUME_NORMAL_TRADING"]
    reason: str
    require_audit_confirmation: bool


class PlatformEmergencyControlResponse(CamelModel):
    action: str
    global_trading_halted: bool
    new_entries_disabled: bool
    applied_by: str
    applied_at: str
    affected_brokers_count: int
    message: str
