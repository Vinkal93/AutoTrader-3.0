"""Broker connectivity management router."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.database import get_db
from app.routers.deps import success_response
from app.schemas.broker import BrokerConnectRequest, BrokerConnectionResponse
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1/broker", tags=["Broker"])


@router.get("/connection", response_model=ApiResponse[BrokerConnectionResponse])
async def get_broker_connection(
    request: Request,
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[BrokerConnectionResponse]:
    """Retrieve truthful broker connection status."""
    broker = get_broker_adapter()
    status_data = await broker.connection_status()
    return success_response(
        status_data,
        request=request,
        data_source="BROKER",
        freshness=status_data.state.value,  # type: ignore
    )


@router.post("/connect", response_model=ApiResponse[BrokerConnectionResponse])
async def connect_broker(
    request: Request,
    payload: BrokerConnectRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[BrokerConnectionResponse]:
    """Initiate broker connection using TOTP/MPIN."""
    broker = get_broker_adapter()
    result = await broker.connect(
        totp=payload.totp,
        mpin=payload.mpin,
        consumer_key=payload.consumer_key,
        consumer_secret=payload.consumer_secret,
        mobile_number=payload.mobile_number,
        password=payload.password,
    )
    return success_response(result, request=request, data_source="BROKER")


@router.post("/disconnect", response_model=ApiResponse[BrokerConnectionResponse])
async def disconnect_broker(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[BrokerConnectionResponse]:
    """Disconnect broker session safely."""
    broker = get_broker_adapter()
    result = await broker.disconnect()
    return success_response(result, request=request, data_source="BROKER")
