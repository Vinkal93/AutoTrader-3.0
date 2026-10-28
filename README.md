# NIFTY Auto Trader 3.0

> Production-grade automated NIFTY options trading platform engineered for high reliability, financial precision, and rigorous risk control.

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](file:///d:/Coding/Auto%20Trader%203.0/package.json)
[![Phase](https://img.shields.io/badge/phase-1--read--only-green.svg)](file:///d:/Coding/Auto%20Trader%203.0/docs/PHASE_STATUS.md)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#)

---

## 1. Project Overview

**NIFTY Auto Trader 3.0** is an enterprise-grade automated trading platform tailored specifically for NIFTY Index Options on the National Stock Exchange (NSE) and NSE FO (NFO) segments. 

The system automates systematic options trading strategies (such as 12:20 PM IST trend-following momentum breakouts with dynamic strike selection and strict risk management), leveraging direct integration with the **Kotak Neo API** over static-IP infrastructure.

### Core Architecture Philosophy
1. **Authoritative Backend**: The trading server and worker processes maintain complete control over all trading decisions, risk limits, position tracking, and execution logic. The web client is strictly an observational and supervisory control pane.
2. **Zero-Mock Financial Telemetry**: In production and development runtime, the system never presents artificial mock numbers or synthetic account metrics. If a broker session is absent or expired, the platform explicitly displays unconfigured or disconnected states.
3. **Phased Safety Rollout**:
   - **Phase 1 (Current)**: Read-only foundation, account telemetry ingestion, historical and real-time market data quotes, immutable strategy configuration, and distributed single-worker failover. Live order placement is locked by design.
   - **Phase 2 (Upcoming)**: Paper trading simulation, execution intent generation, and gated live order placement with dual-key confirmation.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Dashboard** | [Next.js 14+](https://nextjs.org) (App Router), TypeScript, TailwindCSS | Observational UI, active telemetry, strategy viewer, control switches |
| **Shared Contracts** | TypeScript packages (`@autotrader/api-contracts`, `@autotrader/ui-tokens`) | Shared schema definitions, API routes, design tokens, error models |
| **Backend REST API** | [FastAPI](https://fastapi.tiangolo.com) 0.111+, Pydantic v2, Python 3.11+ | High-performance async API gateway, auth validation, broker proxy |
| **Trading Worker** | Python AsyncIO, Custom State Machine Engine | Background execution engine, leader election, heartbeats, reconciler |
| **Database** | [PostgreSQL 16](https://www.postgresql.org) with asyncpg, SQLAlchemy 2.x | Relational storage for trades, orders, audit logs, strategy versions |
| **Migrations** | [Alembic](https://alembic.sqlalchemy.org) | Declarative, version-controlled relational schema migrations |
| **Cache & Locks** | [Redis 7](https://redis.io) | Distributed leader lock, distributed pub/sub, quote caching |
| **Authentication** | [Supabase Auth](https://supabase.com) (JWT) + Kotak Neo Session | Two-tier authentication (application access vs broker order execution) |
| **Broker SDK** | Official [Kotak Neo API SDK](https://github.com/kotak-neo) | NSE/NFO market feed and trading interface |

---

## 3. Monorepo Directory Structure

```
d:\Coding\Auto Trader 3.0\
├── apps/
│   └── web/                   # Next.js 14 App Router dashboard & controls
├── packages/
│   ├── api-contracts/         # Shared TypeScript interfaces, enums, & API routes
│   └── ui-tokens/             # Design tokens: palette, spacing, typography, finance tokens
├── services/
│   ├── api/                   # FastAPI REST gateway and database management
│   │   ├── app/               # Application routes, models, schemas, and dependencies
│   │   └── requirements.txt   # Python API dependencies
│   └── trading_worker/        # Authoritative background trading execution worker
│       ├── worker/            # State machine engine, leader lock, heartbeat manager
│       └── requirements.txt   # Python worker dependencies
├── infrastructure/
│   ├── docker/                # Multi-container Docker configuration
│   │   ├── docker-compose.yml # Compose config for PostgreSQL, Redis, API, Worker
│   │   ├── Dockerfile.api     # Multi-stage container build for FastAPI service
│   │   └── Dockerfile.worker  # Container build for trading worker daemon
│   └── deployment/            # Production deployment scripts, systemd units, VPS configs
├── tests/
│   ├── api/                   # FastAPI route and integration test suite
│   ├── web/                   # Web interface unit and component test suites
│   ├── integration/           # Cross-service end-to-end integration tests
│   └── e2e/                   # Full browser end-to-end scenarios
├── docs/                      # Architectural, technical, and operational specifications
├── .env.example               # Template environment configuration variables
├── AGENTS.md                  # Operational directives for AI agents and developers
├── README.md                  # This file
└── package.json               # Monorepo workspaces definition
```

---

## 4. Quickstart Guide

### 4.1 Prerequisites
- **Node.js**: `v20.0.0` or higher (`npm v10+`)
- **Python**: `3.11` or higher
- **Docker & Docker Compose**: Docker Desktop or Docker Engine `v24+`
- **PostgreSQL**: `16` (if running locally without Docker)
- **Redis**: `7` (optional for local dev, mandatory for clustered worker locking)

---

### 4.2 Environment Configuration
Clone the repository and create your local environment file:
```bash
cp .env.example .env
```
Inspect `.env` and verify key configuration options:
- `DATABASE_URL`: Defaults to `postgresql+asyncpg://autotrader:localdev@localhost:5432/autotrader`.
- `REDIS_URL`: Defaults to `redis://localhost:6379/0`.
- `KOTAK_NEO_*`: Enter your Kotak Neo API Consumer Key and credentials. *(Leave placeholder if evaluating in disconnected mode)*.

---

### 4.3 Option A: Quickstart with Docker Compose (Recommended)
You can bring up the entire infrastructure stack (PostgreSQL, Redis, FastAPI, Worker) in one step:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build -d
```

Verify service status:
```bash
docker compose -f infrastructure/docker/docker-compose.yml ps
```

The services will be accessible at:
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Endpoint**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **PostgreSQL**: `localhost:5432` (database: `autotrader`, user: `autotrader`)
- **Redis**: `localhost:6379`

---

### 4.4 Option B: Manual Local Setup (Step-by-Step)

#### Step 1: Start PostgreSQL and Redis
If not using installed system daemons, launch database and redis containers:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
```

#### Step 2: Build Shared Packages & Frontend
Install workspace dependencies and build packages:
```bash
# From the repository root
npm install

# Build shared API contracts
npm run contracts:build

# Start Next.js development server
npm run dev:web
```
The Next.js web application is now available at [http://localhost:3000](http://localhost:3000).

#### Step 3: Setup Backend API
In a new terminal window:
```bash
# Navigate to the API service directory
cd services/api

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 4: Setup Trading Worker Daemon
In another terminal window:
```bash
# Navigate to the worker directory
cd services/trading_worker

# Activate your virtual environment
# Windows: ..\api\venv\Scripts\activate
# Linux/macOS: source ../api/venv/bin/activate

# Start the worker process
python -m worker.main
```

---

## 5. Phase 1 Scope & Status

The system is currently operating in **Phase 1: Read-Only Foundation & Telemetry**.

### What Is Delivered in Phase 1:
- [x] **Monorepo Architecture**: Clean separation between frontend, backend, worker, shared contracts, and design tokens.
- [x] **PostgreSQL Financial Schema**: Comprehensive 21-table schema covering users, accounts, positions, orders, trade cycles, strategies, audit logs, and worker heartbeats.
- [x] **Shared API Contracts**: End-to-end type safety between FastAPI and Next.js via TypeScript contracts.
- [x] **Kotak Neo Read-Only Broker Adapter**: Real-time retrieval of account funds, positions, orders, trades, NIFTY spot quotes, and option chains.
- [x] **Strategy Configuration Model**: Versioned, immutable strategy parameter templates with validation gates.
- [x] **Trading Engine State Machine**: Comprehensive state engine (`STOPPED`, `STARTING`, `READY`, `RUNNING`, `PAUSED`, `RECONCILING`, `DEGRADED`, `ERROR`, `RISK_LOCKED`).
- [x] **Distributed Heartbeat & Single-Worker Lock**: Ensures zero split-brain execution across worker instances.
- [x] **Design System & Observational UI**: Institutional dark-mode design system with real-time freshness telemetry and zero synthetic data.

### Strict Safety Lock (Out of Scope for Phase 1):
- `TradingMode.LIVE` execution is permanently blocked by state machine validation rules.
- Order submission methods (`place_order`, `modify_order`, `cancel_order`) reject execution in Phase 1.
- Live order execution will only be unlocked in **Phase 2** after dual-key authorization and risk sign-off.

---

## 6. Running Tests

### Shared Contract Tests:
```bash
npm run contracts:check
```

### Frontend Tests & Type Checking:
```bash
npm run type-check:web
npm run test:web
```

### Backend API Tests:
```bash
cd services/api
pytest -v
```

### Trading Worker Tests:
```bash
cd services/trading_worker
pytest -v
```

---

## 7. Documentation Suite

For detailed architecture diagrams, database schemas, and implementation guides, refer to the documentation suite in [docs/](file:///d:/Coding/Auto%20Trader%203.0/docs):

1. [AGENTS.md](file:///d:/Coding/Auto%20Trader%203.0/AGENTS.md) — Mandatory developer & AI agent operational instructions.
2. [docs/ARCHITECTURE.md](file:///d:/Coding/Auto%20Trader%203.0/docs/ARCHITECTURE.md) — System architecture, state machine, and data flow.
3. [docs/DATABASE.md](file:///d:/Coding/Auto%20Trader%203.0/docs/DATABASE.md) — 21-table relational schema, indexes, and migration rules.
4. [docs/API_CONTRACTS.md](file:///d:/Coding/Auto%20Trader%203.0/docs/API_CONTRACTS.md) — Versioned REST API endpoints, schemas, and freshness contracts.
5. [docs/DESIGN_SYSTEM.md](file:///d:/Coding/Auto%20Trader%203.0/docs/DESIGN_SYSTEM.md) — Visual tokens, component specifications, and copy guidelines.
6. [docs/STRATEGY_CONFIG.md](file:///d:/Coding/Auto%20Trader%203.0/docs/STRATEGY_CONFIG.md) — 12:20 PM strategy rules, risk parameters, and immutability.
7. [docs/BROKER_INTEGRATION.md](file:///d:/Coding/Auto%20Trader%203.0/docs/BROKER_INTEGRATION.md) — Kotak Neo SDK guide, auth flow, and Phase 1 safety lock.
8. [docs/SECURITY.md](file:///d:/Coding/Auto%20Trader%203.0/docs/SECURITY.md) — Auth architecture, static-IP whitelisting, and secrets hygiene.
9. [docs/PHASE_STATUS.md](file:///d:/Coding/Auto%20Trader%203.0/docs/PHASE_STATUS.md) — Phase 1 verification scorecard and Phase 2 checklist.
10. [docs/DECISIONS.md](file:///d:/Coding/Auto%20Trader%203.0/docs/DECISIONS.md) — Architecture Decision Records (ADR-001 through ADR-007).
