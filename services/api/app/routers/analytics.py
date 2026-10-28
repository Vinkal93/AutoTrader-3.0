"""Analytics and Performance endpoints."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import ChargeEntry, TradeCycle
from app.routers.deps import success_response
from app.schemas.analytics import (
    ComprehensiveAnalytics,
    DailyPnlEntry,
    EquityPoint,
    PerformanceMetrics,
    RiskAllowance,
)
from app.schemas.common import ApiResponse
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import CurrentUser, get_current_user
from app.services.state_service import StateService
from app.services.strategy_service import StrategyService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/performance", response_model=ApiResponse[PerformanceMetrics])
async def get_performance_metrics(
    request: Request,
    timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"] = Query("TODAY", description="Timeframe filter"),
    start_date: Optional[str] = Query(None, description="Start date for custom timeframe"),
    end_date: Optional[str] = Query(None, description="End date for custom timeframe"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[PerformanceMetrics]:
    """Calculate verified performance metrics from closed trade cycles."""
    full_analytics = await AnalyticsService.get_comprehensive_analytics(
        db,
        timeframe=timeframe,
        start_date=start_date,
        end_date=end_date,
    )
    # Return as PerformanceMetrics for backwards compatibility
    metrics = PerformanceMetrics(
        timeframe=full_analytics.timeframe,
        total_trades=full_analytics.total_trades,
        closed_trades=full_analytics.closed_trades,
        winning_trades=full_analytics.winning_trades,
        losing_trades=full_analytics.losing_trades,
        breakeven_trades=full_analytics.breakeven_trades,
        win_rate=full_analytics.win_rate,
        gross_pnl=full_analytics.gross_pnl,
        net_pnl=full_analytics.net_pnl,
        total_charges=full_analytics.total_charges,
        charges_status=full_analytics.charges_status,
        max_drawdown=full_analytics.max_drawdown,
        max_drawdown_percent=full_analytics.max_drawdown_percent,
        profit_factor=full_analytics.profit_factor,
        daily_pnl_series=full_analytics.daily_pnl_series,
        equity_curve=full_analytics.equity_curve,
    )
    return success_response(metrics, request=request, data_source="DATABASE")


@router.get("/comprehensive", response_model=ApiResponse[ComprehensiveAnalytics])
async def get_comprehensive_analytics(
    request: Request,
    timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"] = Query("ALL", description="Timeframe filter"),
    start_date: Optional[str] = Query(None, description="Start date for custom timeframe (ISO string)"),
    end_date: Optional[str] = Query(None, description="End date for custom timeframe (ISO string)"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[ComprehensiveAnalytics]:
    """Retrieve full production-grade trading analytics for Phase 7."""
    analytics = await AnalyticsService.get_comprehensive_analytics(
        db,
        timeframe=timeframe,
        start_date=start_date,
        end_date=end_date,
    )
    return success_response(analytics, request=request, data_source="DATABASE")


@router.get("/export")
async def export_analytics_report(
    timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"] = Query("ALL", description="Timeframe filter"),
    format: Literal["csv", "json"] = Query("csv", description="Export format (csv or json)"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    """Exports performance analytics summary and trade itemization as CSV or JSON."""
    content, filename, media_type = await AnalyticsService.export_report(
        db,
        timeframe=timeframe,
        export_format=format,
    )
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/risk", response_model=ApiResponse[RiskAllowance])
async def get_risk_allowance(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[RiskAllowance]:
    """Retrieve current risk allowance, daily drawdown limit, and lockout status."""
    active_strat = await StrategyService.get_active_strategy(db)
    daily_limit = active_strat.config.max_daily_loss if active_strat else None
    max_risk_trade = active_strat.config.max_risk_per_trade if active_strat else None

    # Calculate realized loss today
    now_utc = datetime.now(timezone.utc)
    today_start = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc)
    stmt = select(TradeCycle).where(TradeCycle.started_at >= today_start)
    cycles = (await db.execute(stmt)).scalars().all()

    realized_loss_today = sum(
        abs(c.net_pnl) for c in cycles if c.net_pnl and c.net_pnl < 0
    )

    remaining_allowance: Optional[str] = None
    is_risk_locked = False
    lockout_reason: Optional[str] = None

    if daily_limit:
        limit_dec = Decimal(daily_limit)
        rem = limit_dec - realized_loss_today
        if rem <= Decimal("0"):
            remaining_allowance = "0.00"
            is_risk_locked = True
            lockout_reason = f"Daily loss limit of ₹{daily_limit} reached"
        else:
            remaining_allowance = f"{rem:.2f}"

    risk = RiskAllowance(
        daily_loss_limit=daily_limit,
        realized_loss_today=f"{realized_loss_today:.2f}",
        open_exposure="0.00",
        remaining_daily_allowance=remaining_allowance,
        max_risk_per_trade=max_risk_trade,
        is_risk_locked=is_risk_locked,
        lockout_reason=lockout_reason,
    )

    return success_response(risk, request=request, data_source="DATABASE")
