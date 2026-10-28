"""Trade Cycles endpoint providing canonical trade records, executions, filters, and CSV export."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import TradeCycle
from app.models.enums import OptionType, TradeCycleState, TradingMode
from app.routers.deps import paginated_response, success_response
from app.schemas.analytics import TradeCycleDetail
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.financial_accounting import TradeCycleFilterParams
from app.services.auth_service import CurrentUser, get_current_user
from app.services.financial_accounting import FinancialAccountingService

router = APIRouter(prefix="/api/v1/trade-cycles", tags=["Trade Cycles"])


@router.get("", response_model=PaginatedResponse[TradeCycleDetail])
async def list_trade_cycles(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    state: Optional[TradeCycleState] = None,
    mode: Optional[TradingMode] = None,
    start_date: Optional[str] = Query(None, alias="startDate"),
    end_date: Optional[str] = Query(None, alias="endDate"),
    symbol: Optional[str] = None,
    strategy_id: Optional[str] = Query(None, alias="strategyId"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> PaginatedResponse[TradeCycleDetail]:
    """Retrieve canonical trade cycles with execution pricing, filters, and charges."""
    filters = TradeCycleFilterParams(
        start_date=start_date,
        end_date=end_date,
        symbol=symbol,
        status=state,
        strategy_id=strategy_id,
        mode=mode,
    )
    service = FinancialAccountingService()
    items, total_items = await service.get_filtered_trade_cycles(
        db=db, filters=filters, page=page, page_size=page_size
    )

    return paginated_response(
        items=items,
        total_items=total_items,
        page=page,
        page_size=page_size,
        request=request,
        data_source="DATABASE",
    )


@router.get("/export")
async def export_trade_cycles(
    request: Request,
    state: Optional[TradeCycleState] = None,
    mode: Optional[TradingMode] = None,
    start_date: Optional[str] = Query(None, alias="startDate"),
    end_date: Optional[str] = Query(None, alias="endDate"),
    symbol: Optional[str] = None,
    strategy_id: Optional[str] = Query(None, alias="strategyId"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> Response:
    """Exports filtered trade history as RFC 4180 CSV attachment."""
    filters = TradeCycleFilterParams(
        start_date=start_date,
        end_date=end_date,
        symbol=symbol,
        status=state,
        strategy_id=strategy_id,
        mode=mode,
    )
    service = FinancialAccountingService()
    csv_content = await service.export_trade_cycles_to_csv(db=db, filters=filters)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=trade_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        },
    )


@router.get("/{cycle_id}", response_model=ApiResponse[TradeCycleDetail])
async def get_trade_cycle_detail(
    cycle_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[TradeCycleDetail]:
    """Retrieve full detail of a specific trade cycle with executions and charges."""
    service = FinancialAccountingService()
    filters = TradeCycleFilterParams()
    items, _ = await service.get_filtered_trade_cycles(db=db, filters=filters, page=1, page_size=1000)

    for item in items:
        if item.id == cycle_id:
            return success_response(item, request=request, data_source="DATABASE")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Trade cycle '{cycle_id}' not found",
    )
