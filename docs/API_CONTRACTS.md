# API Contracts Specification (API_CONTRACTS.md)
## NIFTY Auto Trader 3.0 — Multi-Tenant, Multi-Broker Trading SaaS

> Canonical REST API routes, shared envelopes, data types, and status enumerations for **NIFTY Auto Trader 3.0**.

---

## 1. Unified Response Envelope

All API endpoints return data wrapped in the canonical `ApiResponse<T>` envelope or `PaginatedResponse<T>` envelope.

### 1.1 Single Resource Envelope (`ApiResponse<T>`)
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "requestId": "req_a1b2c3d4e5f6",
    "timestamp": "2026-10-28T10:15:00.000Z",
    "asOf": "2026-10-28T10:15:00.000Z",
    "lastSyncedAt": "2026-10-28T10:15:00.000Z",
    "dataSource": "BROKER",
    "freshness": "LIVE"
  }
}
```

### 1.2 Paginated Resource Envelope (`PaginatedResponse<T>`)
```json
{
  "success": true,
  "data": [ ... ],
  "error": null,
  "meta": { ... },
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 142,
    "totalPages": 3
  }
}
```

---

## 2. Standardized Status Enumerations

### 2.1 Genuine System & Broker Connection States (Rule 24)
```typescript
export const BrokerConnectionState = {
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  ACCESS_PENDING: 'ACCESS_PENDING',
  LOADING: 'LOADING',
  READY: 'READY',
  STALE: 'STALE',
  NOT_CONNECTED: 'NOT_CONNECTED',
  ERROR: 'ERROR',
  UNSUPPORTED: 'UNSUPPORTED',
} as const;
```

### 2.2 Supported Brokers
```typescript
export const SupportedBroker = {
  KOTAK_NEO: 'KOTAK_NEO',
  ZERODHA_KITE: 'ZERODHA_KITE',
  UPSTOX: 'UPSTOX',
  ANGEL_ONE: 'ANGEL_ONE',
  DHAN: 'DHAN',
  FYERS: 'FYERS',
} as const;
```

### 2.3 Tenant Roles & Subscription Tiers
```typescript
export const TenantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TRADER: 'TRADER',
  VIEWER: 'VIEWER',
} as const;

export const SubscriptionTier = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;
```

---

## 3. Canonical REST API Endpoints

### 3.1 Authentication & Multi-Tenant Workspaces
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new independent trader | Public |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile | Authenticated |
| `GET` | `/api/v1/tenants` | List all tenant memberships for user | Authenticated |
| `POST` | `/api/v1/tenants` | Create new trading desk / organization | Authenticated |
| `GET` | `/api/v1/tenants/current` | Active tenant context & role details | Tenant Scoped |
| `PUT` | `/api/v1/tenants/current` | Update tenant details & settings | Tenant Admin |
| `GET` | `/api/v1/tenants/current/members`| List members of active tenant | Tenant Scoped |
| `POST` | `/api/v1/tenants/current/invites`| Invite member to active tenant | Tenant Admin |

### 3.2 Multi-Broker Account Management
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/brokers` | List connected broker accounts for tenant | Tenant Scoped |
| `POST` | `/api/v1/brokers` | Add new broker account configuration | Tenant Admin |
| `GET` | `/api/v1/brokers/{id}/connect` | Initiate OAuth redirect or 2FA flow | Tenant Admin |
| `POST` | `/api/v1/brokers/{id}/oauth/callback`| Handle OAuth 2.0 authorization code | Authenticated |
| `POST` | `/api/v1/brokers/{id}/reconnect` | Renew daily session / refresh token | Tenant Admin |
| `POST` | `/api/v1/brokers/{id}/disconnect`| Terminate active broker session | Tenant Admin |
| `GET` | `/api/v1/brokers/{id}/status` | Connection state, feed status, IP compliance | Tenant Scoped |

### 3.3 Account Telemetry & Risk Governance
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/account/funds` | Available cash, used margin, snapshots | Tenant Scoped |
| `GET` | `/api/v1/positions` | Real-time open positions & unrealized P&L | Tenant Scoped |
| `GET` | `/api/v1/risk/allowance` | Daily loss limits, cushion, circuit status | Tenant Scoped |
| `POST` | `/api/v1/risk/emergency-halt` | Manual circuit-breaker activation | Tenant Trader |

### 3.4 Market Data & Telemetry
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/market/nifty` | Real-time NIFTY 50 spot quote & change | Tenant Scoped |
| `GET` | `/api/v1/market/candles` | 1m, 5m, 15m historical/live candlesticks | Tenant Scoped |
| `GET` | `/api/v1/market/option-chain` | Strike ladder, bid/ask depth, CE/PE quotes | Tenant Scoped |
| `GET` | `/api/v1/market/scanner` | Rule-based premium candidates (₹40-₹45) | Tenant Scoped |

### 3.5 Order Execution & Trade Cycles
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/validate` | Pre-flight validation (funds, risk, tick) | Tenant Scoped |
| `POST` | `/api/v1/orders` | Submit order (Paper simulation / Live gate)| Tenant Trader |
| `GET` | `/api/v1/orders` | List open and past orders with state history| Tenant Scoped |
| `POST` | `/api/v1/orders/{id}/cancel` | Request order cancellation | Tenant Trader |
| `GET` | `/api/v1/trades` | Reconciled trade cycles & itemized charges | Tenant Scoped |
| `GET` | `/api/v1/trades/{id}` | Detailed execution timeline for cycle | Tenant Scoped |

### 3.6 Strategy Configuration & Automation
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/strategies/active` | Active strategy config & version metadata | Tenant Scoped |
| `PUT` | `/api/v1/strategies/active` | Update parameters (creates version snapshot)| Tenant Trader |
| `GET` | `/api/v1/strategies/versions` | Immutable version snapshot ledger | Tenant Scoped |
| `POST` | `/api/v1/strategies/evaluate` | Trigger evaluation routine for tenant | Tenant Trader |
| `GET` | `/api/v1/strategies/schedule` | Market calendar & countdown to 12:20 IST | Tenant Scoped |

### 3.7 Analytics & Financial Accounting
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/performance`| Gross/net P&L, win rate, expectancy, drawdown| Tenant Scoped |
| `GET` | `/api/v1/analytics/export` | Download real trade records (CSV/JSON) | Tenant Scoped |
| `POST` | `/api/v1/funds/contract-notes`| Upload official contract note for reconciliation| Tenant Admin |

### 3.8 Subscriptions & Billing
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/billing/plans` | Public subscription plans & feature tiers | Public |
| `GET` | `/api/v1/billing/subscription`| Current tenant subscription status & quotas| Tenant Admin |
| `POST` | `/api/v1/billing/upgrade` | Request plan upgrade / payment checkout | Tenant Owner |
