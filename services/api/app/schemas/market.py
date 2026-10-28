"""Market data schemas: quotes, historical candles, and option chain."""

from typing import List, Optional
from app.models.enums import DataFreshness
from app.schemas.base import CamelModel


class NiftyQuote(CamelModel):
    last_price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    close: float
    volume: int
    timestamp: str
    freshness: DataFreshness


class Candle(CamelModel):
    timestamp: str  # ISO 8601
    open: float
    high: float
    low: float
    close: float
    volume: int


class CandlesResponse(CamelModel):
    symbol: str
    interval: str
    candles: List[Candle]
    as_of: str


class OptionGreeks(CamelModel):
    instrument_token: str
    trading_symbol: str
    last_price: float
    change: float
    change_percent: float
    volume: int
    open_interest: int
    bid_price: float
    bid_quantity: int
    ask_price: float
    ask_quantity: int
    implied_volatility: Optional[float] = None
    delta: Optional[float] = None
    gamma: Optional[float] = None
    theta: Optional[float] = None
    vega: Optional[float] = None


class OptionChainEntry(CamelModel):
    strike_price: float
    expiry_date: str
    ce: Optional[OptionGreeks] = None
    pe: Optional[OptionGreeks] = None


class OptionChainResponse(CamelModel):
    underlying: str
    spot_price: float
    expiry_date: str
    entries: List[OptionChainEntry]
    as_of: str
    freshness: DataFreshness
