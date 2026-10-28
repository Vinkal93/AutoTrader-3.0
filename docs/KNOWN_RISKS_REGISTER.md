# NIFTY Auto Trader 3.0 — Known Risks Register

> [!WARNING]
> Algorithmic options trading involves substantial financial risk. Even with rigorous pre-flight validation, independent watchdog monitoring, and multi-state order machines, edge conditions in network routing, exchange matching engines, and broker infrastructure can introduce financial exposure. This register documents all recognized risks and their mitigation protocols.

---

## 1. Risk Heat Map & Summary

| Inherent Severity | Low Likelihood | Medium Likelihood | High Likelihood |
|---|---|---|---|
| **CRITICAL** | RISK-01: Exchange Flash Crash / Gap-Down<br>RISK-04: Broker Complete Blackout In-Position | RISK-02: Protective Stop-Loss Fill Race<br>RISK-03: Kotak Neo API Degradation / Latency | — |
| **HIGH** | RISK-06: VPS Static IP Elastic Deallocation | RISK-05: Kotak Session Mid-Day Invalidation<br>RISK-07: Incomplete Candle Data Gap | RISK-08: Option Spread Widening at Low Liquidity |
| **MEDIUM** | RISK-10: Upstream Next.js Vulnerabilities | RISK-09: Notification Delivery Latency | RISK-11: Database Vacuum / Disk Full |
| **LOW** | RISK-12: Time Drift / NTP Desynchronization | — | — |

---

## 2. Detailed Risk Catalog

### RISK-01: Exchange Gap-Down Below Stop-Loss Trigger (Slippage / Gap Risk)
- **Category**: Market / Execution
- **Inherent Severity**: **CRITICAL** | **Likelihood**: Low
- **Description**: After buying an option at ₹42, a sudden market drop causes the underlying option to gap from ₹36 down to ₹31 without printing ticks at the SL-L trigger price (₹34). Because the order is a Stop-Loss Limit (SL-L), the limit price might not be executed if the market trades below the limit floor.
- **Detection**: Order remains in `OPEN` state while market price is significantly lower than trigger price.
- **Mitigation**:
  1. Protective SL-L limit price is placed 20 paise below trigger price (`stop_price - 0.20`) to allow execution tolerance.
  2. Watchdog monitors execution status; if SL-L is triggered but unexecuted after 5 seconds, an emergency market order is dispatched to terminate open exposure.
- **Residual Risk**: **MEDIUM** (Sudden illiquid market freeze can still cause slippage beyond ₹8.00).

---

### RISK-02: Target Exit vs Stop-Loss Fill Race Condition
- **Category**: Order State Machine
- **Inherent Severity**: **CRITICAL** | **Likelihood**: Medium
- **Description**: Target exit (+₹1.00) is triggered. The system dispatches a cancellation for the resting protective SL-L order. Before the cancellation reaches the exchange matching engine, a rapid drop triggers the SL-L fill. If the system then sends a target SELL order, an accidental naked short option position would be created.
- **Detection**: `execute_target_exit_with_cancel_race_protection()` queries broker orderbook before placing target SELL.
- **Mitigation**:
  1. Strictly follows **Cancel-Confirm-Reconcile** protocol.
  2. Cancellation must be positively acknowledged by Kotak Neo API before any target order is placed.
  3. If reconciliation detects that the stop-loss was filled during the cancellation transit, target submission is halted immediately and trade is marked `STOP_LOSS_FILLED_IN_RACE`.
- **Residual Risk**: **LOW**.

---

### RISK-03: Kotak Neo API Rate Limiting & Latency Spikes
- **Category**: Broker Infrastructure
- **Inherent Severity**: **CRITICAL** | **Likelihood**: Medium
- **Description**: Kotak Neo API experiences response times exceeding 5–10 seconds or returns HTTP 429 (Too Many Requests) during volatile market opens or major news events.
- **Detection**: API client measures round-trip latency; timeout occurs after 10 seconds.
- **Mitigation**:
  1. Strategy executes only once per day at 12:20 PM IST (avoiding market open 09:15 burst traffic).
  2. Order submission is serialized via `EXECUTION_MUTEX` with zero parallel duplicate polling.
  3. Automatic backoff and single query orderbook reconciliation.
- **Residual Risk**: **MEDIUM**.

---

### RISK-04: Broker Complete Blackout While In-Position
- **Category**: Broker Connectivity
- **Inherent Severity**: **CRITICAL** | **Likelihood**: Low
- **Description**: Kotak Securities infrastructure crashes completely or becomes unreachable via internet while a trade cycle is active (`IN_POSITION`).
- **Detection**: Watchdog detects heartbeat failure or HTTP 503/504 errors on consecutive health checks.
- **Mitigation**:
  1. The automated system **CANNOT** close positions if the broker API is dead.
  2. High-priority SMS and Webhook alerts are immediately broadcast to the operator.
  3. Emergency runbook mandates immediate manual telephone square-off via Kotak Securities Dealing Desk (`1800-209-9191`).
- **Residual Risk**: **HIGH** (Requires human operator response via phone).

---

### RISK-05: Mid-Day Broker Session Invalidation
- **Category**: Authentication / Broker
- **Inherent Severity**: **HIGH** | **Likelihood**: Medium
- **Description**: Kotak Neo session token expires prematurely or is revoked due to concurrent login from another device.
- **Detection**: API calls return HTTP 401 Unauthorized; connection state shifts to `BrokerConnectionState.DISCONNECTED`.
- **Mitigation**:
  1. System inhibits all new entry order submissions.
  2. Operator is alerted immediately with 2FA TOTP re-authentication link.
  3. Pre-flight checks at 12:15 PM IST (5 minutes prior to strategy trigger) verify token freshness.
- **Residual Risk**: **LOW**.

---

### RISK-06: VPS Static IP Deallocation / Route Mismatch
- **Category**: Network / Compliance
- **Inherent Severity**: **HIGH** | **Likelihood**: Low
- **Description**: Cloud hosting provider reassigns or loses the static IP address required by Kotak Neo API white-listing rules.
- **Detection**: Kotak Neo API rejects requests with IP authorization error.
- **Mitigation**:
  1. Production deployment binds to dedicated AWS Elastic IP or DigitalOcean Reserved IP.
  2. Backend pre-flight check validates public IP against configured whitelist before attempting strategy run.
- **Residual Risk**: **LOW**.

---

### RISK-07: Incomplete Candle Data or Missing 5-Minute Bar
- **Category**: Strategy Engine
- **Inherent Severity**: **HIGH** | **Likelihood**: Medium
- **Description**: Feed drops or exchange delay causes a 5-minute candle to arrive with missing ticks, resulting in false EMA 9/21 crossover signals.
- **Detection**: Strategy candle validator checks timestamp continuity and requires exactly 75 complete 5-minute bars between 09:15 and 12:20 IST.
- **Mitigation**:
  1. Any missing, corrupt, or future-dated candle immediately invalidates the strategy run.
  2. System records `STRATEGY_SKIPPED` with reason `INCOMPLETE_CANDLE_DATA`.
- **Residual Risk**: **LOW**.

---

### RISK-08: Option Bid-Ask Spread Widening (Execution Slippage)
- **Category**: Market Liquidity
- **Inherent Severity**: **HIGH** | **Likelihood**: High
- **Description**: During sharp market movement, the ask price jumps from ₹42 to ₹46 or the bid-ask spread widens beyond ₹1.50, causing poor fill quality.
- **Detection**: Premium scanner checks real-time executable ask and bid-ask spread percentage.
- **Mitigation**:
  1. Only contracts with executable ask strictly between ₹40.00 and ₹45.00 are qualified.
  2. Spread filter rejects contracts where `(ask - bid) > 1.00`.
  3. Orders are submitted as LIMIT orders at the scanned ask price; market orders are strictly forbidden for entry.
- **Residual Risk**: **LOW**.

---

### RISK-09: Push Notification Gateway Failure
- **Category**: Infrastructure
- **Inherent Severity**: **MEDIUM** | **Likelihood**: Medium
- **Description**: External notification provider (Telegram API, Twilio, SendGrid) experiences downtime or delivers alerts with a multi-minute delay.
- **Detection**: Notification delivery service tracks HTTP dispatch status and marks failures in `notification_deliveries` database table.
- **Mitigation**:
  1. Multi-channel redundancy: Alerts are sent to Webhook, Email, and Telegram simultaneously.
  2. Automated retry loop with exponential backoff.
  3. In-app real-time incident toast notifications displayed on the passive web dashboard.
- **Residual Risk**: **LOW**.

---

### RISK-10: Upstream Next.js 14 Framework Advisories
- **Category**: Software Supply Chain
- **Inherent Severity**: **MEDIUM** | **Likelihood**: Low
- **Description**: `npm audit` identifies vulnerabilities in `next@14.2.35` (Server Action DoS, remote image optimization memory consumption).
- **Detection**: Automated pre-production security audit suite (`test_preproduction_audit.js`).
- **Mitigation**:
  1. Web app is deployed behind an authenticated reverse proxy (Nginx / Cloudflare).
  2. Next.js Server Actions and image optimizer remote domains are disabled.
  3. Upgrade to Next.js 15+ planned for v3.1 release milestone following React 19 ecosystem stabilization.
- **Residual Risk**: **MINIMAL**.

---

### RISK-11: PostgreSQL Disk Space Exhaustion / Connection Pool Starvation
- **Category**: Database
- **Inherent Severity**: **MEDIUM** | **Likelihood**: Low
- **Description**: Continuous high-frequency logging of market ticks or system events exhausts database disk storage or connection limits.
- **Detection**: Watchdog checks PostgreSQL connection pool availability and storage usage.
- **Mitigation**:
  1. System does not persist raw tick data permanently; only 5-minute candles and trade events are stored.
  2. Connection pool configured with sensible limits (`pool_size=10, max_overflow=20`).
  3. Automated 90-day retention and log rotation policy.
- **Residual Risk**: **LOW**.

---

### RISK-12: Server System Clock Drift
- **Category**: Operating System
- **Inherent Severity**: **LOW** | **Likelihood**: Low
- **Description**: VPS system time drifts by several seconds, causing strategy execution to trigger at 12:19:55 or 12:20:05 IST instead of exact 12:20:00.
- **Detection**: Watchdog checks NTP synchronization delta against external time servers.
- **Mitigation**:
  1. `systemd-timesyncd` / `chrony` NTP service enabled on host VPS.
  2. Strategy scheduler permits execution only when current completed candle timestamp matches 12:20:00 IST.
- **Residual Risk**: **MINIMAL**.
