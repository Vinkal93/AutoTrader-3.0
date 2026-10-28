"""Account, Position, Order, and Trade schemas."""

from typing import Optional
from app.models.enums import (
    DataFreshness,
    Exchange,
    InstrumentType,
    OptionType,
    OrderSide,
    OrderStatus,
    OrderType,
)
from app.schemas.base import CamelModel


class AccountFundsResponse(CamelModel):
    available_cash: str  # Decimal string for precision
    used_margin: str
    available_margin: str
    total_collateral: str
    unrealized_pnl: str
    realized_pnl_today: str
    as_of: str
    freshness: DataFreshness


class Position(CamelModel):
    id: str
    instrument_token: str
    trading_symbol: str
    exchange: Exchange
    instrument_type: InstrumentType
    option_type: Optional[OptionType] = None
    strike_price: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: int
    average_price: str
    last_price: str
    pnl: str
    pnl_percentage: str
    day_pnl: str
    side: OrderSide
    product: str


class Order(CamelModel):
    id: str
    broker_order_id: Optional[str] = None
    trading_symbol: str
    exchange: Exchange
    side: OrderSide
    order_type: OrderType
    quantity: int
    filled_quantity: int
    price: str
    trigger_price: Optional[str] = None
    average_filled_price: Optional[str] = None
    status: OrderStatus
    status_message: Optional[str] = None
    placed_at: str
    updated_at: str
    strategy_run_id: Optional[str] = None
    trade_cycle_id: Optional[str] = None
    idempotency_key: str


class Trade(CamelModel):
    id: str
    order_id: str
    broker_trade_id: str
    trading_symbol: str
    exchange: Exchange
    side: OrderSide
    quantity: int
    price: str
    trade_time: str
