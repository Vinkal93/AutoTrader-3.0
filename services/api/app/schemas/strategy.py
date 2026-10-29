"""Strategy configuration, validation, and CRUD schemas."""

from typing import List, Literal, Optional
from app.models.enums import InstrumentType, TradingMode
from app.schemas.base import CamelModel


class StrategyConfig(CamelModel):
    underlying: str = "NIFTY"
    instrument_type: InstrumentType = InstrumentType.OPTIONS
    entry_time_ist: str = "12:20"  # HH:mm format
    premium_min: str = "40.00"
    premium_max: str = "45.00"
    target_premium_move: str = "1.00"
    initial_stop_loss: str = "3.00"
    candle_interval: str = "5m"
    trend_indicators: List[str] = ["EMA_9", "EMA_21"]
    max_trades_per_day: int = 1
    lot_count: int = 1
    sideways_action: Literal["SKIP", "WAIT", "ENTER_CAUTIOUS"] = "SKIP"

    # Execution direction & broker account binding
    direction: Optional[Literal["AUTO", "CE", "PE"]] = "AUTO"
    connection_id: Optional[str] = None
    broker_account_id: Optional[str] = None

    # Risk limits — MUST be explicitly configured before LIVE trading is permitted
    max_risk_per_trade: Optional[str] = None
    max_daily_loss: Optional[str] = None
    min_trading_funds: Optional[str] = None
    max_bid_ask_spread: Optional[str] = None
    min_liquidity: Optional[int] = None
    entry_price_tolerance: Optional[str] = None
    max_data_age_seconds: Optional[int] = None
    max_order_wait_seconds: Optional[int] = None
    time_based_exit_ist: Optional[str] = "15:15"
    expiry_selection_policy: Optional[Literal["CURRENT_WEEK", "NEXT_WEEK", "CURRENT_MONTH"]] = "CURRENT_WEEK"
    market_holiday_behavior: Optional[Literal["SKIP", "ALERT"]] = "SKIP"
    automated_recovery_policy: Optional[Literal["PAUSE", "RETRY_ONCE", "STOP"]] = "PAUSE"


class Strategy(CamelModel):
    id: str
    name: str
    description: Optional[str] = None
    version: int
    current_version: Optional[int] = None
    is_active: bool
    trading_mode: TradingMode
    config: StrategyConfig
    user_id: Optional[str] = None
    connection_id: Optional[str] = None
    broker_account_id: Optional[str] = None
    created_at: str
    updated_at: str


class StrategyCreateRequest(CamelModel):
    name: str
    description: Optional[str] = None
    trading_mode: Optional[TradingMode] = TradingMode.PAPER
    config: StrategyConfig
    connection_id: Optional[str] = None


class StrategyUpdateRequest(CamelModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    trading_mode: Optional[TradingMode] = None
    config: Optional[StrategyConfig] = None
    change_reason: Optional[str] = None


StrategyControlAction = Literal["PAUSE", "RESUME", "DISABLE_ENTRIES", "EMERGENCY_HALT"]


class StrategyControlRequest(CamelModel):
    action: StrategyControlAction
    reason: Optional[str] = None


class StrategyControlResponse(CamelModel):
    strategy_id: str
    status: str
    is_active: bool
    trading_mode: TradingMode
    action_applied: StrategyControlAction
    applied_at: str
    message: str


class WorkerStatusResponse(CamelModel):
    worker_id: str
    is_leader: bool
    engine_state: str
    trading_mode: str
    uptime_seconds: int
    last_heartbeat: str
    active_strategies_count: int
    scheduled_evaluations_count: int
    is_market_open: bool
    is_holiday: bool
    holiday_name: Optional[str] = None


class StrategyValidationError(CamelModel):
    field: str
    message: str
    code: str


class StrategyValidationWarning(CamelModel):
    field: str
    message: str


class LiveReadiness(CamelModel):
    ready: bool
    missing_required_fields: List[str]


class StrategyValidationResult(CamelModel):
    is_valid: bool
    errors: List[StrategyValidationError]
    warnings: List[StrategyValidationWarning]
    live_readiness: LiveReadiness
