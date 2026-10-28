"""Analytics, Trade Cycle, and Risk schemas mirroring TypeScript contracts."""

from decimal import Decimal
from typing import List, Literal, Optional
from app.models.enums import OptionType, TradeCycleState, TradingMode
from app.schemas.base import CamelModel


class ChargeBreakdown(CamelModel):
    brokerage: str = "0.00"
    stt: str = "0.00"
    exchange_txn_charge: str = "0.00"
    gst: str = "0.00"
    sebi_charges: str = "0.00"
    stamp_duty: str = "0.00"
    total_charges: str = "0.00"
    is_posted: bool = False


class TradeCycleDetail(CamelModel):
    id: str
    strategy_run_id: str
    trading_mode: TradingMode
    state: TradeCycleState
    trading_symbol: str
    option_type: Optional[OptionType] = None
    strike_price: Optional[str] = None
    expiry_date: Optional[str] = None
    buy_quantity: int = 0
    buy_average_price: str = "0.00"
    sell_average_price: str = "0.00"
    gross_pnl: str = "0.00"
    net_pnl: str = "0.00"
    charges: ChargeBreakdown
    charges_status: Literal["ACTUAL", "ESTIMATED", "UNAVAILABLE"] = "UNAVAILABLE"
    duration_seconds: Optional[int] = None
    exit_reason: Optional[str] = None
    entry_order_id: Optional[str] = None
    exit_order_id: Optional[str] = None
    broker_order_ref: Optional[str] = None
    reconciliation_status: Literal["RECONCILED", "PENDING", "MISMATCH", "PARTIAL"] = "PENDING"
    started_at: str
    closed_at: Optional[str] = None


class DailyPnlEntry(CamelModel):
    date: str
    gross_pnl: float
    net_pnl: float
    trades_count: int


class EquityPoint(CamelModel):
    timestamp: str
    equity: float


class PerformanceMetrics(CamelModel):
    timeframe: Literal["TODAY", "7D", "30D", "ALL"]
    total_trades: int
    closed_trades: int
    winning_trades: int
    losing_trades: int
    breakeven_trades: int
    win_rate: float
    gross_pnl: str
    net_pnl: str
    total_charges: str
    charges_status: Literal["ACTUAL", "ESTIMATED", "UNAVAILABLE"]
    max_drawdown: Optional[str] = None
    max_drawdown_percent: Optional[str] = None
    profit_factor: Optional[float] = None
    daily_pnl_series: List[DailyPnlEntry] = []
    equity_curve: List[EquityPoint] = []


class RiskAllowance(CamelModel):
    daily_loss_limit: Optional[str] = None
    realized_loss_today: str = "0.00"
    open_exposure: str = "0.00"
    remaining_daily_allowance: Optional[str] = None
    max_risk_per_trade: Optional[str] = None
    is_risk_locked: bool = False
    lockout_reason: Optional[str] = None


class EngineStateTransitionRequest(CamelModel):
    state: str
    reason: Optional[str] = "Manual state transition"
