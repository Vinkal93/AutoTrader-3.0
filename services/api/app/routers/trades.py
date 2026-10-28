"""Trade book / execution endpoints."""

from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.entities import Execution
from app.models.enums import BrokerConnectionState, DataFreshness, Exchange, OrderSide
from app.routers.deps import success_response
from app.schemas.account import Trade
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1", tags=["Trades"])


@router.get("/trades", response_model=ApiResponse[List[Trade]])
async def get_trades(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Trade]]:
    """Retrieve executed trades / fills."""
    broker = get_broker_adapter()
    conn = await broker.connection_status()

    if conn.state == BrokerConnectionState.CONNECTED:
        trades = await broker.get_tradebook()
        return success_response(trades, request=request, data_source="BROKER", freshness=DataFreshness.LIVE)

    # Database executions fallback
    stmt = select(Execution).order_by(desc(Execution.trade_time)).limit(50)
    db_executions = (await db.execute(stmt)).scalars().all()

    trades = [
        Trade(
            id=e.id,
            order_id=e.order_id,
            broker_trade_id=e.broker_trade_id,
            trading_symbol=e.trading_symbol,
            exchange=Exchange(e.exchange),
            side=OrderSide(e.side),
            quantity=e.quantity,
            price=str(e.price),
            trade_time=e.trade_time.isoformat(),
        )
        for e in db_executions
    ]

    return success_response(
        trades,
        request=request,
        data_source="DATABASE",
        freshness=DataFreshness.RECENT if trades else DataFreshness.UNAVAILABLE,
    )
