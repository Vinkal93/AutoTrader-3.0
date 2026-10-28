"""Account funds and margin endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.models.enums import BrokerConnectionState, DataFreshness
from app.routers.deps import success_response
from app.schemas.account import AccountFundsResponse
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1/account", tags=["Account"])


@router.get("/funds", response_model=ApiResponse[Optional[AccountFundsResponse]])
async def get_account_funds(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Optional[AccountFundsResponse]]:
    """Retrieve live funds and margin. Returns None honestly when disconnected."""
    broker = get_broker_adapter()
    funds = await broker.get_funds()
    if funds is None:
        return success_response(
            data=None,
            request=request,
            data_source="BROKER",
            freshness=DataFreshness.UNAVAILABLE,
        )

    return success_response(
        data=funds,
        request=request,
        data_source="BROKER",
        freshness=funds.freshness,
        as_of=funds.as_of,
    )
