"""Market data routes: NIFTY quote, candles, and option chain."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.enums import DataFreshness
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.market import CandlesResponse, NiftyQuote, OptionChainResponse
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
