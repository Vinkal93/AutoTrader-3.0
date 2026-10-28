"""Integration tests verifying all API endpoints conform to contracts."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_endpoint_contracts_and_security_headers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        assert "X-Request-ID" in res.headers
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"

        body = res.json()
        assert body["success"] is True
        assert "meta" in body
        assert "requestId" in body["meta"]
        assert body["data"]["version"] == "3.0.0"
        assert "database" in body["data"]["checks"]
        assert "broker" in body["data"]["checks"]

        # 2. System status
        res = await client.get("/api/v1/system/status")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "tradingMode" in body["data"]
        assert "engineState" in body["data"]
        assert "brokerConnection" in body["data"]

        # 3. Broker connection
        res = await client.get("/api/v1/broker/connection")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["brokerName"] == "Kotak Neo"

        # 4. Account funds (honest None when disconnected)
        res = await client.get("/api/v1/account/funds")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["meta"]["freshness"] == "UNAVAILABLE"

        # 5. Positions (empty list when disconnected)
        res = await client.get("/api/v1/positions")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert isinstance(body["data"], list)

        # 6. Orders
        res = await client.get("/api/v1/orders")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert isinstance(body["data"], list)

        # 7. Trades
        res = await client.get("/api/v1/trades")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert isinstance(body["data"], list)

        # 8. Market Nifty quote (honest null)
        res = await client.get("/api/v1/market/nifty")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["meta"]["freshness"] == "UNAVAILABLE"

        # 9. Strategies
        res = await client.get("/api/v1/strategies")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert len(body["data"]) >= 1

        # 10. Active strategy
        res = await client.get("/api/v1/strategies/active")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["config"]["underlying"] == "NIFTY"

        # 11. Dashboard overview
        res = await client.get("/api/v1/dashboard/overview")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "engineState" in body["data"]
        assert "tradingMode" in body["data"]
        assert "recentEvents" in body["data"]

        # 12. System events
        res = await client.get("/api/v1/system/events")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "pagination" in body
        assert isinstance(body["data"], list)


@pytest.mark.asyncio
async def test_mode_switch_blocked_for_live_when_risk_unconfigured():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Attempt to switch to LIVE mode without configured risk limits
        res = await client.post("/api/v1/system/mode", json={"mode": "LIVE", "reason": "Testing live block"})
        assert res.status_code == 400
        body = res.json()
        assert body["success"] is False
        assert "risk limits are unconfigured" in body["error"]["message"].lower() or "broker is not connected" in body["error"]["message"].lower()
