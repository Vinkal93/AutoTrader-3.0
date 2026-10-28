"""Tests for BrokerAdapter and KotakNeoAdapter ensuring zero fabricated financial data."""

import pytest
from app.broker.kotak_neo import KotakNeoAdapter
from app.models.enums import BrokerConnectionState


@pytest.mark.asyncio
async def test_unconfigured_adapter_returns_truthful_state():
    adapter = KotakNeoAdapter(
        consumer_key=None,
        consumer_secret=None,
        mobile_number=None,
        password=None,
    )

    status = await adapter.connection_status()
    assert status.state == BrokerConnectionState.NOT_CONFIGURED
    assert status.broker_name == "Kotak Neo"
    assert status.static_ip_compliant is None
    assert "not configured" in status.last_error.lower()


@pytest.mark.asyncio
async def test_disconnected_adapter_never_fabricates_financial_data():
    adapter = KotakNeoAdapter(
        consumer_key=None,
        consumer_secret=None,
        mobile_number=None,
        password=None,
    )

    # Funds must be None when not connected
    funds = await adapter.get_funds()
    assert funds is None

    # Positions must be empty list
    positions = await adapter.get_positions()
    assert positions == []

    # Orders must be empty list
    orders = await adapter.get_orders()
    assert orders == []

    # Quotes must be None
    quotes = await adapter.get_quotes()
    assert quotes is None

    # Option chain must be None
    chain = await adapter.get_option_chain()
    assert chain is None


@pytest.mark.asyncio
async def test_phase_1_order_execution_is_strictly_locked():
    adapter = KotakNeoAdapter()

    # Attempting to place order must raise NotImplementedError
    with pytest.raises(NotImplementedError) as exc_info:
        adapter.place_order(symbol="NIFTY", quantity=50, side="BUY")
    assert "locked in Phase 1" in str(exc_info.value)

    # Attempting to cancel order must raise NotImplementedError
    with pytest.raises(NotImplementedError) as exc_info:
        adapter.cancel_order(order_id="12345")
    assert "locked in Phase 1" in str(exc_info.value)


@pytest.mark.asyncio
async def test_disconnect_lifecycle():
    adapter = KotakNeoAdapter()
    status = await adapter.disconnect()
    assert status.state in (BrokerConnectionState.NOT_CONFIGURED, BrokerConnectionState.DISCONNECTED)
    assert status.market_feed_status == "DISCONNECTED"
