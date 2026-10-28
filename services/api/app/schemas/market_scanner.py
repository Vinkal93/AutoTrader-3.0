"""Pydantic schemas for Market Scanner, Trend Analysis and Order Pre-flight Validation.
Mirroring packages/api-contracts/src/index.ts.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import MarketTrendState, OptionType, OrderSide
from app.schemas.analytics import ChargeBreakdown


class ScannerCandidate(BaseModel):
    instrumentToken: str = Field(..., alias="instrument_token")
    tradingSymbol: str = Field(..., alias="trading_symbol")
    optionType: OptionType = Field(..., alias="option_type")
    strikePrice: float = Field(..., alias="strike_price")
    expiryDate: str = Field(..., alias="expiry_date")
    ltp: float
    bidPrice: float = Field(..., alias="bid_price")
    askPrice: float = Field(..., alias="ask_price")
    bidAskSpread: float = Field(..., alias="bid_ask_spread")
    bidQuantity: int = Field(..., alias="bid_quantity")
    askQuantity: int = Field(..., alias="ask_quantity")
    volume: int
    openInterest: int = Field(..., alias="open_interest")
    lotSize: int = Field(25, alias="lot_size")
    tickSize: float = Field(0.05, alias="tick_size")
    isEligible: bool = Field(..., alias="is_eligible")
    rejectionReasons: List[str] = Field(default_factory=list, alias="rejection_reasons")
    rankScore: float = Field(0.0, alias="rank_score")
    selectionExplanation: str = Field("", alias="selection_explanation")

    class Config:
        populate_by_name = True
        from_attributes = True


class ScannerResult(BaseModel):
    status: str  # 'FOUND' | 'NO_SUITABLE_CONTRACT' | 'MARKET_CLOSED' | 'DISCONNECTED'
    evaluatedAt: str = Field(..., alias="evaluated_at")
    totalEvaluated: int = Field(0, alias="total_evaluated")
    eligibleCount: int = Field(0, alias="eligible_count")
    selectedCandidate: Optional[ScannerCandidate] = Field(None, alias="selected_candidate")
    candidates: List[ScannerCandidate] = Field(default_factory=list)
    selectionReason: str = Field(..., alias="selection_reason")

    class Config:
        populate_by_name = True
        from_attributes = True


class TrendAnalysis(BaseModel):
    state: MarketTrendState
    trendDirection: str = Field(..., alias="trend_direction")  # 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'NEUTRAL'
    ema9: Optional[float] = None
    ema21: Optional[float] = None
    emaSpread: Optional[float] = Field(None, alias="ema_spread")
    candleConfirmation: bool = Field(False, alias="candle_confirmation")
    trendStrength: str = Field("NONE", alias="trend_strength")  # 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE'
    lastCandleTimestamp: Optional[str] = Field(None, alias="last_candle_timestamp")
    reasonCodes: List[str] = Field(default_factory=list, alias="reason_codes")
    evaluatedAt: str = Field(..., alias="evaluated_at")

    class Config:
        populate_by_name = True
        from_attributes = True


class OrderValidationRequest(BaseModel):
    instrumentToken: str = Field(..., alias="instrument_token")
    tradingSymbol: str = Field(..., alias="trading_symbol")
    optionType: OptionType = Field(..., alias="option_type")
    side: OrderSide
    quantity: int
    price: str  # Intended executable limit price
    targetPrice: str = Field(..., alias="target_price")
    stopLossPrice: str = Field(..., alias="stop_loss_price")

    class Config:
        populate_by_name = True


class OrderValidationResult(BaseModel):
    isValid: bool = Field(..., alias="is_valid")
    requiredMargin: str = Field(..., alias="required_margin")
    estimatedCharges: ChargeBreakdown = Field(..., alias="estimated_charges")
    estimatedGrossProfit: str = Field(..., alias="estimated_gross_profit")
    estimatedGrossLoss: str = Field(..., alias="estimated_gross_loss")
    estimatedNetProfit: str = Field(..., alias="estimated_net_profit")
    estimatedNetLoss: str = Field(..., alias="estimated_net_loss")
    targetTickAligned: bool = Field(True, alias="target_tick_aligned")
    stopLossTickAligned: bool = Field(True, alias="stop_loss_tick_aligned")
    quantityLotAligned: bool = Field(True, alias="quantity_lot_aligned")
    validationErrors: List[str] = Field(default_factory=list, alias="validation_errors")
    warnings: List[str] = Field(default_factory=list)

    class Config:
        populate_by_name = True
