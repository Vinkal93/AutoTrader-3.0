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

        # 13. Analytics Performance
        res = await client.get("/api/v1/analytics/performance?timeframe=TODAY")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["timeframe"] == "TODAY"
        assert "winRate" in body["data"]
        assert "grossPnl" in body["data"]
        assert "netPnl" in body["data"]

        # 14. Analytics Risk
        res = await client.get("/api/v1/analytics/risk")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "realizedLossToday" in body["data"]

        # 15. Trade Cycles
        res = await client.get("/api/v1/trade-cycles")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "pagination" in body
        assert isinstance(body["data"], list)

        # 16. Engine state transition
        res = await client.post("/api/v1/system/engine-state", json={"state": "PAUSED", "reason": "Test pause"})
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["engineState"] == "PAUSED"

        # 17. Scanner
        res = await client.get("/api/v1/market/scanner")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "status" in body["data"]
        assert "selectionReason" in body["data"]

        # 18. Market Trend
        res = await client.get("/api/v1/market/trend")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "state" in body["data"]
        assert "trendDirection" in body["data"]

        # 19. Order Validation
        order_payload = {
            "instrumentToken": "26001",
            "tradingSymbol": "NIFTY26OCT24500CE",
            "optionType": "CE",
            "side": "BUY",
            "quantity": 25,
            "price": "42.50",
            "targetPrice": "43.50",
            "stopLossPrice": "39.50",
        }
        res = await client.post("/api/v1/orders/validate", json=order_payload)
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["isValid"] is True
        assert body["data"]["targetTickAligned"] is True
        assert body["data"]["quantityLotAligned"] is True
        assert "estimatedCharges" in body["data"]

        # 20. Emergency Exit
        res = await client.post("/api/v1/orders/emergency-exit")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["data"]["status"] == "EMERGENCY_HALT_ACTIVE"

        # 21. Strategy Active & Versions
        strat_res = await client.get("/api/v1/strategies/active")
        assert strat_res.status_code == 200
        strat_id = strat_res.json()["data"]["id"]

        ver_res = await client.get(f"/api/v1/strategies/{strat_id}/versions")
        assert ver_res.status_code == 200
        assert isinstance(ver_res.json()["data"], list)

        # 22. Strategy Schedule
        sched_res = await client.get(f"/api/v1/strategies/{strat_id}/schedule")
        assert sched_res.status_code == 200
        sched_body = sched_res.json()["data"]
        assert "nextRunIST" in sched_body
        assert "scheduledTimeIST" in sched_body

        # 23. Strategy Evaluate
        eval_res = await client.post(f"/api/v1/strategies/{strat_id}/evaluate?force=true")
        assert eval_res.status_code == 200
        eval_body = eval_res.json()["data"]
        assert "decision" in eval_body
        assert "reason" in eval_body

        # 24. Strategy Runs
        runs_res = await client.get(f"/api/v1/strategies/{strat_id}/runs")
        assert runs_res.status_code == 200
        assert isinstance(runs_res.json()["data"], list)

        # 25. Strategy Backtest
        bt_res = await client.post("/api/v1/strategies/backtest", json={"symbol": "NIFTY", "interval": "5m"})
        assert bt_res.status_code == 200
        assert "tradeSignals" in bt_res.json()["data"]


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
