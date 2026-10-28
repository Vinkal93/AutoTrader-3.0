"""Pydantic schemas for Strategy Engine, version history, execution runs, scheduling and backtesting."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.enums import TradingMode
from app.schemas.market_scanner import ScannerCandidate
from app.schemas.strategy import StrategyConfig


class StrategyVersionRecord(BaseModel):
    id: str
    strategyId: str = Field(..., alias="strategy_id")
    versionNumber: int = Field(..., alias="version_number")
    config: StrategyConfig
    createdBy: Optional[str] = Field(None, alias="created_by")
    changeReason: Optional[str] = Field(None, alias="change_reason")
    createdAt: str = Field(..., alias="created_at")

    class Config:
        populate_by_name = True
        from_attributes = True


class StrategyRunRecord(BaseModel):
    id: str
    strategyId: str = Field(..., alias="strategy_id")
    strategyVersionId: Optional[str] = Field(None, alias="strategy_version_id")
    versionNumber: int = Field(1, alias="version_number")
    tradeDate: str = Field(..., alias="trade_date")
    tradingMode: TradingMode = Field(..., alias="trading_mode")
    decision: str  # 'ENTER_CE' | 'ENTER_PE' | 'NO_TRADE_SIDEWAYS' | 'NO_TRADE_NO_CONTRACT' | etc.
    reason: str
    selectedContract: Optional[ScannerCandidate] = Field(None, alias="selected_contract")
    ema9: Optional[float] = None
    ema21: Optional[float] = None
    emaSpread: Optional[float] = Field(None, alias="ema_spread")
    spotPrice: Optional[float] = Field(None, alias="spot_price")
    evaluatedAt: str = Field(..., alias="evaluated_at")

    class Config:
        populate_by_name = True
        from_attributes = True


class StrategyScheduleStatus(BaseModel):
    strategyId: str = Field(..., alias="strategy_id")
    strategyName: str = Field(..., alias="strategy_name")
    scheduledTimeIST: str = Field("12:20", alias="scheduled_time_ist")
    nextRunIST: str = Field(..., alias="next_run_ist")
    nextRunTimestamp: str = Field(..., alias="next_run_timestamp")
    isMarketOpen: bool = Field(..., alias="is_market_open")
    isTradingDay: bool = Field(..., alias="is_trading_day")
    isHoliday: bool = Field(..., alias="is_holiday")
    holidayName: Optional[str] = Field(None, alias="holiday_name")
    alreadyRunToday: bool = Field(False, alias="already_run_today")
    timeRemainingSeconds: int = Field(0, alias="time_remaining_seconds")
    serverTimeIST: str = Field(..., alias="server_time_ist")

    class Config:
        populate_by_name = True
        from_attributes = True


class BacktestSignalLog(BaseModel):
    date: str
    timeIST: str = Field(..., alias="time_ist")
    signal: str  # 'BUY_CE' | 'BUY_PE' | 'SKIP_SIDEWAYS' | 'NO_SIGNAL'
    reason: str
    spotPrice: float = Field(..., alias="spot_price")
    ema9: float
    ema21: float
    candleClose: float = Field(..., alias="candle_close")

    class Config:
        populate_by_name = True


class BacktestRequest(BaseModel):
    symbol: str = "NIFTY"
    interval: str = "5m"
    fromDate: Optional[str] = Field(None, alias="from_date")
    toDate: Optional[str] = Field(None, alias="to_date")
    config: Optional[StrategyConfig] = None

    class Config:
        populate_by_name = True


class BacktestResult(BaseModel):
    totalCandles: int = Field(..., alias="total_candles")
    totalDays: int = Field(..., alias="total_days")
    evaluatedDays: int = Field(..., alias="evaluated_days")
    tradeSignals: int = Field(..., alias="trade_signals")
    ceSignals: int = Field(..., alias="ce_signals")
    peSignals: int = Field(..., alias="pe_signals")
    skippedDays: int = Field(..., alias="skipped_days")
    winRateEstimate: float = Field(0.0, alias="win_rate_estimate")
    totalEstimatedGrossPnl: float = Field(0.0, alias="total_estimated_gross_pnl")
    totalEstimatedNetPnl: float = Field(0.0, alias="total_estimated_net_pnl")
    signalLog: List[BacktestSignalLog] = Field(default_factory=list, alias="signal_log")

    class Config:
        populate_by_name = True
