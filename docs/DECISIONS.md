# Architecture Decision Records (DECISIONS.md)

> Formal register of Architectural Decision Records (ADRs) establishing the technical and operational foundations of **NIFTY Auto Trader 3.0**.

---

## Index of Decisions

- [ADR-001: Next.js App Router for Web Frontend](#adr-001-nextjs-app-router-for-web-frontend)
- [ADR-002: Python FastAPI for Authoritative Trading Backend](#adr-002-python-fastapi-for-authoritative-trading-backend)
- [ADR-003: Monorepo Organization with Shared API Contracts](#adr-003-monorepo-organization-with-shared-api-contracts)
- [ADR-004: PostgreSQL with SQLAlchemy 2.x and Alembic for Financial State](#adr-004-postgresql-with-sqlalchemy-2x-and-alembic-for-financial-state)
- [ADR-005: Two-Tier Authentication (Supabase for App, Kotak Neo SDK for Broker)](#adr-005-two-tier-authentication-supabase-for-app-kotak-neo-sdk-for-broker)
- [ADR-006: Read-Only Phase 1 Order Lock and Zero-Mock Financial Data Integrity](#adr-006-read-only-phase-1-order-lock-and-zero-mock-financial-data-integrity)
- [ADR-007: Distributed Lock and Heartbeat for Single-Worker Guarantee](#adr-007-distributed-lock-and-heartbeat-for-single-worker-guarantee)

---

## ADR-001: Next.js App Router for Web Frontend

### Status
Accepted

### Context
We required a modern, reactive web framework to construct an institutional trading cockpit. The frontend must display high-frequency market quotes, account telemetry, option chain ladders, and supervisory controls with sub-second rendering and robust type safety.

### Decision
Adopt **Next.js 14+ with the App Router**, React Server Components (RSC), and TypeScript.
- Server components handle initial server-side hydration of static dashboards and layout shells.
- Client components (`'use client'`) manage real-time ticker subscriptions, tab navigation, and interactive modal dialogs.
- Tailored styling via TailwindCSS and central tokens from `@autotrader/ui-tokens`.

### Consequences
- **Positive**: Exceptional developer ergonomics, native streaming, instant server hydration, and unified TypeScript ecosystem shared with contracts.
- **Negative**: Requires careful boundary management between server and client components to prevent unintended client bundle bloat.

---

## ADR-002: Python FastAPI for Authoritative Trading Backend

### Status
Accepted

### Context
The backend must run high-precision numerical computations (EMAs, option Greeks, tick alignments), interface with the official Python-native broker SDK (`kotak-neo-api`), expose asynchronous REST APIs, and coordinate state machines without blocking I/O loops.

### Decision
Adopt **Python 3.11+ with FastAPI and Pydantic v2** as the core backend stack.
- FastAPI delivers asynchronous HTTP handling with native OpenAPI documentation.
- Pydantic v2 provides high-speed C-based validation mirroring shared TypeScript contracts.
- AsyncIO coordinates parallel market quote retrieval, database persistence, and broker calls.

### Consequences
- **Positive**: Native compatibility with scientific and quantitative libraries (NumPy, Pandas, TA-Lib), official Kotak Neo SDK support, and rapid endpoint development.
- **Negative**: Python requires disciplined typing and async discipline to ensure event loop responsiveness under load.

---

## ADR-003: Monorepo Organization with Shared API Contracts

### Status
Accepted

### Context
In distributed trading architectures, schema drift between frontend client code and backend server logic can lead to severe operational failures (e.g. malformed order payloads, misplaced decimal points, or mismatched enum states).

### Decision
Establish an **npm-managed monorepo** containing:
- Shared TypeScript contracts in `packages/api-contracts`.
- Shared UI styling tokens in `packages/ui-tokens`.
- Backend FastAPI models in `services/api/app/models` strictly mirroring TypeScript definitions.

### Consequences
- **Positive**: Eliminates schema discrepancies at compile-time. Updates to API models are version-controlled in the same commit across frontend and backend.
- **Negative**: Requires synchronized build steps (`npm run contracts:build`) prior to frontend bundling.

---

## ADR-004: PostgreSQL with SQLAlchemy 2.x and Alembic for Financial State

### Status
Accepted

### Context
Financial trading systems demand ACID compliance, strict referential integrity, exact decimal arithmetic, and deterministic transactional rollbacks. Document or NoSQL stores lack relational constraints and risk silent data loss during concurrent write operations.

### Decision
Utilize **PostgreSQL 16** with **SQLAlchemy 2.x Async ORM** and **asyncpg**, managed via version-controlled **Alembic** migrations.
- Exact monetary precision enforced via `NUMERIC(15, 4)` columns.
- All timestamps recorded with timezone (`TIMESTAMPTZ`) normalized to UTC.
- Normalized 21-table schema tracking every trade lifecycle event, order fill, and audit action.

### Consequences
- **Positive**: Total data durability, transactional integrity for financial entries, and clear migration history.
- **Negative**: Schema changes require explicit migration scripts and cannot be modified casually at runtime.

---

## ADR-005: Two-Tier Authentication (Supabase for App, Kotak Neo SDK for Broker)

### Status
Accepted

### Context
A trading application has two distinct security boundaries:
1. Identifying and authorizing human operators accessing the administrative web console.
2. Authorizing trade execution with the exchange regulatory gateway.
Conflating these credentials creates severe attack surfaces.

### Decision
Decouple identity management into a **Two-Tier Authentication Model**:
- **Tier 1 (Application)**: Supabase Auth handles user identity, issuance of RS256 JWTs, password resets, and role assignments (`ADMIN`, `OPERATOR`, `AUDITOR`).
- **Tier 2 (Broker)**: Kotak Neo SDK manages broker API session generation using Consumer Key, Secret, and ephemeral interactive TOTP entered at market open. Broker secrets are never exposed to the client browser.

### Consequences
- **Positive**: Compromise of a web user session cannot independently place trades without an active broker 2FA session. Broker credentials remain secure on the backend server.
- **Negative**: Requires operators to perform a two-step authentication ritual each morning before trading begins.

---

## ADR-006: Read-Only Phase 1 Order Lock and Zero-Mock Financial Data Integrity

### Status
Accepted

### Context
Deploying an algorithmic options trading platform directly into live execution carries catastrophic risk of capital destruction from software defects, unvalidated market data, or accidental configuration mistakes.

### Decision
Enforce a **Strict Read-Only Phase 1 Policy**:
1. All broker order submission methods (`place_order`, `modify_order`, `cancel_order`) are hard-locked with safety assertions that abort execution.
2. In runtime and production, synthetic mock data is completely forbidden. If broker connections are inactive, the system honestly presents `NOT_CONFIGURED` or `DISCONNECTED` states with `DataFreshness.UNAVAILABLE`.

### Consequences
- **Positive**: Guarantees zero risk of accidental financial loss during development and initial deployment. Forces developers to build resilient error-handling for real-world disconnection scenarios.
- **Negative**: Live order execution cannot be tested until Phase 2 is formally initiated.

---

## ADR-007: Distributed Lock and Heartbeat for Single-Worker Guarantee

### Status
Accepted

### Context
In automated options trading, multiple worker processes running concurrently ("split-brain") could evaluate the same signal and place duplicate orders, doubling risk exposure and violating daily loss limits.

### Decision
Implement a **Redis-backed Single-Leader Distributed Mutex with Worker Heartbeats**:
- The active trading worker acquires a leader lock key (`autotrader:worker:leader`) with a 15-second TTL using atomic `SET NX EX`.
- Every 5 seconds, the worker renews the TTL and records its status in the `worker_heartbeats` database table.
- Standby workers monitor the lock; if the primary worker crashes or hangs for > 15 seconds, the lock expires, enabling a clean failover after state reconciliation.

### Consequences
- **Positive**: Prevents duplicate trade execution under all normal and failover operational conditions.
- **Negative**: Introduces Redis as a high-availability dependency for multi-worker deployment clusters (with standalone fallback available for isolated single-node dev).
