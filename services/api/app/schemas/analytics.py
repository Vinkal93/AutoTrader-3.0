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
    timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"]
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


class OptionTypePerformance(CamelModel):
    option_type: Literal["CE", "PE"]
    trades_count: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    breakeven_trades: int = 0
    win_rate: float = 0.0
    gross_pnl: str = "0.00"
    net_pnl: str = "0.00"
    profit_factor: Optional[float] = None
    average_pnl: Optional[str] = None


class StrategyVersionPerformance(CamelModel):
    version_number: int
    strategy_id: str
    strategy_name: str
    trades_count: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate: float = 0.0
    gross_pnl: str = "0.00"
    net_pnl: str = "0.00"
    profit_factor: Optional[float] = None
    max_drawdown: Optional[str] = None


class HoldingTimeAnalysis(CamelModel):
    average_holding_time_seconds: Optional[int] = None
    average_winning_holding_time_seconds: Optional[int] = None
    average_losing_holding_time_seconds: Optional[int] = None
    min_holding_time_seconds: Optional[int] = None
    max_holding_time_seconds: Optional[int] = None
    total_trades_sampled: int = 0


class HeatmapDayEntry(CamelModel):
    date: str
    gross_pnl: float = 0.0
    net_pnl: float = 0.0
    trades_count: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    status: Literal["PROFIT", "LOSS", "BREAKEVEN", "NO_TRADE"] = "NO_TRADE"


class SlippageAnalysis(CamelModel):
    available: bool = False
    average_entry_slippage_points: Optional[float] = None
    average_exit_slippage_points: Optional[float] = None
    total_slippage_cost: Optional[str] = None
    positive_slippage_trades: int = 0
    negative_slippage_trades: int = 0
    zero_slippage_trades: int = 0
    sample_count: int = 0


class TradeDrilldown(CamelModel):
    id: str
    strategy_run_id: Optional[str] = None
    trading_symbol: str
    option_type: Optional[Literal["CE", "PE"]] = None
    trading_mode: str
    quantity: int = 0
    entry_price: str = "0.00"
    exit_price: str = "0.00"
    entry_filled_price: Optional[str] = None
    exit_filled_price: Optional[str] = None
    entry_slippage_points: Optional[float] = None
    exit_slippage_points: Optional[float] = None
    holding_time_seconds: Optional[int] = None
    gross_pnl: str = "0.00"
    charges: str = "0.00"
    net_pnl: str = "0.00"
    started_at: str
    closed_at: Optional[str] = None
    exit_reason: Optional[str] = None


class ComprehensiveAnalytics(PerformanceMetrics):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    loss_rate: float = 0.0
    average_win: Optional[str] = None
    average_loss: Optional[str] = None
    largest_win: Optional[str] = None
    largest_loss: Optional[str] = None
    payoff_ratio: Optional[float] = None
    expectancy: Optional[str] = None
    expectancy_ratio: Optional[float] = None
    peak_equity: Optional[str] = None
    trough_equity: Optional[str] = None
    ce_performance: OptionTypePerformance
    pe_performance: OptionTypePerformance
    strategy_versions: List[StrategyVersionPerformance] = []
    holding_time: HoldingTimeAnalysis
    calendar_heatmap: List[HeatmapDayEntry] = []
    slippage: SlippageAnalysis
    drilldowns: List[TradeDrilldown] = []
    sample_size_warning: Optional[str] = None


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
