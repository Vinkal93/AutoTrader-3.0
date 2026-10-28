"""Analytics and Performance endpoints."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import ChargeEntry, TradeCycle
from app.routers.deps import success_response
from app.schemas.analytics import (
    DailyPnlEntry,
    EquityPoint,
    PerformanceMetrics,
    RiskAllowance,
)
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user
from app.services.state_service import StateService
from app.services.strategy_service import StrategyService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/performance", response_model=ApiResponse[PerformanceMetrics])
async def get_performance_metrics(
    request: Request,
    timeframe: Literal["TODAY", "7D", "30D", "ALL"] = Query("TODAY", description="Timeframe filter"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[PerformanceMetrics]:
    """Calculate verified performance metrics from closed trade cycles."""
    now_utc = datetime.now(timezone.utc)
    stmt = select(TradeCycle)

    if timeframe == "TODAY":
        today_start = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc)
        stmt = stmt.where(TradeCycle.started_at >= today_start)
    elif timeframe == "7D":
        week_ago = now_utc - timedelta(days=7)
        stmt = stmt.where(TradeCycle.started_at >= week_ago)
    elif timeframe == "30D":
        month_ago = now_utc - timedelta(days=30)
        stmt = stmt.where(TradeCycle.started_at >= month_ago)

    stmt = stmt.order_by(TradeCycle.started_at.asc())
    cycles = (await db.execute(stmt)).scalars().all()

    total_trades = len(cycles)
    closed = [c for c in cycles if c.closed_at is not None]
    closed_count = len(closed)

    winning = sum(1 for c in closed if c.net_pnl and c.net_pnl > 0)
    losing = sum(1 for c in closed if c.net_pnl and c.net_pnl < 0)
    breakeven = sum(1 for c in closed if c.net_pnl == 0)

    win_rate = round((winning / closed_count * 100), 2) if closed_count > 0 else 0.0

    gross_sum = sum((c.realized_pnl or Decimal("0")) for c in closed)
    net_sum = sum((c.net_pnl or Decimal("0")) for c in closed)
    charges_sum = gross_sum - net_sum

    # Profit factor: gross wins / gross losses
    gross_wins = sum((c.realized_pnl or Decimal("0")) for c in closed if c.realized_pnl and c.realized_pnl > 0)
    gross_losses = abs(sum((c.realized_pnl or Decimal("0")) for c in closed if c.realized_pnl and c.realized_pnl < 0))
    profit_factor = round(float(gross_wins / gross_losses), 2) if gross_losses > 0 else (None if gross_wins == 0 else 999.0)

    # Compute daily PnL breakdown & equity curve
    daily_groups: dict[str, dict] = {}
    equity_points: List[EquityPoint] = []
    running_equity = Decimal("0")
    peak_equity = Decimal("0")
    max_drawdown = Decimal("0")

    for c in closed:
        date_str = c.started_at.strftime("%Y-%m-%d")
        if date_str not in daily_groups:
            daily_groups[date_str] = {"gross": Decimal("0"), "net": Decimal("0"), "count": 0}
        daily_groups[date_str]["gross"] += (c.realized_pnl or Decimal("0"))
        daily_groups[date_str]["net"] += (c.net_pnl or Decimal("0"))
        daily_groups[date_str]["count"] += 1

        running_equity += (c.net_pnl or Decimal("0"))
        if running_equity > peak_equity:
            peak_equity = running_equity
        dd = peak_equity - running_equity
        if dd > max_drawdown:
            max_drawdown = dd

        equity_points.append(
            EquityPoint(
                timestamp=c.closed_at.isoformat() if c.closed_at else c.started_at.isoformat(),
                equity=float(running_equity),
            )
        )

    daily_series = [
        DailyPnlEntry(
            date=d,
            gross_pnl=float(data["gross"]),
            net_pnl=float(data["net"]),
            trades_count=data["count"],
        )
        for d, data in sorted(daily_groups.items())
    ]

    charges_status = "ACTUAL" if charges_sum > 0 else ("UNAVAILABLE" if total_trades == 0 else "ESTIMATED")

    metrics = PerformanceMetrics(
        timeframe=timeframe,
        total_trades=total_trades,
        closed_trades=closed_count,
        winning_trades=winning,
        losing_trades=losing,
        breakeven_trades=breakeven,
        win_rate=win_rate,
        gross_pnl=f"{gross_sum:.2f}",
        net_pnl=f"{net_sum:.2f}",
        total_charges=f"{charges_sum:.2f}",
        charges_status=charges_status,
        max_drawdown=f"{max_drawdown:.2f}" if closed_count > 0 else None,
        max_drawdown_percent=None,
        profit_factor=profit_factor,
        daily_pnl_series=daily_series,
        equity_curve=equity_points,
    )

    return success_response(metrics, request=request, data_source="DATABASE")


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
