"""Pydantic schemas for Phase 5 Execution Engine, Risk Controls and Reconciliation."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.enums import (
    EngineState,
    Exchange,
    OrderLifecycleState,
    OrderSide,
    OrderStatus,
    OrderType,
    TradingMode,
)
from app.schemas.base import CamelModel


class OrderSubmissionRequest(CamelModel):
    trading_symbol: str
    exchange: Exchange = Exchange.NFO
    side: OrderSide = OrderSide.BUY
    order_type: OrderType = OrderType.LIMIT
    quantity: int
    price: str
    trigger_price: Optional[str] = None
    trading_mode: TradingMode = TradingMode.PAPER
    idempotency_key: Optional[str] = None
    strategy_run_id: Optional[str] = None
    connection_id: Optional[str] = None
    broker_id: Optional[str] = None


class OrderSubmissionResult(CamelModel):
    order_id: str
    broker_order_id: Optional[str] = None
    lifecycle_state: OrderLifecycleState
    status: OrderStatus
    trading_symbol: str
    side: OrderSide
    quantity: int
    filled_quantity: int
    price: str
    average_filled_price: Optional[str] = None
    placed_at: str
    message: str


class OrderEventRecord(CamelModel):
    id: str
    order_id: str
    event_type: str
    timestamp: str
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    broker_order_id: Optional[str] = None
    requested_quantity: Optional[int] = None
    filled_quantity: Optional[int] = None
    raw_broker_response_code: Optional[str] = None
    failure_cause: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None


class OrderCancelRequest(CamelModel):
    order_id: str
    reason: Optional[str] = "Operator requested cancellation"


class OrderCancelResult(CamelModel):
    order_id: str
    broker_order_id: Optional[str] = None
    lifecycle_state: OrderLifecycleState
    cancelled_at: str
    message: str


class ReconciliationDiscrepancy(CamelModel):
    order_id: str
    broker_order_id: Optional[str] = None
    broker_status: str
    local_status: str
    action_taken: str


class ReconciliationReport(CamelModel):
    reconciled_at: str
    broker_orders_count: int
    db_orders_count: int
    discrepancies_count: int
    discrepancies: List[ReconciliationDiscrepancy] = Field(default_factory=list)
    engine_state: EngineState
    status: str  # 'CLEAN' | 'RESOLVED' | 'REQUIRES_MANUAL_INTERVENTION'


class LiveAuthorizationStatus(CamelModel):
    is_authorized: bool
    has_explicit_consent: bool
    is_broker_connected: bool
    is_static_ip_compliant: bool
    are_risk_settings_approved: bool
    blockers: List[str] = Field(default_factory=list)
    authorized_at: Optional[str] = None
    authorized_by: Optional[str] = None


class FailureModeItem(CamelModel):
    scenario_id: str
    category: str  # 'NETWORK' | 'BROKER_API' | 'EXECUTION' | 'INFRASTRUCTURE' | 'RISK'
    title: str
    trigger_condition: str
    automatic_action: str
    recovery_runbook: str
    unprotected_window_seconds: int
