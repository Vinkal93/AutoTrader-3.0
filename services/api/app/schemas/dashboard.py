"""Dashboard overview and system event schemas."""

from typing import Any, Dict, List, Optional
from app.models.enums import (
    BrokerConnectionState,
    DataFreshness,
    EngineState,
    SystemEventSeverity,
    TradingMode,
)
from app.schemas.base import CamelModel


class SystemEvent(CamelModel):
    id: str
    severity: SystemEventSeverity
    category: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str


class DashboardTodaySummary(CamelModel):
    total_trades: int
    completed_trades: int
    winning_trades: int
    losing_trades: int
    total_pnl: str
    total_charges: str
    net_pnl: str


class DashboardAccountSummary(CamelModel):
    available_margin: str
    used_margin: str
    unrealized_pnl: str


class DashboardNiftySpot(CamelModel):
    last_price: float
    change: float
    change_percent: float
    freshness: DataFreshness


class DashboardActiveStrategy(CamelModel):
    id: str
    name: str
    status: str


class DashboardOverview(CamelModel):
    trading_mode: TradingMode
    engine_state: EngineState
    broker_connection: BrokerConnectionState
    today_summary: Optional[DashboardTodaySummary] = None
    account_summary: Optional[DashboardAccountSummary] = None
    nifty_spot: Optional[DashboardNiftySpot] = None
    active_strategy: Optional[DashboardActiveStrategy] = None
    recent_events: List[SystemEvent] = []
