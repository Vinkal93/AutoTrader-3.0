# NIFTY Auto Trader 3.0 — Pre-Production Release Checklist

> [!IMPORTANT]
> This checklist defines the mandatory pre-flight verification gates that must be completed and signed off prior to activating any deployment environment (Staging, Paper Trading, or Live Trading). LIVE trading activation requires 100% sign-off across all mandatory gates plus explicit human operator confirmation.

---

## 1. Architectural & Contract Integrity

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 1.1 | Shared Contract Package Parity | TypeScript contracts in `@autotrader/api-contracts` match backend FastAPI schemas | **PASSED** | `test_contracts_parity.js` verified 35/35 routes and enums |
| 1.2 | Decimal Financial Serialization | All currency, price, P&L, and balance fields serialized as strings (`string`) | **PASSED** | Zero IEEE-754 floating point precision errors |
| 1.3 | Passive Frontend Boundary | Browser client strictly passive; zero trading calculations in React components | **PASSED** | Codebase audit across `apps/web/src` |
| 1.4 | Backward Compatibility | All `/api/v1/*` routes adhere to standard `ApiResponse<T>` envelope | **PASSED** | Standard response wrappers in `services/api/app/routers/deps.py` |

---

## 2. Security, Authentication & Secret Hygiene

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 2.1 | Git Repository Secrets Scan | Zero passwords, API secrets, consumer keys, or access tokens in git tree | **PASSED** | Programmatic scan across git history and tree |
| 2.2 | Environment Isolation | `.env`, `.env.local`, `.env.production` strictly gitignored; `.env.example` scrubbed | **PASSED** | Verified in `.gitignore` and `test_preproduction_audit.js` |
| 2.3 | Broker Session Token Storage | Access tokens stored in-memory and encrypted database; never sent to frontend | **PASSED** | Token sanitized in `services/api/app/routers/broker.py` |
| 2.4 | HTTP Security Headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, HSTS | **PASSED** | Enforced by FastAPI middleware in `main.py` |
| 2.5 | CORS Allowlist | Restricted to authorized frontend origins (e.g. `http://localhost:3000`) | **PASSED** | Configured in `services/api/app/config.py` |
| 2.6 | Dependency Audit | 12 known upstream vulnerabilities documented in `SECURITY_REPORT.md` | **ASSESSED** | Mitigated by input validation, sandboxing, and runtime guards |

---

## 3. Order Execution & Risk Engine Invariants

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 3.1 | Four-Part LIVE Safety Lock | LIVE execution permanently locked without explicit operator secret + static IP | **PASSED** | `SafetyLockViolation` enforced in `execution_engine.py` |
| 3.2 | Exchange Lot Size Check | Order quantity must strictly be a positive multiple of 25 (NIFTY lot size) | **PASSED** | `assert quantity % 25 == 0` in pre-flight checks |
| 3.3 | Exchange Tick Size Check | Limit and trigger prices must align exactly with ₹0.05 tick increment | **PASSED** | `price % Decimal("0.05") == 0` enforced in `round_tick()` |
| 3.4 | Naked Short Selling Block | SELL orders strictly forbidden without matching open long position | **PASSED** | Over-sell prevention rule enforced in `execution_engine.py` |
| 3.5 | Order Idempotency | Unique `idempotency_key` and `client_order_id` per submission; duplicate calls rejected | **PASSED** | `EXECUTION_MUTEX` and DB index prevent race conditions |
| 3.6 | Profit Target Order Math | Limit exit calculated as confirmed fill price + ₹1.00 premium movement | **PASSED** | Unit tests in `execution-risk-engine.test.ts` |
| 3.7 | Protective Stop-Loss Math | Broker-side SL-L order placed at entry price - ₹8.00 distance | **PASSED** | Verified in `execution_engine.py` and `ORDER_LIFECYCLE.md` |
| 3.8 | Cancel-Confirm-Reconcile | Resting SL-L cancelled and confirmed before target order placed (single exit authority) | **PASSED** | `execute_target_exit_with_cancel_race_protection()` |
| 3.9 | Unprotected Position Lock | If protective SL-L fails, system trips `EngineState.RISK_LOCKED` and squares off | **PASSED** | Automated emergency procedure verified |
| 3.10 | Intraday Circuit Breakers | Max daily loss threshold (₹3,000) trips engine pause; blocks further entries | **PASSED** | Daily cumulative loss check in `execution_engine.py` |
| 3.11 | Auto Square-off Cutoff | All positions forcefully squared off at 15:15 IST (exchange intraday cutoff) | **PASSED** | Time window validated in `strategy_engine.py` |

---

## 4. Market Ingestion & Strategy Engine

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 4.1 | Exchange Calendar Awareness | Trading blocked on weekends and official NSE holidays | **PASSED** | NSE 2026 holiday calendar in `strategy_engine.py` |
| 4.2 | Completed Candle Discipline | EMA 9/21 calculated strictly using completed 5-minute candles (no in-progress bars) | **PASSED** | Candle interval validation in `strategy_engine.py` |
| 4.3 | Scheduled Run Execution | Strategy triggers at configured 12:20 PM IST window | **PASSED** | Market scheduler service |
| 4.4 | Premium Scanner Filter | NIFTY option strikes filtered strictly for ₹40–₹45 executable ask premium | **PASSED** | Option chain scanner logic verified |
| 4.5 | Duplicate Run Prevention | Single execution cycle permitted per trading day; duplicate runs blocked | **PASSED** | `DailyRunRecord` constraint in database |
| 4.6 | Zero Mock Policy | Disconnected broker reports `BrokerConnectionState.NOT_CONFIGURED` with `UNAVAILABLE` | **PASSED** | Tested in `data-freshness-indicator.test.tsx` |

---

## 5. Monitoring, Watchdog & Fault Tolerance

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 5.1 | Independent Watchdog Process | Watchdog monitors worker heartbeat from isolated thread/service | **PASSED** | `services/api/app/services/monitoring_service.py` |
| 5.2 | Heartbeat Stall Detection | Heartbeat missing for >15s trips `WORKER_HEARTBEAT_TIMEOUT` | **PASSED** | Verified in `test_preproduction_audit.js` |
| 5.3 | Market Feed Staleness Guard | Market quotes older than 30s block new entries with `MARKET_FEED_STALE` | **PASSED** | Staleness threshold enforced |
| 5.4 | Order Feed Disconnect Alert | Disconnection of WebSocket/order feed triggers immediate critical alert | **PASSED** | `ORDER_FEED_DISCONNECTED` event generated |
| 5.5 | Alert Storm Deduplication | Alerts grouped in 300s window to prevent operator notification flooding | **PASSED** | Deduplication cache in `MonitoringService` |
| 5.6 | Multi-Channel Notifications | Webhook, Email, and SMS/Telegram delivery dispatch with retry tracking | **PASSED** | Delivery audit log in `notifications` router |
| 5.7 | Startup Reconciliation | System queries broker orders and positions upon restart before resuming | **PASSED** | `reconcile_startup_state()` in `execution_engine.py` |
| 5.8 | Broker Disconnect Caveat | System clearly warns operator: Watchdog cannot close trades if broker is offline | **PASSED** | Prominently displayed in UI Emergency Modal & Runbook |

---

## 6. Financial Accounting & Compliance

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 6.1 | Realized P&L Integrity | Gross P&L calculated strictly from confirmed broker fills and quantities | **PASSED** | Verified in `financial-accounting.test.ts` |
| 6.2 | Statutory Charges Breakdown | Brokerage, STT, Exchange fees, SEBI charges, Stamp Duty, GST calculated | **PASSED** | 6-tier statutory fee engine in `financial_accounting.py` |
| 6.3 | Fee Label Truthfulness | Actual broker charges distinguished from calculated estimates | **PASSED** | `FeeSource` tags (`BROKER_ACTUAL` vs `CALCULATED_ESTIMATE`) |
| 6.4 | Funds vs Margin Separation | Available cash, utilized margin, and ledger balance never conflated | **PASSED** | Separate fields in `AccountFundsResponse` |
| 6.5 | Trade Ledger Reconciliation | Supports official contract-note reconciliation and discrepancy auditing | **PASSED** | Contract note reconciler in `financial_accounting.py` |
| 6.6 | Audit Trail Retention | All orders, executions, status transitions, and risk events persisted | **PASSED** | Append-only event logs in PostgreSQL schema |

---

## 7. Infrastructure, Deployment & Rollback

| # | Check Item | Requirement / Verification Target | Status | Sign-off Evidence |
|---|---|---|---|---|
| 7.1 | Multi-Service Vercel Config | Web frontend and backend API configured in root `vercel.json` | **PASSED** | Verified multi-service rewrite rules |
| 7.2 | Static-IP VPS Deployment | Systemd service units and static-IP whitelist ready for production | **PASSED** | Deployment scripts in `infrastructure/deployment/` |
| 7.3 | Database Migrations | Alembic migrations bidirectional (`upgrade` and `downgrade`) | **PASSED** | Clean Alembic environment in `services/api/alembic` |
| 7.4 | Next.js Production Build | Web dashboard builds cleanly with all 14 routes statically optimized | **PASSED** | `npm run build:web` generated 14/14 static pages |
| 7.5 | Web Test Suite Pass Rate | 75/75 automated unit and component tests passing | **PASSED** | `npm run test:web` (10 test files) |
| 7.6 | Rollback Protocol | Emergency rollback script and backup restoration documented | **PASSED** | Documented in `INCIDENT_RESPONSE_RUNBOOK.md` |

---

## Pre-Production Release Sign-off Verdict

| Operational Mode | Readiness Status | Action Required Prior to Live |
|---|---|---|
| **PAPER TRADING** | **READY FOR ACTIVATION (GO)** | None. All risk gates, order state machines, and analytics verified. |
| **LIVE TRADING** | **LOCKED / ON HOLD (CONDITIONAL NO-GO)** | Requires operator static IP verification, production Kotak Neo broker credentials, and explicit consent token injection. |
