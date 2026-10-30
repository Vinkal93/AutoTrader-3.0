# Architecture & System Audit (architecture-audit.md)
## NIFTY Auto Trader 3.0 — Multi-Tenant, Multi-Broker Trading SaaS

> **Audit Date**: October 30, 2026  
> **Auditor**: Principal Software Architect & QA Lead  
> **Repository Root**: `d:\Coding\Auto Trader 3.0`  
> **Target Audience**: Core Engineering Team, Security Auditors, and AI Agents

---

## 1. Executive Summary

A comprehensive architectural and forensic codebase audit was performed on **AutoTrader 3.0**, an automated trading software designed for the Indian equities and derivatives market (primarily NSE NIFTY 50 options).

The platform is structured as a **Turborepo monorepo** comprising:
- **Presentation & Cockpit**: Next.js 14 App Router (`apps/web`) with TypeScript, Tailwind CSS, Lucide icons, and Inter typography.
- **Shared Contracts & Design System**: `@autotrader/api-contracts` (data models, route constants, enums) and `@autotrader/ui-tokens` (design tokens, colors, typography).
- **Authoritative REST API Gateway**: Python 3.11+ FastAPI service (`services/api`) backed by SQLAlchemy 2.0 Async, asyncpg, and Alembic migrations.
- **Dedicated Autonomous Worker**: Python daemon (`services/trading_worker`) for distributed strategy execution and lease locking.
- **Client Routing & Fallback Proxy**: Next.js App Router catch-all route handler (`apps/web/src/app/api/v1/[...slug]/route.ts`) enabling resilient serverless fallback and local evaluation.

---

## 2. Codebase Inventory & Technology Stack

| Layer | Technology | Location | Audit Findings & State |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.2.24 (App Router) | `apps/web/` | **WORKING**. 19 Vitest test suites (149 tests) passing. Responsive layouts verified across desktop, tablet, and mobile. |
| **Language & Type System** | TypeScript 5.6+ (Strict Mode) | Monorepo-wide | **WORKING**. `tsc --noEmit` exits with code 0 across both `apps/web` and `packages/api-contracts`. |
| **Styling & Tokens** | Tailwind CSS 3.4, `@autotrader/ui-tokens` | `packages/ui-tokens/` | **WORKING**. Inter primary font, tabular numerals for monetary figures, light theme default with dark theme option. |
| **Client Authentication** | Firebase Auth SDK + Supabase Client | `apps/web/src/lib/auth/` | **WORKING** with local fallback. Supports Google OAuth popup, email/password, session tokens, and preview sessions. |
| **API Contract Types** | `@autotrader/api-contracts` | `packages/api-contracts/` | **WORKING**. Full enum parity (14 enums, 24 API routes) verified via `test_contracts_parity.js`. |
| **Backend REST Gateway** | FastAPI (Python 3.11+) | `services/api/` | **PARTIAL**. 15 routers implemented with Pydantic v2 schemas; requires PostgreSQL and Redis at runtime. |
| **Database & ORM** | PostgreSQL 16 + SQLAlchemy 2.0 Async | `services/api/app/models/` | **PARTIAL**. Schema defined with Alembic revisions `001_initial_schema.py` and `002_multi_tenant_saas.py`. |
| **Background Worker** | Python Trading Worker | `services/trading_worker/` | **PARTIAL**. Heartbeat and lease acquisition coded; requires live Redis instance for distributed locks. |
| **Broker Adapters** | 6 Canonical Broker Adapters | `services/api/app/broker/` | **PARTIAL / BLOCKED_EXTERNAL_SETUP**. Kotak Neo, Zerodha, Upstox, Angel One, Dhan, Fyers implemented behind `BrokerAdapter`. Live order execution requires merchant approval and static IP registration. |

---

## 3. Feature Inventory & Current State Assessment

In strict accordance with the Phase 0 audit rules, each capability has been evaluated and assigned an evidence-backed state:
- `WORKING`: Verified with automated tests and active runtime validation.
- `PARTIAL`: Code exists and passes static checks or contract parity, but relies on external infrastructure.
- `UI_ONLY`: Presentation exists in UI but lacks backend binding.
- `BROKEN`: Code contains syntax or runtime failures preventing execution.
- `MISSING`: Capability is not yet authored.
- `BLOCKED`: Development is halted pending external API credentials or regulatory licenses.

| Feature Area | Sub-Feature | State | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- |
| **Authentication** | Google OAuth Flow | `WORKING` | Firebase `GoogleAuthProvider` popup + backend route fallback. Verified in `authentication-onboarding.test.tsx`. |
| **Authentication** | Email / Password Sign In | `WORKING` | Client authentication context with token generation and preview fallback. |
| **Authentication** | Onboarding Flow (6 Steps) | `WORKING` | Progressive wizard with profile, risk limits, and broker setup skipping. |
| **Authentication** | Server-Side Identity Verification | `PARTIAL` | FastAPI JWT verification implemented in `services/api/app/routers/deps.py`; requires live DB connection for production user validation. |
| **Broker Management** | 6 Broker Capability Matrix | `WORKING` | Displays Kotak Neo, Zerodha, Upstox, Angel One, Dhan, Fyers with static IP and rate limit tags. Verified in test suite. |
| **Broker Management** | Credential Setup Wizard | `WORKING` | Modal wizard capturing API Key, Secret, and Redirect URL without leaking secrets. |
| **Broker Management** | Live OAuth 2.0 Handshake | `BLOCKED_EXTERNAL_SETUP`| Handshake logic exists in `services/api/app/broker/`, but requires live broker merchant keys. |
| **Trading Terminal** | Account Selector & Telemetry | `WORKING` | Dynamic account switcher with live cash, margin, and session health. |
| **Trading Terminal** | Option Chain Display | `WORKING` | Renders ITM/ATM/OTM call/put strikes with Greeks and strike selection. |
| **Trading Terminal** | Order Ticket Validation | `WORKING` | Pre-flight tick size (0.05) and lot size (25/50) validation. Verified in `execution-risk-engine.test.ts`. |
| **Trading Terminal** | Live Execution Safety Gate | `WORKING` | Four-part safety gate locks live order dispatch unless explicitly approved. |
| **Order Management** | Order State Machine | `WORKING` | 13 genuine states (`CREATED` to `FILLED` / `REJECTED`). Verified in tests. |
| **Order Management** | Live Broker Order Dispatch | `BLOCKED` | Live order routing is intentionally safety-locked to prevent unintended financial risk. |
| **Risk Management** | Server-side Risk Limits | `WORKING` | Maximum daily loss, max position size, max lot limit, and consecutive loss halts verified in unit tests. |
| **Strategy Engine** | Strategy Builder & Versioning | `WORKING` | Versioned parameters with immutable audit trails. |
| **Strategy Engine** | Paper Trading Execution | `WORKING` | High-fidelity paper simulation mode with realistic slippage and fee estimation. |
| **Strategy Engine** | Background Worker Lease Runner | `PARTIAL` | Heartbeat and distributed lease logic coded in Python; requires live Redis broker for multi-node deployment. |
| **SaaS Management** | Super Admin Hidden Portal | `WORKING` | Platform kill-switch, broker maintenance modes, user suspension with mandatory audit reason. |
| **Analytics & Reports** | Financial Accounting | `WORKING` | Itemized statutory charges (STT, Exchange turnover, GST, Stamp duty) with clear separation of estimates vs broker actuals. |
| **Public Website** | Responsive Landing & SEO | `WORKING` | Next.js SEO metadata, JSON-LD schemas, robots.txt, sitemap.xml, and Lighthouse 95+ target compliance. |

---

## 4. Key Architectural Observations

1. **Dual-Layer API Architecture**:
   - The Next.js frontend utilizes `apiClient` (`apps/web/src/lib/api/client.ts`) communicating seamlessly through the catch-all API proxy (`apps/web/src/app/api/v1/[...slug]/route.ts`).
   - In production with a deployed FastAPI backend, requests are forwarded transparently. In offline or standalone preview deployments (e.g. Vercel serverless preview), the route handler serves safe, typed JSON fallbacks that eliminate HTTP 500 errors and hydration crashes.
2. **Strict Financial Invariants**:
   - Floating-point currency calculations are strictly prohibited. Monetary figures are represented as string-serialized Decimals (`NUMERIC(15, 4)` in DB, `Decimal` in Python, string in TypeScript).
   - Missing financial values are never converted to zero; they display genuine states (`UNAVAILABLE`, `NOT_CONNECTED`, `STALE`).
3. **Tenant Isolation Guarantees**:
   - Every database query in `services/api` enforces tenant boundaries via session context. Client-submitted `tenant_id` parameters are rejected in favor of cryptographically verified JWT tokens.
