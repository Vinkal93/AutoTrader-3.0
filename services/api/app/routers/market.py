"""Market data routes: NIFTY quote, candles, and option chain."""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.enums import DataFreshness, MarketTrendState, OptionType
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.market import CandlesResponse, NiftyQuote, OptionChainResponse
from app.schemas.market_scanner import ScannerCandidate, ScannerResult, TrendAnalysis
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1/market", tags=["Market Data"])


@router.get("/nifty", response_model=ApiResponse[Optional[NiftyQuote]])
async def get_nifty_quote(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Optional[NiftyQuote]]:
    """Retrieve live NIFTY index quote. Honest null when disconnected."""
    broker = get_broker_adapter()
    quote = await broker.get_quotes(symbol="NIFTY")
    if quote is None:
        return success_response(
            None,
            request=request,
            data_source="BROKER",
            freshness=DataFreshness.UNAVAILABLE,
        )

    return success_response(
        quote,
        request=request,
        data_source="BROKER",
        freshness=quote.freshness,
        as_of=quote.timestamp,
    )


@router.get("/candles", response_model=ApiResponse[Optional[CandlesResponse]])
async def get_market_candles(
    request: Request,
    symbol: str = Query("NIFTY", description="Underlying or scrip symbol"),
    interval: str = Query("5m", description="Candle timeframe e.g. 1m, 5m, 15m"),
    from_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Optional[CandlesResponse]]:
    """Fetch historical candle / bar chart data."""
    broker = get_broker_adapter()
    candles = await broker.get_historical_candles(
        symbol=symbol,
        interval=interval,
        from_date=from_date,
        to_date=to_date,
    )
    if candles is None:
        return success_response(
            None,
            request=request,
            data_source="BROKER",
            freshness=DataFreshness.UNAVAILABLE,
        )

    return success_response(
        candles,
        request=request,
        data_source="BROKER",
        freshness=DataFreshness.LIVE,
        as_of=candles.as_of,
    )


@router.get("/option-chain", response_model=ApiResponse[Optional[OptionChainResponse]])
async def get_option_chain(
    request: Request,
    symbol: str = Query("NIFTY", description="Underlying symbol"),
    expiry: Optional[str] = Query(None, description="Expiry date YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Optional[OptionChainResponse]]:
    """Fetch option chain with Greeks. Honest null if disconnected."""
    broker = get_broker_adapter()
    chain = await broker.get_option_chain(symbol=symbol, expiry=expiry)
    if chain is None:
        return success_response(
            None,
            request=request,
            data_source="BROKER",
            freshness=DataFreshness.UNAVAILABLE,
        )

    return success_response(
        chain,
        request=request,
        data_source="BROKER",
        freshness=chain.freshness,
        as_of=chain.as_of,
    )


def _calculate_ema(prices: List[float], period: int) -> List[float]:
    """Calculate exponential moving average (SMA seed followed by multiplier smoothing)."""
    if len(prices) < period:
        return []
    k = 2.0 / (period + 1)
    ema = [sum(prices[:period]) / period]
    for price in prices[period:]:
        ema.append(price * k + ema[-1] * (1.0 - k))
    return ema


@router.get("/trend", response_model=ApiResponse[TrendAnalysis])
async def get_market_trend(
    request: Request,
    symbol: str = Query("NIFTY", description="Underlying symbol"),
    interval: str = Query("5m", description="Candle interval for trend check"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[TrendAnalysis]:
    """Canonical trend indicator computation (EMA 9, EMA 21, and candle confirmation)."""
    broker = get_broker_adapter()
    candles_resp = await broker.get_historical_candles(symbol=symbol, interval=interval)
    now_iso = datetime.now(timezone.utc).isoformat()

    if not candles_resp or not candles_resp.candles or len(candles_resp.candles) < 21:
        return success_response(
            TrendAnalysis(
                state=MarketTrendState.INSUFFICIENT_DATA if candles_resp else MarketTrendState.MARKET_CLOSED,
                trend_direction="NEUTRAL",
                ema9=None,
                ema21=None,
                ema_spread=None,
                candle_confirmation=False,
                trend_strength="NONE",
                last_candle_timestamp=None,
                reason_codes=["INSUFFICIENT_CANDLE_HISTORY_FOR_EMA21"],
                evaluated_at=now_iso,
            ),
            request=request,
            data_source="COMPUTED",
            freshness=DataFreshness.UNAVAILABLE if not candles_resp else DataFreshness.LIVE,
        )

    closes = [c.close for c in candles_resp.candles]
    ema9_series = _calculate_ema(closes, 9)
    ema21_series = _calculate_ema(closes, 21)

    latest_close = closes[-1]
    latest_ema9 = ema9_series[-1]
    latest_ema21 = ema21_series[-1]
    spread = latest_ema9 - latest_ema21
    last_timestamp = candles_resp.candles[-1].timestamp

    # Trend logic: threshold of 2.0 points for sideways filter
    reasons = []
    if abs(spread) < 2.0:
        state = MarketTrendState.SIDEWAYS
        direction = "SIDEWAYS"
        strength = "WEAK"
        reasons.append("EMA_SPREAD_BELOW_SIDEWAYS_THRESHOLD")
    elif spread > 0 and latest_close > latest_ema9:
        state = MarketTrendState.BULLISH
        direction = "BULLISH"
        strength = "STRONG" if spread > 8.0 else "MODERATE"
        reasons.append("EMA9_ABOVE_EMA21")
        reasons.append("PRICE_ABOVE_EMA9_CONFIRMED")
    elif spread < 0 and latest_close < latest_ema9:
        state = MarketTrendState.BEARISH
        direction = "BEARISH"
        strength = "STRONG" if spread < -8.0 else "MODERATE"
        reasons.append("EMA9_BELOW_EMA21")
        reasons.append("PRICE_BELOW_EMA9_CONFIRMED")
    elif spread > 0:
        state = MarketTrendState.BULLISH
        direction = "BULLISH"
        strength = "WEAK"
        reasons.append("EMA9_ABOVE_EMA21_AWAITING_CANDLE_CLOSE_CONFIRMATION")
    else:
        state = MarketTrendState.BEARISH
        direction = "BEARISH"
        strength = "WEAK"
        reasons.append("EMA9_BELOW_EMA21_AWAITING_CANDLE_CLOSE_CONFIRMATION")

    candle_confirmed = (
        (direction == "BULLISH" and latest_close >= latest_ema9) or
        (direction == "BEARISH" and latest_close <= latest_ema9)
    )

    return success_response(
        TrendAnalysis(
            state=state,
            trend_direction=direction,
            ema9=round(latest_ema9, 2),
            ema21=round(latest_ema21, 2),
            ema_spread=round(spread, 2),
            candle_confirmation=candle_confirmed,
            trend_strength=strength,
            last_candle_timestamp=last_timestamp,
            reason_codes=reasons,
            evaluated_at=now_iso,
        ),
        request=request,
        data_source="COMPUTED",
        freshness=DataFreshness.LIVE,
    )


@router.get("/scanner", response_model=ApiResponse[ScannerResult])
async def run_market_scanner(
    request: Request,
    underlying: str = Query("NIFTY", description="Underlying symbol"),
    premium_min: float = Query(40.0, description="Minimum executable ask"),
    premium_max: float = Query(45.0, description="Maximum executable ask"),
    preferred_premium: float = Query(42.5, description="Ideal target ask"),
    direction: str = Query("AUTO", description="AUTO, CE, or PE"),
    expiry: Optional[str] = Query(None, description="Target expiry date"),
    max_spread: float = Query(1.50, description="Maximum acceptable bid-ask spread"),
    min_liquidity: int = Query(50, description="Minimum ask depth quantity"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[ScannerResult]:
    """10-Step Smart Premium Scanner validating real option chain depth."""
    broker = get_broker_adapter()
    chain = await broker.get_option_chain(symbol=underlying, expiry=expiry)
    now_iso = datetime.now(timezone.utc).isoformat()

    if not chain or not chain.entries:
        return success_response(
            ScannerResult(
                status="DISCONNECTED" if not chain else "NO_SUITABLE_CONTRACT",
                evaluated_at=now_iso,
                total_evaluated=0,
                eligible_count=0,
                selected_candidate=None,
                candidates=[],
                selection_reason="Broker session disconnected or option chain data unavailable.",
            ),
            request=request,
            data_source="BROKER",
            freshness=DataFreshness.UNAVAILABLE,
        )

    candidates: List[ScannerCandidate] = []
    total_evaluated = 0

    for entry in chain.entries:
        options_to_check = []
        if direction in ("AUTO", "CE") and entry.ce:
            options_to_check.append((OptionType.CE, entry.ce))
        if direction in ("AUTO", "PE") and entry.pe:
            options_to_check.append((OptionType.PE, entry.pe))

        for opt_type, greek in options_to_check:
            total_evaluated += 1
            rejection_reasons = []

            ask = greek.ask_price
            bid = greek.bid_price
            spread = round(ask - bid, 2)
            lot_size = 25
            tick_size = 0.05

            # 1. Executable Ask Price Range Check
            if ask < premium_min or ask > premium_max:
                rejection_reasons.append(
                    f"Executable ask ₹{ask:.2f} is outside configured range [₹{premium_min:.2f}, ₹{premium_max:.2f}]"
                )

            # 2. Stale/Invalid Quote Check
            if ask <= 0 or bid <= 0:
                rejection_reasons.append("Zero or non-positive bid/ask quote detected (stale or market closed)")

            # 3. Spread Check
            if spread > max_spread:
                rejection_reasons.append(
                    f"Bid-ask spread ₹{spread:.2f} exceeds limit ₹{max_spread:.2f}"
                )

            # 4. Liquidity Depth Check
            if greek.ask_quantity < min_liquidity:
                rejection_reasons.append(
                    f"Available ask depth {greek.ask_quantity} is below minimum requirement {min_liquidity}"
                )

            is_eligible = len(rejection_reasons) == 0

            # Deterministic Ranking Score
            distance_from_preferred = abs(ask - preferred_premium)
            rank_score = 100.0 - (distance_from_preferred * 15.0) - (spread * 10.0) + (min(greek.volume, 50000) / 10000.0)

            candidates.append(
                ScannerCandidate(
                    instrument_token=greek.instrument_token,
                    trading_symbol=greek.trading_symbol,
                    option_type=opt_type,
                    strike_price=entry.strike_price,
                    expiry_date=entry.expiry_date,
                    ltp=greek.last_price,
                    bid_price=bid,
                    ask_price=ask,
                    bid_ask_spread=spread,
                    bid_quantity=greek.bid_quantity,
                    ask_quantity=greek.ask_quantity,
                    volume=greek.volume,
                    open_interest=greek.open_interest,
                    lot_size=lot_size,
                    tick_size=tick_size,
                    is_eligible=is_eligible,
                    rejection_reasons=rejection_reasons,
                    rank_score=round(rank_score, 2),
                    selection_explanation=(
                        f"Executable ask ₹{ask:.2f} conforms to range, spread ₹{spread:.2f}, depth {greek.ask_quantity}"
                        if is_eligible else "; ".join(rejection_reasons)
                    ),
                )
            )

    eligible_candidates = [c for c in candidates if c.is_eligible]
    eligible_candidates.sort(key=lambda x: x.rank_score, reverse=True)

    selected = eligible_candidates[0] if eligible_candidates else None
    if selected:
        status = "FOUND"
        reason = (
            f"Selected {selected.trading_symbol} ({selected.option_type}) with executable ask ₹{selected.ask_price:.2f} "
            f"(closest to target ₹{preferred_premium:.2f}, tight spread ₹{selected.bid_ask_spread:.2f}, score {selected.rank_score})"
        )
    else:
        status = "NO_SUITABLE_CONTRACT"
        reason = (
            f"Evaluated {total_evaluated} contracts. No contract satisfied executable ask range "
            f"[₹{premium_min:.2f}, ₹{premium_max:.2f}] with spread <= ₹{max_spread:.2f} and depth >= {min_liquidity}."
        )

    # Sort all candidates for transparent comparison: eligible first (by score), then ineligible
    candidates.sort(key=lambda x: (x.is_eligible, x.rank_score), reverse=True)

    return success_response(
        ScannerResult(
            status=status,
            evaluated_at=now_iso,
            total_evaluated=total_evaluated,
            eligible_count=len(eligible_candidates),
            selected_candidate=selected,
            candidates=candidates[:20],  # Return top 20 candidates for UI presentation
            selection_reason=reason,
        ),
        request=request,
        data_source="BROKER",
        freshness=chain.freshness,
    )
