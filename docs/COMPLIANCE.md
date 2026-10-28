# Regulatory & Algorithmic Trading Compliance (COMPLIANCE.md)

> Governance and regulatory compliance manual for **NIFTY Auto Trader 3.0** under Securities and Exchange Board of India (SEBI) and Indian stock exchange guidelines.

---

## 1. Regulatory Context & Framework

Automated trading in Indian securities markets is subject to oversight by SEBI and the participating exchanges (National Stock Exchange of India - NSE, BSE). The system adheres to all regulatory requirements governing automated trading interfaces, retail API access, and financial SaaS operations.

### Key Regulatory Directives
- **SEBI Circular CIR/MRD/DP/09/2012** (Guidelines on Algorithmic Trading in Indian Securities Market).
- **SEBI Circular SEBI/HO/MRD/DP/CIR/P/2018/101** (Broadening of Algorithmic Trading Framework & System Audits).
- **Exchange Circulars on API Architecture for Retail Investors** (Mandating dedicated client Demat/Trading account association, two-factor authentication, and static-IP compliance where applicable).

---

## 2. Core Compliance Principles

### 2.1 Direct Client Demat Account Association (No Pooled Accounts)
- Every transaction submitted by the platform operates exclusively on the individual trader's personal, KYC-verified trading account opened with a registered stockbroker.
- **Strict Prohibition of Pooling**: NIFTY Auto Trader 3.0 never holds, pools, transfers, or escrows client funds or securities. All capital allocations, margins, and settlements occur strictly between the trader and their registered broker.

### 2.2 Independent Trader Authority & Execution Gate
- In accordance with retail algorithmic trading compliance, each tenant explicitly activates, configures, and authorizes their execution parameters.
- **Rule 21**: Live order placement and automated execution remain locked until the trader completes required onboarding acknowledgments and the administrative compliance verification passes.

### 2.3 Static-IP Egress Compliance
- Brokers requiring static IP whitelisting for order execution (e.g. Kotak Neo Trade API) mandate that orders originate from registered IP addresses to prevent unauthorized dispatch.
- **Rule 20**: The platform enforces dedicated egress IP routing for static-IP bound brokers and verifies IP alignment before order submission.

### 2.4 Credential & Session Governance
- **Rule 18**: The platform does not collect or store client broker passwords, MPINs, or TOTP seeds in plain text. Broker-hosted OAuth 2.0 authorization is prioritized.
- Ephemeral session tokens expire automatically within the broker-mandated timeframes (typically daily market close).

---

## 3. Truth in Financial Reporting & Disclosures

### 3.1 Zero-Mock Financial Policy
- **Rule 12**: Synthetic or mock financial numbers are strictly prohibited outside automated unit test fixtures.
- If a broker connection drops or market data is unavailable, the UI must display truthful disconnected states (`"Broker Disconnected"`, `"Data Unavailable"`).

### 3.2 Transparent Fee Accounting
- **Rule 23**: The platform never presents estimated charges as broker-confirmed charges.
- The UI and API distinguish clearly between:
  1. **Broker-Confirmed Charges**: Realized brokerage and statutory deductions extracted from official broker contract notes or tradebook APIs.
  2. **Estimated Calculations**: Real-time indicative tariff calculations (Brokerage ₹20, STT 0.125% on sell, GST 18%, Stamp Duty 0.003%, SEBI turnover fees) displayed prior to contract note generation.

### 3.3 No Guarantee Disclaimers
- **Rule 25**: The platform, marketing materials, and UI never make claims of guaranteed profits, guaranteed fills, or risk-free stop-loss protection.
- Options trading involves substantial market risk, execution slippage, and potential loss of capital.

---

## 4. Mandatory Risk Disclosure Statement

The following disclosure is rendered prominently across the onboarding flow and live trading terminal:

> [!CAUTION]
> **STATUTORY RISK DISCLOSURE**:
> 1. Derivatives (Options and Futures) are leveraged financial instruments that carry a high degree of capital risk. It is possible to lose more than the initial capital invested.
> 2. Algorithmic and automated trading strategies are subject to technological risks including network latency, exchange disconnects, broker session expiration, and rapid market fluctuations.
> 3. Historical backtest performance does not guarantee future financial returns. Past profits are not indicative of future market outcomes.
> 4. Stop-loss orders are not guaranteed to execute at the exact trigger price during volatile market sessions or circuit-limit price jumps (execution slippage).
> 5. NIFTY Auto Trader 3.0 is a technological software utility and does not provide investment advisory or portfolio management services.

---

## 5. Audit Trail & Data Retention

Under exchange compliance standards, all trading-related telemetry must be retained for at least **5 years**:
1. **Order Timelines**: Timestamped records of order creation, validation, submission, broker acknowledgment, fills, and cancellations.
2. **Strategy Run Logs**: Snapshot of the exact versioned strategy parameters (`config_json`) active during every execution cycle.
3. **Session Events**: IP addresses, session initiation timestamps, and operator identity for every action.
4. **Reconciliation Audits**: Automated cross-referencing records between broker order books and local database ledgers.
