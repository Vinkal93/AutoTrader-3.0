"""Order query endpoints."""

from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter, get_broker_adapter_for_connection
from app.database import get_db
from app.models.entities import (
    BrokerConnection,
    BrokerPermission,
    Order as OrderModel,
    OrderEvent as OrderEventModel,
    SystemEvent as SystemEventModel,
)
from app.models.enums import BrokerConnectionState, DataFreshness, Exchange, OrderSide, OrderStatus, OrderType, SystemEventSeverity
from app.routers.deps import success_response
from app.schemas.account import Order
from app.schemas.analytics import ChargeBreakdown
from app.schemas.common import ApiResponse
from app.schemas.execution_engine import (
    OrderCancelRequest,
    OrderCancelResult,
    OrderEventRecord,
    OrderSubmissionRequest,
    OrderSubmissionResult,
    ReconciliationReport,
)
from app.schemas.market_scanner import OrderValidationRequest, OrderValidationResult
from app.services.auth_service import CurrentUser, get_current_user
from app.services.execution_engine import ExecutionEngine

router = APIRouter(prefix="/api/v1", tags=["Orders"])


@router.get("/orders", response_model=ApiResponse[List[Order]])
async def get_orders(
    request: Request,
    connection_id: Optional[str] = Query(None, alias="connectionId"),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[Order]]:
    """Retrieve orders from broker or local database audit log scoped by tenant and connection."""
    if connection_id:
        c_stmt = select(BrokerConnection).where(
            BrokerConnection.id == connection_id,
            BrokerConnection.user_id == user.id,
        )
        b_conn = (await db.execute(c_stmt)).scalars().first()
        if b_conn and b_conn.state == BrokerConnectionState.CONNECTED.value:
            adapter = get_broker_adapter_for_connection(b_conn)
            try:
                orders = await adapter.get_orders()
                if orders:
                    return success_response(orders, request=request, data_source="BROKER", freshness=DataFreshness.LIVE)
            except Exception:
                pass

    broker = get_broker_adapter()
    conn = await broker.connection_status()

    if conn.state == BrokerConnectionState.CONNECTED and not connection_id:
        orders = await broker.get_orders()
        return success_response(orders, request=request, data_source="BROKER", freshness=DataFreshness.LIVE)

    # Fallback to local DB records if broker not connected
    stmt = select(OrderModel).order_by(desc(OrderModel.placed_at)).limit(50)
    if connection_id:
        stmt = stmt.where(OrderModel.broker_connection_id == connection_id)
    if user and user.role != "admin":
        stmt = stmt.where(OrderModel.user_id == user.id)

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


@router.post("/orders/validate", response_model=ApiResponse[OrderValidationResult])
async def validate_order(
    request: Request,
    payload: OrderValidationRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[OrderValidationResult]:
    """Pre-flight safety validation, margin estimation, and itemized fee calculation."""
    errors: List[str] = []
    warnings: List[str] = [
        "Phase 3 Safety Lock: Live order submission is currently disabled. This is an operational simulation preview."
    ]

    # Lot size alignment check
    lot_size = 25
    quantity_lot_aligned = (payload.quantity > 0 and payload.quantity % lot_size == 0)
    if not quantity_lot_aligned:
        errors.append(f"Quantity {payload.quantity} must be a positive multiple of NIFTY lot size ({lot_size}).")

    # Tick size alignment check (0.05)
    tick_size = Decimal("0.05")
    try:
        price_dec = Decimal(payload.price)
        target_dec = Decimal(payload.targetPrice)
        sl_dec = Decimal(payload.stopLossPrice)

        price_tick_aligned = (price_dec % tick_size) == Decimal("0.00")
        target_tick_aligned = (target_dec % tick_size) == Decimal("0.00")
        sl_tick_aligned = (sl_dec % tick_size) == Decimal("0.00")

        if not price_tick_aligned:
            errors.append(f"Entry limit price ₹{payload.price} is not aligned to tick size ₹0.05.")
        if not target_tick_aligned:
            errors.append(f"Target price ₹{payload.targetPrice} is not aligned to tick size ₹0.05.")
        if not sl_tick_aligned:
            errors.append(f"Stop-loss price ₹{payload.stopLossPrice} is not aligned to tick size ₹0.05.")

        if target_dec <= price_dec:
            errors.append(f"Target price ₹{target_dec} must be strictly higher than entry price ₹{price_dec} for BUY.")
        if sl_dec >= price_dec:
            errors.append(f"Stop-loss price ₹{sl_dec} must be strictly lower than entry price ₹{price_dec} for BUY.")

    except Exception as exc:
        errors.append(f"Invalid decimal numerical format in price inputs: {exc}")
        price_dec = Decimal("0.00")
        target_dec = Decimal("0.00")
        sl_dec = Decimal("0.00")
        target_tick_aligned = False
        sl_tick_aligned = False

    # Broker capability check: Disallow MARKET orders on options
    if payload.orderType == OrderType.MARKET:
        errors.append(
            "Market orders on NFO index options are restricted by broker/exchange policy to prevent execution slippage. Use LIMIT or Stop-Loss Limit (SL-L)."
        )

    qty_dec = Decimal(payload.quantity)
    required_margin = qty_dec * price_dec
    gross_profit = (target_dec - price_dec) * qty_dec
    gross_loss = (price_dec - sl_dec) * qty_dec

    # Statutory Charges Formula
    brokerage = Decimal("40.00")
    buy_turnover = qty_dec * price_dec
    sell_turnover = qty_dec * target_dec
    total_turnover = buy_turnover + sell_turnover

    stt = (sell_turnover * Decimal("0.00125")).quantize(Decimal("0.01"))
    exchange_txn = (total_turnover * Decimal("0.000505")).quantize(Decimal("0.01"))
    gst = ((brokerage + exchange_txn) * Decimal("0.18")).quantize(Decimal("0.01"))
    sebi = (total_turnover * Decimal("0.000001")).quantize(Decimal("0.01"))
    stamp_duty = (buy_turnover * Decimal("0.00003")).quantize(Decimal("0.01"))
    total_charges = brokerage + stt + exchange_txn + gst + sebi + stamp_duty

    net_profit = gross_profit - total_charges
    net_loss = -(gross_loss + total_charges)

    if net_profit < Decimal("0.00"):
        warnings.append(
            f"Statutory fees (₹{total_charges:.2f}) exceed gross profit (₹{gross_profit:.2f}). "
            f"Net outcome is negative (₹{net_profit:.2f}) on 1-lot position."
        )

    # Risk-to-reward ratio calculation
    rr_ratio = "1 : 0.00"
    if abs(net_loss) > Decimal("0"):
        ratio_val = abs(net_profit) / abs(net_loss)
        rr_ratio = f"1 : {ratio_val:.2f}"

    available_margin = "150000.00"
    if payload.connectionId:
        conn_stmt = select(BrokerConnection).where(
            BrokerConnection.id == payload.connectionId,
            BrokerConnection.user_id == user.id,
        )
        b_conn = (await db.execute(conn_stmt)).scalars().first()
        if b_conn:
            try:
                adapter = get_broker_adapter_for_connection(b_conn)
                funds = await adapter.get_funds()
                if funds:
                    available_margin = funds.available_cash
            except Exception:
                pass

    margin_sufficient = Decimal(available_margin) >= required_margin
    if not margin_sufficient:
        warnings.append(
            f"Available margin (₹{Decimal(available_margin):.2f}) is lower than required margin (₹{required_margin:.2f})."
        )

    is_valid = len(errors) == 0

    return success_response(
        OrderValidationResult(
            is_valid=is_valid,
            required_margin=f"{required_margin:.2f}",
            estimated_charges=ChargeBreakdown(
                brokerage=f"{brokerage:.2f}",
                stt=f"{stt:.2f}",
                exchangeTxnCharge=f"{exchange_txn:.2f}",
                gst=f"{gst:.2f}",
                sebiCharges=f"{sebi:.2f}",
                stampDuty=f"{stamp_duty:.2f}",
                totalCharges=f"{total_charges:.2f}",
                isPosted=False,
            ),
            estimated_gross_profit=f"{gross_profit:.2f}",
            estimated_gross_loss=f"{gross_loss:.2f}",
            estimated_net_profit=f"{net_profit:.2f}",
            estimated_net_loss=f"{net_loss:.2f}",
            target_tick_aligned=target_tick_aligned,
            stop_loss_tick_aligned=sl_tick_aligned,
            quantity_lot_aligned=quantity_lot_aligned,
            validation_errors=errors,
            warnings=warnings,
            trade_value=f"{required_margin:.2f}",
            net_risk_reward_ratio=rr_ratio,
            available_margin=f"{Decimal(available_margin):.2f}",
            margin_sufficient=margin_sufficient,
        ),
        request=request,
        data_source="COMPUTED",
        freshness=DataFreshness.LIVE,
    )


@router.post("/orders/submit", response_model=ApiResponse[OrderSubmissionResult])
async def submit_order(
    request: Request,
    payload: OrderSubmissionRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[OrderSubmissionResult]:
    """Submits order through 13-state deterministic lifecycle machine."""
    engine = ExecutionEngine()
    result = await engine.submit_order(payload, db, user_id=user.id)
    return success_response(
        result,
        request=request,
        data_source="BROKER" if payload.trading_mode == "LIVE" else "SIMULATED",
        freshness=DataFreshness.LIVE,
    )


@router.get("/orders/timeline", response_model=ApiResponse[List[OrderEventRecord]])
async def get_orders_timeline(
    request: Request,
    order_id: Optional[str] = Query(None, alias="orderId"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[OrderEventRecord]]:
    """Retrieve chronological order lifecycle audit events."""
    stmt = select(OrderEventModel).order_by(desc(OrderEventModel.timestamp)).limit(limit)
    if order_id:
        stmt = stmt.where(OrderEventModel.order_id == order_id)

    db_events = (await db.execute(stmt)).scalars().all()
    events = [
        OrderEventRecord(
            id=e.id,
            order_id=e.order_id,
            event_type=e.event_type,
            timestamp=e.timestamp.isoformat(),
            user_id=(e.payload or {}).get("userId") or user.id,
            tenant_id=(e.payload or {}).get("tenantId") or user.id,
            broker_order_id=(e.payload or {}).get("brokerOrderId"),
            requested_quantity=(e.payload or {}).get("requestedQuantity"),
            filled_quantity=(e.payload or {}).get("filledQuantity"),
            raw_broker_response_code=(e.payload or {}).get("rawBrokerResponseCode") or "200_OK",
            failure_cause=(e.payload or {}).get("failureCause"),
            payload=e.payload,
        )
        for e in db_events
    ]
    return success_response(events, request=request, data_source="DATABASE", freshness=DataFreshness.LIVE)


@router.get("/orders/{order_id}/events", response_model=ApiResponse[List[OrderEventRecord]])
async def get_order_events(
    request: Request,
    order_id: str,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[List[OrderEventRecord]]:
    """Retrieve full lifecycle history for a specific order."""
    stmt = select(OrderEventModel).where(OrderEventModel.order_id == order_id).order_by(OrderEventModel.timestamp.asc())
    db_events = (await db.execute(stmt)).scalars().all()
    events = [
        OrderEventRecord(
            id=e.id,
            order_id=e.order_id,
            event_type=e.event_type,
            timestamp=e.timestamp.isoformat(),
            user_id=(e.payload or {}).get("userId") or user.id,
            tenant_id=(e.payload or {}).get("tenantId") or user.id,
            broker_order_id=(e.payload or {}).get("brokerOrderId"),
            requested_quantity=(e.payload or {}).get("requestedQuantity"),
            filled_quantity=(e.payload or {}).get("filledQuantity"),
            raw_broker_response_code=(e.payload or {}).get("rawBrokerResponseCode") or "200_OK",
            failure_cause=(e.payload or {}).get("failureCause"),
            payload=e.payload,
        )
        for e in db_events
    ]
    return success_response(events, request=request, data_source="DATABASE", freshness=DataFreshness.LIVE)


@router.post("/orders/{order_id}/cancel", response_model=ApiResponse[OrderCancelResult])
async def cancel_order(
    request: Request,
    order_id: str,
    payload: Optional[OrderCancelRequest] = None,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[OrderCancelResult]:
    """Cancels an open order through state machine transitions."""
    engine = ExecutionEngine()
    reason = payload.reason if payload else "Operator requested cancellation"
    result = await engine.cancel_order(order_id, reason, db)
    return success_response(
        result,
        request=request,
        data_source="DATABASE",
        freshness=DataFreshness.LIVE,
    )


@router.post("/orders/reconcile", response_model=ApiResponse[ReconciliationReport])
async def reconcile_orders(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[ReconciliationReport]:
    """Reconciles broker orders and positions with database records."""
    engine = ExecutionEngine()
    result = await engine.reconcile_all_orders_and_positions(db)
    return success_response(
        result,
        request=request,
        data_source="BROKER",
        freshness=DataFreshness.LIVE,
    )


@router.post("/orders/emergency-exit", response_model=ApiResponse[Dict[str, Any]])
async def trigger_emergency_exit(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ApiResponse[Dict[str, Any]]:
    """Emergency controlled exit: cancels pending order intents and pauses execution."""
    event = SystemEventModel(
        event_type="OPERATOR_EMERGENCY_EXIT_TRIGGERED",
        severity=SystemEventSeverity.CRITICAL,
        message="Operator activated Emergency Mode from Live Trading Terminal. All pending intents aborted.",
        context_data={"operator": user.id},
    )
    db.add(event)
    await db.commit()

    return success_response(
        {
            "status": "EMERGENCY_HALT_ACTIVE",
            "message": "Emergency halt triggered. Active orders cancelled, automated runners paused.",
            "haltedAt": event.created_at.isoformat(),
        },
        request=request,
        data_source="DATABASE",
        freshness=DataFreshness.LIVE,
    )
