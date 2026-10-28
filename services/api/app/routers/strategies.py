"""Strategy configuration, listing, update, and risk validation endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.entities import Strategy as StrategyModel
from app.routers.deps import success_response
from app.schemas.common import ApiResponse
from app.schemas.strategy import (
    Strategy,
    StrategyConfig,
    StrategyUpdateRequest,
    StrategyValidationResult,
)
from app.schemas.strategy_engine import (
    BacktestRequest,
    BacktestResult,
    StrategyRunRecord,
    StrategyScheduleStatus,
    StrategyVersionRecord,
)
from app.services.auth_service import CurrentUser, get_current_user
from app.services.strategy_engine import StrategyEngineService
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


@router.post("/backtest", response_model=ApiResponse[BacktestResult])
async def run_strategy_backtest(
    payload: BacktestRequest,
    request: Request,
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[BacktestResult]:
    """Run chronological backtesting simulation on completed candles with zero lookahead."""
    result = await StrategyEngineService.run_backtest_simulation(payload)
    return success_response(result, request=request, data_source="SIMULATED")


@router.get("/{strategy_id}/versions", response_model=ApiResponse[List[StrategyVersionRecord]])
async def get_strategy_versions(
    strategy_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[StrategyVersionRecord]]:
    """Retrieve immutable version history for a strategy."""
    versions = await StrategyEngineService.get_version_history(strategy_id=strategy_id, db=db)
    return success_response(versions, request=request, data_source="DATABASE")


@router.get("/{strategy_id}/runs", response_model=ApiResponse[List[StrategyRunRecord]])
async def get_strategy_runs(
    strategy_id: str,
    request: Request,
    limit: int = Query(50, description="Max runs to return"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[StrategyRunRecord]]:
    """Retrieve decision audit ledger for a strategy."""
    runs = await StrategyEngineService.get_strategy_runs(strategy_id=strategy_id, db=db, limit=limit)
    return success_response(runs, request=request, data_source="DATABASE")


@router.get("/{strategy_id}/schedule", response_model=ApiResponse[StrategyScheduleStatus])
async def get_strategy_schedule(
    strategy_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[StrategyScheduleStatus]:
    """Retrieve market calendar schedule and next run status."""
    strat = await StrategyService.get_active_strategy(db)
    if not strat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")

    from app.models.entities import Strategy as StrategyEntity
    res = await db.execute(select(StrategyEntity).where(StrategyEntity.id == strategy_id).limit(1))
    strat_entity = res.scalars().first()
    if not strat_entity:
        strat_entity = await StrategyService.seed_default_strategy_if_empty(db)

    status_data = await StrategyEngineService.get_schedule_status(strategy=strat_entity, db=db)
    return success_response(status_data, request=request, data_source="DATABASE")


@router.post("/{strategy_id}/evaluate", response_model=ApiResponse[StrategyRunRecord])
async def evaluate_strategy(
    strategy_id: str,
    request: Request,
    force: bool = Query(False, description="Force evaluation regardless of market hours / duplicate run"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[StrategyRunRecord]:
    """Execute strategy decision logic (EMA 9/21, direction rules, candidate scanner)."""
    from app.models.entities import Strategy as StrategyEntity
    res = await db.execute(select(StrategyEntity).where(StrategyEntity.id == strategy_id).limit(1))
    strat_entity = res.scalars().first()
    if not strat_entity:
        strat_entity = await StrategyService.seed_default_strategy_if_empty(db)

    active_strat = await StrategyService.get_active_strategy(db)
    config = active_strat.config if active_strat else StrategyService.get_default_config()

    run_record = await StrategyEngineService.evaluate_strategy_decision(
        strategy=strat_entity,
        config=config,
        db=db,
        force_eval=force,
    )
    return success_response(run_record, request=request, data_source="COMPUTED")
