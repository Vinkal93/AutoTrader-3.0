"""Tests verifying schema serialization, camelCase aliasing, and API contract fidelity."""

from datetime import datetime, timezone
import pytest
from app.models.enums import (
    BrokerConnectionState,
    DataFreshness,
    EngineState,
    Exchange,
    InstrumentType,
    OptionType,
    OrderSide,
    OrderStatus,
    OrderType,
    SystemEventSeverity,
    TradingMode,
)
from app.schemas.account import AccountFundsResponse, Order, Position, Trade
from app.schemas.broker import BrokerConnectionResponse
from app.schemas.common import ApiResponse, ResponseMeta
from app.schemas.dashboard import DashboardOverview, SystemEvent
from app.schemas.health import HealthResponse, SystemStatusResponse
from app.schemas.strategy import StrategyConfig


def test_api_response_envelope_camelcase():
    meta = ResponseMeta(
        request_id="req_test_123",
        timestamp=datetime.now(timezone.utc).isoformat(),
        data_source="DATABASE",
        freshness=DataFreshness.LIVE,
    )
    resp = ApiResponse[str](
        success=True,
        data="hello",
        meta=meta,
    )
    dumped = resp.model_dump(by_alias=True)

    assert "requestId" in dumped["meta"]
    assert "dataSource" in dumped["meta"]
    assert dumped["meta"]["requestId"] == "req_test_123"
    assert dumped["success"] is True
    assert dumped["data"] == "hello"


def test_account_funds_schema_decimal_strings():
    now_iso = datetime.now(timezone.utc).isoformat()
    funds = AccountFundsResponse(
        available_cash="150000.5000",
        used_margin="25000.0000",
        available_margin="125000.5000",
        total_collateral="50000.0000",
        unrealized_pnl="1250.0000",
        realized_pnl_today="3500.0000",
        as_of=now_iso,
        freshness=DataFreshness.LIVE,
    )
    dumped = funds.model_dump(by_alias=True)

    assert dumped["availableCash"] == "150000.5000"
    assert dumped["usedMargin"] == "25000.0000"
    assert dumped["realizedPnlToday"] == "3500.0000"
    assert dumped["freshness"] == "LIVE"


def test_position_schema_camelcase():
    pos = Position(
        id="pos_1",
        instrument_token="26000",
        trading_symbol="NIFTY24OCT25000CE",
        exchange=Exchange.NFO,
        instrument_type=InstrumentType.OPTIONS,
        option_type=OptionType.CE,
        strike_price="25000.00",
        expiry_date="2026-10-29",
        quantity=50,
        average_price="42.50",
        last_price="44.00",
        pnl="75.00",
        pnl_percentage="3.53",
        day_pnl="75.00",
        side=OrderSide.BUY,
        product="NRML",
    )
    dumped = pos.model_dump(by_alias=True)

    assert dumped["instrumentToken"] == "26000"
    assert dumped["tradingSymbol"] == "NIFTY24OCT25000CE"
    assert dumped["optionType"] == "CE"
    assert dumped["averagePrice"] == "42.50"
    assert dumped["lastPrice"] == "44.00"
    assert dumped["pnlPercentage"] == "3.53"


def test_order_and_trade_schema_structure():
    now_iso = datetime.now(timezone.utc).isoformat()
    order = Order(
        id="ord_1",
        broker_order_id="BROKER_ORD_999",
        trading_symbol="NIFTY24OCT25000CE",
        exchange=Exchange.NFO,
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=50,
        filled_quantity=50,
        price="42.50",
        status=OrderStatus.FILLED,
        placed_at=now_iso,
        updated_at=now_iso,
        idempotency_key="idemp_key_1",
    )
    dumped_ord = order.model_dump(by_alias=True)
    assert dumped_ord["brokerOrderId"] == "BROKER_ORD_999"
    assert dumped_ord["filledQuantity"] == 50
    assert dumped_ord["idempotencyKey"] == "idemp_key_1"

    trade = Trade(
        id="trd_1",
        order_id="ord_1",
        broker_trade_id="BTRD_888",
        trading_symbol="NIFTY24OCT25000CE",
        exchange=Exchange.NFO,
        side=OrderSide.BUY,
        quantity=50,
        price="42.50",
        trade_time=now_iso,
    )
    dumped_trd = trade.model_dump(by_alias=True)
    assert dumped_trd["brokerTradeId"] == "BTRD_888"
    assert dumped_trd["tradeTime"] == now_iso


def test_strategy_config_defaults():
    cfg = StrategyConfig()
    dumped = cfg.model_dump(by_alias=True)

    assert dumped["underlying"] == "NIFTY"
    assert dumped["entryTimeIST"] == "12:20"
    assert dumped["premiumMin"] == "40.00"
    assert dumped["premiumMax"] == "45.00"
    assert dumped["targetPremiumMove"] == "1.00"
    assert dumped["initialStopLoss"] == "3.00"
    assert dumped["candleInterval"] == "5m"
    assert dumped["maxTradesPerDay"] == 1
    assert dumped["lotCount"] == 1
    assert dumped["sidewaysAction"] == "SKIP"
    assert dumped["maxRiskPerTrade"] is None
