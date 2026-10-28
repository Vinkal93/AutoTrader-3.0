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
- [ADR-008: Multi-Tenancy Architecture & Row-Level Isolation](#adr-008-multi-tenancy-architecture--row-level-isolation)
- [ADR-009: Multi-Broker Unified Adapter Pattern & Canonical Interface](#adr-009-multi-broker-unified-adapter-pattern--canonical-interface)
- [ADR-010: Per-Tenant Execution Lease and Isolated Runner](#adr-010-per-tenant-execution-lease-and-isolated-runner)
- [ADR-011: Envelope Encryption for Broker Credentials & OAuth Tokens](#adr-011-envelope-encryption-for-broker-credentials--oauth-tokens)
- [ADR-012: SEBI Retail Algo & Static IP Isolation Architecture](#adr-012-sebi-retail-algo--static-ip-isolation-architecture)
- [ADR-013: Subscription & Feature-Gate Architecture](#adr-013-subscription--feature-gate-architecture)
- [ADR-014: Standardized Genuine System States](#adr-014-standardized-genuine-system-states)

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
- SQLAlchemy 2.0 async engine (`asyncpg`) manages relational database queries without blocking.

### Consequences
- **Positive**: Python's mathematical ecosystem makes financial modeling trivial, while FastAPI + Pydantic v2 achieves high concurrency and type consistency.
- **Negative**: Requires dual-language maintenance between TypeScript (frontend & contracts) and Python (backend & worker).

---

## ADR-003: Monorepo Organization with Shared API Contracts

### Status
Accepted

### Context
Discrepancies between frontend TypeScript types and backend Python models cause runtime serialization errors, silent schema drift, and difficult-to-debug UI anomalies.

### Decision
Structure the codebase as a **npm workspace monorepo** with a dedicated `@autotrader/api-contracts` package as the single source of truth for all schemas, enums, endpoints, and response payloads.
- Backend Pydantic models must strictly mirror the contracts package.
- CI includes a automated parity check script (`test_contracts_parity.js`).

### Consequences
- **Positive**: Eliminates runtime type divergence and ensures all services remain aligned on API envelopes.
- **Negative**: Package dependencies must be built before running workspace type checks.

---

## ADR-004: PostgreSQL with SQLAlchemy 2.x and Alembic for Financial State

### Status
Accepted

### Context
Financial transactions, account ledgers, and trade cycles demand ACID transactions, strict referential integrity, and exact monetary decimal precision.

### Decision
Adopt **PostgreSQL 16** with **SQLAlchemy 2.x asyncpg** and **Alembic** migrations.
- Exact monetary precision using `NUMERIC(15, 4)` and lot multiples.
- Centralized UTC ISO 8601 timestamps.
- Zero destructive schema alterations in production.

---

## ADR-005: Two-Tier Authentication (Supabase for App, Kotak Neo SDK for Broker)

### Status
Accepted

### Context
Separating application access identity from broker trading sessions ensures user safety, role delegation, and compliance.

### Decision
Implement a two-tier authentication architecture:
- Tier 1: Supabase Auth for platform identity, issuing RS256 JWTs.
- Tier 2: Broker-specific session authentication for execution.

---

## ADR-006: Read-Only Phase 1 Order Lock and Zero-Mock Financial Data Integrity

### Status
Accepted

### Context
Live execution during initial development carries capital risk.

### Decision
Enforce a strict read-only lock on live broker order dispatch in Phase 1, combined with a Zero-Mock policy prohibiting synthetic numbers in production.

---

## ADR-007: Distributed Lock and Heartbeat for Single-Worker Guarantee

### Status
Accepted

### Context
Concurrently running worker processes could cause double-execution of orders.

### Decision
Implement Redis-backed single-leader mutex locks and 5-second worker heartbeats.

---

## ADR-008: Multi-Tenancy Architecture & Row-Level Isolation

### Status
Accepted (SaaS Transformation)

### Context
We are transforming the single-trader system into a multi-user SaaS for independent traders and trading desks. The platform must guarantee that no trader can access, inspect, or influence another trader's funds, positions, strategies, orders, or broker sessions.

### Decision
Adopt a **Single Database, Shared Schema with Non-Nullable `tenant_id` Foreign Keys and Authoritative Backend Scoping**:
1. Introduce `tenants`, `tenant_memberships`, and `subscriptions` entities.
2. Add non-nullable `tenant_id` foreign keys to all trading, accounting, and incident tables.
3. FastAPI dependency injection resolves `current_tenant` directly from validated Supabase Auth JWTs.
4. All database queries must authoritatively include `WHERE tenant_id = :current_tenant_id`. Client-supplied tenant filters are strictly disallowed.

### Consequences
- **Positive**: High operational efficiency, cost-effective database scaling, unified migrations, and strict architectural isolation.
- **Negative**: Requires rigorous automated testing to prevent any query omitting the `tenant_id` clause.

---

## ADR-009: Multi-Broker Unified Adapter Pattern & Canonical Interface

### Status
Accepted (SaaS Transformation)

### Context
Independent traders utilize different brokers (Kotak Neo, Zerodha Kite, Upstox, Angel One, Dhan, Fyers). Hardcoding to one broker limits the platform's reach.

### Decision
Implement the **`AbstractBrokerAdapter` Canonical Interface**:
- Standardize order placement, cancellation, positions, funds, quotes, and option chains behind normalized contracts.
- Encapsulate broker-specific quirks, WebSocket protocols, and error responses inside isolated adapter classes (`KotakNeoAdapter`, `ZerodhaKiteAdapter`, `UpstoxAdapter`, etc.).

### Consequences
- **Positive**: Platform engine code remains completely agnostic of the underlying broker. New brokers can be added without altering trading logic.
- **Negative**: Feature differences across brokers (e.g. SL-L vs STOPLOSS_LIMIT, level-2 depth) require capability flagging in the Broker Matrix.

---

## ADR-010: Per-Tenant Execution Lease and Isolated Runner

### Status
Accepted (SaaS Transformation)

### Context
In a multi-tenant SaaS, a global worker lock would force all traders into sequential processing or cause one tenant's error to halt the entire system.

### Decision
Transition from a global leader lock to **Per-Tenant Distributed Leases in Redis (`autotrader:{tenant_id}:worker:lease`)**:
- Each tenant's strategy runner executes in an isolated sandbox.
- Rate-limit violations or broker disconnections in Tenant A do not affect Tenant B.

### Consequences
- **Positive**: High fault isolation, linear horizontal scalability, and independent tenant operation.
- **Negative**: Requires worker manager to maintain multiple concurrent tenant event loops.

---

## ADR-011: Envelope Encryption for Broker Credentials & OAuth Tokens

### Status
Accepted (SaaS Transformation)

### Context
Storing broker API secrets or OAuth refresh tokens in plaintext is a severe security vulnerability. Furthermore, Rule 18 mandates that client passwords, MPINs, or TOTP seeds must not be collected in plaintext.

### Decision
Implement **AES-256-GCM Envelope Encryption**:
- A Master Key encrypts tenant-specific Data Encryption Keys (DEKs).
- Stored tokens and secrets are encrypted with the tenant DEK and stored as ciphertext blobs.
- Sentry and logging systems filter all sensitive fields.

### Consequences
- **Positive**: Protects broker credentials from database compromises; complies with Indian cybersecurity standards.
- **Negative**: Cryptographic decrypt step required upon worker session initialization.

---

## ADR-012: SEBI Retail Algo & Static IP Isolation Architecture

### Status
Accepted (SaaS Transformation)

### Context
SEBI and exchange regulations prohibit routing unrelated traders' order flow through a single shared static IP without broker authorization.

### Decision
Implement **Tenant-Dedicated Egress Routing for Static-IP Brokers**:
- For static-IP bound brokers (Kotak Neo, Angel One), orders egress through tenant-specific Cloud NAT or dedicated elastic IPs.
- Pre-flight checks verify egress IP alignment with the broker whitelist before order dispatch.
- OAuth-native brokers without static IP restrictions route through standard SaaS egress.

### Consequences
- **Positive**: 100% compliant with SEBI retail algo directives.
- **Negative**: Requires infrastructure management for multiple static IP allocations for higher-tier subscribers.

---

## ADR-013: Subscription & Feature-Gate Architecture

### Status
Accepted (SaaS Transformation)

### Context
Commercial SaaS operations require differentiated service tiers (FREE, STARTER, PRO, ENTERPRISE) with enforced limits on broker accounts, concurrent strategies, and execution priority.

### Decision
Implement **Database-Backed Subscriptions & Feature-Gate Middleware**:
- Store tenant plan tier, quotas, and expiry in `subscriptions`.
- Gateway middleware and worker pre-flight routines enforce plan quotas before allowing operations.
- The `FREE` tier allows unlimited paper trading but locks live broker order dispatch.

### Consequences
- **Positive**: Clean monetization foundation and clear boundaries between simulation and live execution.
- **Negative**: Feature gates must be verified across both API and frontend UI.

---

## ADR-014: Standardized Genuine System States

### Status
Accepted (SaaS Transformation)

### Context
Rule 24 mandates truthful system and broker connection reporting without artificial masks or fake fallbacks.

### Decision
Adopt the standardized set of genuine connection states:
`NOT_CONFIGURED`, `ACCESS_PENDING`, `LOADING`, `READY`, `STALE`, `NOT_CONNECTED`, `ERROR`, and `UNSUPPORTED`.
- Frontend badges and indicators map 1:1 to these states.

### Consequences
- **Positive**: Truthful operational transparency and superior user trust.
- **Negative**: Requires exhaustive UI handling for each distinct state.
