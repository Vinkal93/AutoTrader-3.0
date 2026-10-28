"""Consolidated dashboard overview endpoint."""

from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.entities import SystemEvent as SystemEventModel, TradeCycle
from app.models.enums import BrokerConnectionState, DataFreshness, SystemEventSeverity
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.dashboard import (
    DashboardAccountSummary,
    DashboardActiveStrategy,
    DashboardNiftySpot,
    DashboardOverview,
    DashboardTodaySummary,
    SystemEvent,
)
from app.services.auth_service import CurrentUser, get_current_user
from app.services.state_service import StateService
from app.services.strategy_service import StrategyService

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=ApiResponse[DashboardOverview])
async def get_dashboard_overview(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[DashboardOverview]:
    """Retrieve consolidated overview for dashboard header, cards, and charts."""
    broker = get_broker_adapter()
    conn_status = await broker.connection_status()
    engine_state = StateService.get_current_state()
    trading_mode = StateService.get_trading_mode()

    # 1. Today's summary from trade_cycles
    today_trades_stmt = select(TradeCycle)
    tc_res = await db.execute(today_trades_stmt)
    trade_cycles = tc_res.scalars().all()

    today_summary: Optional[DashboardTodaySummary] = None
    if trade_cycles:
        total = len(trade_cycles)
        completed = sum(1 for tc in trade_cycles if tc.closed_at is not None)
        winning = sum(1 for tc in trade_cycles if tc.net_pnl and tc.net_pnl > 0)
        losing = sum(1 for tc in trade_cycles if tc.net_pnl and tc.net_pnl < 0)
        total_pnl = sum((tc.realized_pnl or Decimal("0")) for tc in trade_cycles)
        net_pnl = sum((tc.net_pnl or Decimal("0")) for tc in trade_cycles)
        total_charges = total_pnl - net_pnl

        today_summary = DashboardTodaySummary(
            total_trades=total,
            completed_trades=completed,
            winning_trades=winning,
            losing_trades=losing,
            total_pnl=f"{total_pnl:.2f}",
            total_charges=f"{total_charges:.2f}",
            net_pnl=f"{net_pnl:.2f}",
        )

    # 2. Account summary from broker (honest null if disconnected)
    account_summary: Optional[DashboardAccountSummary] = None
    if conn_status.state == BrokerConnectionState.CONNECTED:
        funds = await broker.get_funds()
        if funds:
            account_summary = DashboardAccountSummary(
                available_margin=funds.available_margin,
                used_margin=funds.used_margin,
                unrealized_pnl=funds.unrealized_pnl,
            )

    # 3. NIFTY Spot quote (honest null if disconnected)
    nifty_spot: Optional[DashboardNiftySpot] = None
    quote = await broker.get_quotes(symbol="NIFTY")
    if quote:
        nifty_spot = DashboardNiftySpot(
            last_price=quote.last_price,
            change=quote.change,
            change_percent=quote.change_percent,
            freshness=quote.freshness,
        )

    # 4. Active strategy
    active_strat = await StrategyService.get_active_strategy(db)
    active_strategy_info = (
        DashboardActiveStrategy(
            id=active_strat.id,
            name=active_strat.name,
            status="ACTIVE" if active_strat.is_active else "INACTIVE",
        )
        if active_strat
        else None
    )

    # 5. Recent system events (last 10)
    events_stmt = (
        select(SystemEventModel)
        .order_by(desc(SystemEventModel.timestamp))
        .limit(10)
    )
    events_raw = (await db.execute(events_stmt)).scalars().all()
    recent_events = [
        SystemEvent(
            id=e.id,
            severity=SystemEventSeverity(e.severity),
            category=e.category,
            message=e.message,
            details=e.details_json,
            timestamp=e.timestamp.isoformat(),
        )
        for e in events_raw
    ]

    overview = DashboardOverview(
        trading_mode=trading_mode,
        engine_state=engine_state,
        broker_connection=conn_status.state,
        today_summary=today_summary,
        account_summary=account_summary,
        nifty_spot=nifty_spot,
        active_strategy=active_strategy_info,
        recent_events=recent_events,
    )

    return success_response(overview, request=request, data_source="DATABASE")
