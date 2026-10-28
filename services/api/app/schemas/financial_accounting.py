"""Pydantic schemas for Phase 6 Financial Accounting, Contract Notes, and Tariffs."""

from typing import List, Optional
from pydantic import Field
from app.models.enums import OptionType, OrderSide, TradeCycleState, TradingMode
from app.schemas.base import CamelModel


class ContractNoteEntry(CamelModel):
    trade_id: Optional[str] = None
    order_id: Optional[str] = None
    trading_symbol: str
    side: OrderSide
    quantity: int
    price: str
    brokerage: str
    stt: str
    exchange_turnover: str
    gst: str
    sebi_charges: str
    stamp_duty: str


class ContractNoteImportRequest(CamelModel):
    contract_note_number: str
    trade_date: str  # YYYY-MM-DD
    settlement_number: Optional[str] = None
    entries: List[ContractNoteEntry] = Field(default_factory=list)


class ContractNoteDiscrepancy(CamelModel):
    cycle_id: str
    trading_symbol: str
    estimated_fee: str
    confirmed_fee: str
    difference: str
    reason: str


class ContractNoteImportResult(CamelModel):
    contract_note_number: str
    trade_date: str
    imported_count: int
    reconciled_cycles_count: int
    discrepancies_count: int
    discrepancies: List[ContractNoteDiscrepancy] = Field(default_factory=list)
    total_confirmed_charges: str
    imported_at: str


class AccountSnapshotRecord(CamelModel):
    id: str
    available_cash: str
    used_margin: str
    available_margin: str
    total_collateral: str
    unrealized_pnl: str
    realized_pnl: str
    timestamp: str


class FeeScheduleVersion(CamelModel):
    version: str
    effective_from: str
    brokerage_per_order: str
    stt_rate_options_sell: str
    exchange_txn_rate: str
    gst_rate: str
    sebi_rate_per_crore: str
    stamp_duty_rate: str
    description: str


class TradeCycleFilterParams(CamelModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    symbol: Optional[str] = None
    option_type: Optional[OptionType] = None
    status: Optional[TradeCycleState] = None
    strategy_id: Optional[str] = None
    mode: Optional[TradingMode] = None
