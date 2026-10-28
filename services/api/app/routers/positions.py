"""Positions router."""

from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.enums import BrokerConnectionState, DataFreshness
from app.routers.deps import success_response
from app.schemas.account import Position
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1", tags=["Positions"])


@router.get("/positions", response_model=ApiResponse[List[Position]])
async def get_positions(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Position]]:
    """Retrieve positions from active broker. Empty list if disconnected."""
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
