"""Account funds and margin endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import (
    get_broker_adapter,
    get_broker_adapter_for_connection,
)
from app.models.entities import BrokerConnection
from app.database import get_db
from app.models.enums import BrokerConnectionState, DataFreshness
from app.routers.deps import success_response
from app.schemas.account import AccountFundsResponse
from app.schemas.common import ApiResponse
from app.schemas.financial_accounting import (
    AccountSnapshotRecord,
    ContractNoteImportRequest,
    ContractNoteImportResult,
    FeeScheduleVersion,
)
from app.services.auth_service import CurrentUser, get_current_user
from app.services.financial_accounting import FinancialAccountingService
from sqlalchemy import select

router = APIRouter(prefix="/api/v1", tags=["Account & Funds"])


@router.get("/account/funds", response_model=ApiResponse[Optional[AccountFundsResponse]])
async def get_account_funds(
    request: Request,
    connection_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Optional[AccountFundsResponse]]:
    """Retrieve live funds and margin. Returns None honestly when disconnected."""
    if connection_id:
        c_stmt = select(BrokerConnection).where(
            BrokerConnection.id == connection_id,
            BrokerConnection.user_id == user.id,
        )
        c_res = await db.execute(c_stmt)
        conn = c_res.scalar_one_or_none()
        broker = get_broker_adapter_for_connection(conn) if conn else get_broker_adapter()
    else:
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


@router.get("/account/snapshots", response_model=ApiResponse[List[AccountSnapshotRecord]])
async def get_account_snapshots(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[AccountSnapshotRecord]]:
    """Retrieve chronological snapshots of margin, cash balances, and collateral."""
    service = FinancialAccountingService()
    records = await service.get_account_snapshots(db=db, limit=limit)
    return success_response(records, request=request, data_source="DATABASE")


@router.get("/funds/fee-schedules", response_model=ApiResponse[List[FeeScheduleVersion]])
async def get_fee_schedules(
    request: Request,
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[FeeScheduleVersion]]:
    """Retrieve official statutory tariff schedules and version history."""
    service = FinancialAccountingService()
    schedules = service.get_fee_schedules()
    return success_response(schedules, request=request, data_source="STATIC")


@router.post("/funds/contract-notes/import", response_model=ApiResponse[ContractNoteImportResult])
async def import_contract_note(
    request: Request,
    payload: ContractNoteImportRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[ContractNoteImportResult]:
    """Imports official broker contract note entries and reconciles confirmed charges."""
    service = FinancialAccountingService()
    result = await service.import_contract_note(payload=payload, db=db)
    return success_response(result, request=request, data_source="DATABASE")
