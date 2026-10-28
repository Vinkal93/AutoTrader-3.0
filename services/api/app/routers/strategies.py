"""Strategy configuration, listing, update, and risk validation endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.strategy import (
    Strategy,
    StrategyConfig,
    StrategyUpdateRequest,
    StrategyValidationResult,
)
from app.services.auth_service import CurrentUser, get_current_user
from app.services.strategy_service import StrategyService

router = APIRouter(prefix="/api/v1/strategies", tags=["Strategies"])


@router.get("", response_model=ApiResponse[List[Strategy]])
async def list_strategies(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Strategy]]:
    """List all registered strategies and current versions."""
    await StrategyService.seed_default_strategy_if_empty(db)
    strats = await StrategyService.get_all_strategies(db)
    return success_response(strats, request=request, data_source="DATABASE")


@router.get("/active", response_model=ApiResponse[Strategy])
async def get_active_strategy(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Strategy]:
    """Get the currently active trading strategy."""
    active_strat = await StrategyService.get_active_strategy(db)
    if not active_strat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active strategy configured",
        )
    return success_response(active_strat, request=request, data_source="DATABASE")


@router.put("/{strategy_id}", response_model=ApiResponse[Strategy])
async def update_strategy(
    strategy_id: str,
    payload: StrategyUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Strategy]:
    """Update strategy parameters, validate configuration, and increment version number."""
    try:
        strat, validation = await StrategyService.update_strategy(
            strategy_id=strategy_id,
            update_data=payload,
            db=db,
            user_email=user.email,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    if not validation.is_valid:
        err_msg = "; ".join(f"{e.field}: {e.message}" for e in validation.errors)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Strategy validation failed: {err_msg}",
        )

    return success_response(strat, request=request, data_source="DATABASE")


@router.post("/{strategy_id}/validate", response_model=ApiResponse[StrategyValidationResult])
async def validate_strategy(
    strategy_id: str,
    config: StrategyConfig,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[StrategyValidationResult]:
    """Test validation of strategy config without saving."""
    validation = StrategyService.validate_config(config)
    return success_response(validation, request=request, data_source="DATABASE")
