"""Health and system status schemas mirroring TypeScript contracts."""

from typing import Dict, Literal, Optional
from app.models.enums import BrokerConnectionState, EngineState, TradingMode
from app.schemas.base import CamelModel


class ComponentHealth(CamelModel):
    status: Literal["up", "down", "degraded"]
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    last_checked_at: str


class HealthResponse(CamelModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    uptime: float  # seconds
    checks: Dict[str, ComponentHealth]


class LastStateChange(CamelModel):
    state: EngineState
    reason: str
    timestamp: str


class SystemStatusResponse(CamelModel):
    trading_mode: TradingMode
    engine_state: EngineState
    broker_connection: BrokerConnectionState
    active_strategy_id: Optional[str] = None
    worker_heartbeat: Optional[str] = None  # ISO 8601 UTC
    market_status: Literal["PRE_OPEN", "OPEN", "CLOSED", "HOLIDAY", "UNKNOWN"]
    last_state_change: LastStateChange


class ModeSwitchRequest(CamelModel):
    mode: TradingMode
    reason: Optional[str] = "Manual mode change"
