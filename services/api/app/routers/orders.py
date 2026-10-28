"""Order query endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.entities import Order as OrderModel
from app.models.enums import BrokerConnectionState, DataFreshness, Exchange, OrderSide, OrderStatus, OrderType
from app.routers.deps import success_response
from app.schemas.account import Order
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1", tags=["Orders"])


@router.get("/orders", response_model=ApiResponse[List[Order]])
async def get_orders(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Order]]:
    """Retrieve orders from broker or local database audit log."""
    broker = get_broker_adapter()
    conn = await broker.connection_status()

    if conn.state == BrokerConnectionState.CONNECTED:
        orders = await broker.get_orders()
        return success_response(orders, request=request, data_source="BROKER", freshness=DataFreshness.LIVE)

    # Fallback to local DB records if broker not connected
    stmt = select(OrderModel).order_by(desc(OrderModel.placed_at)).limit(50)
    db_orders = (await db.execute(stmt)).scalars().all()

    orders = [
        Order(
            id=o.id,
            broker_order_id=o.broker_order_id,
            trading_symbol=o.trading_symbol,
            exchange=Exchange(o.exchange),
            side=OrderSide(o.side),
            order_type=OrderType(o.order_type),
            quantity=o.quantity,
            filled_quantity=o.filled_quantity,
            price=str(o.price),
            trigger_price=str(o.trigger_price) if o.trigger_price else None,
            average_filled_price=str(o.average_filled_price) if o.average_filled_price else None,
            status=OrderStatus(o.status),
            status_message=o.status_message,
            placed_at=o.placed_at.isoformat(),
            updated_at=o.updated_at.isoformat(),
            strategy_run_id=o.strategy_run_id,
            trade_cycle_id=o.trade_cycle_id,
            idempotency_key=o.idempotency_key,
        )
        for o in db_orders
    ]

    return success_response(
        orders,
        request=request,
        data_source="DATABASE",
        freshness=DataFreshness.RECENT if orders else DataFreshness.UNAVAILABLE,
    )
