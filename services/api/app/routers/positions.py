"""Positions router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import (
    get_broker_adapter,
    get_broker_adapter_for_connection,
)
from app.database import get_db
from app.models.entities import BrokerConnection
from app.models.enums import BrokerConnectionState, DataFreshness
from app.routers.deps import success_response
from app.schemas.account import Position
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1", tags=["Positions"])


@router.get("/positions", response_model=ApiResponse[List[Position]])
async def get_positions(
    request: Request,
    connection_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Position]]:
    """Retrieve positions from active broker. Empty list if disconnected."""
    if connection_id:
        c_stmt = select(BrokerConnection).where(
            BrokerConnection.id == connection_id,
            BrokerConnection.user_id == user.id,
        )
        c_res = await db.execute(c_stmt)
        conn_entity = c_res.scalar_one_or_none()
        broker = get_broker_adapter_for_connection(conn_entity) if conn_entity else get_broker_adapter()
    else:
        broker = get_broker_adapter()
    conn = await broker.connection_status()
    positions = await broker.get_positions()

    freshness = (
        DataFreshness.LIVE
        if conn.state == BrokerConnectionState.CONNECTED
        else DataFreshness.UNAVAILABLE
    )

    return success_response(
        positions,
        request=request,
        data_source="BROKER",
        freshness=freshness,
    )
