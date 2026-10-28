# API Contracts & Endpoint Specifications (API_CONTRACTS.md)

> Version 1 REST API specification for **NIFTY Auto Trader 3.0**. All interfaces and response shapes strictly mirror the shared contracts defined in [`packages/api-contracts`](file:///d:/Coding/Auto%20Trader%203.0/packages/api-contracts/src/index.ts).

---

## 1. Unified Response Envelope Standard

All v1 endpoints return a deterministic JSON envelope modeled after the TypeScript `ApiResponse<T>` interface:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  meta: ResponseMeta;
}
```

### 1.1 Envelope Components

#### `meta` Object (`ResponseMeta`)
Every request receives tracing and data provenance metadata:
```json
{
  "requestId": "req_01HV8K8N...",
  "timestamp": "2026-10-28T10:30:00.123Z",
  "asOf": "2026-10-28T10:29:58.450Z",
  "lastSyncedAt": "2026-10-28T10:29:55.000Z",
  "dataSource": "BROKER",
  "freshness": "LIVE"
}
```

#### `freshness` Indicator Contract
The frontend strictly relies on the `meta.freshness` enum to colorize telemetry widgets:
- **`LIVE`**: Data obtained directly from broker within the last 5 seconds.
- **`RECENT`**: Cached data aged between 5 seconds and 60 seconds.
- **`STALE`**: Data older than 60 seconds (e.g., broker feed degraded).
- **`UNAVAILABLE`**: Broker disconnected, unconfigured, or error returned.

#### `error` Object (`ApiError`)
Returned when `success: false`:
```json
{
  "code": "BROKER_SESSION_EXPIRED",
  "message": "The active Kotak Neo broker session has expired. Please re-authenticate.",
  "details": {
    "broker": "KOTAK_NEO",
    "expiredAt": "2026-10-28T09:15:00Z"
  }
}
```

---

## 2. HTTP Status Codes & Error Taxonomy

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `200 OK` | — | Successful query or idempotent action. |
| `201 Created` | — | Resource created (e.g., new strategy version). |
| `400 Bad Request` | `VALIDATION_ERROR` | Schema validation error or missing required parameters. |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or invalid Supabase JWT authentication token. |
| `403 Forbidden` | `PHASE_1_ORDER_LOCK` | Attempted order execution blocked by Phase 1 safety lock. |
| `404 Not Found` | `NOT_FOUND` | Resource (order, trade cycle, strategy) does not exist. |
| `409 Conflict` | `LEADER_LOCK_CONFLICT` | Worker leader lock conflict or state machine precondition failed. |
| `422 Unprocessable` | `INVALID_STRATEGY_CONFIG` | Strategy config violates risk limits or mathematical invariants. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Exceeded 60 requests per minute per IP/user. |
| `502 Bad Gateway` | `BROKER_API_ERROR` | Kotak Neo upstream API returned an error or timed out. |
| `503 Service Unavailable` | `BROKER_DISCONNECTED` | Broker session is disconnected or static IP check failed. |

---

## 3. Versioned Endpoint Catalog (v1)

### 3.1 Health & Diagnostic Endpoints

#### `GET /api/v1/health`
Evaluates real-time health across subcomponents (Database, Broker connection, Worker heartbeat, Redis).
- **Authentication**: None (Public healthcheck for container orchestrators).
- **Response**: `ApiResponse<HealthResponse>`
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "3.0.0",
    "uptime": 14250,
    "checks": {
      "database": {
        "status": "up",
        "latencyMs": 2,
        "lastCheckedAt": "2026-10-28T10:30:00Z"
      },
      "broker": {
        "status": "up",
        "latencyMs": 48,
        "lastCheckedAt": "2026-10-28T10:29:59Z"
      },
      "worker": {
        "status": "up",
        "message": "Leader lock held by worker-1",
        "lastCheckedAt": "2026-10-28T10:30:00Z"
      },
      "redis": {
        "status": "up",
        "latencyMs": 1,
        "lastCheckedAt": "2026-10-28T10:30:00Z"
      }
    }
  },
  "meta": { "requestId": "req_01", "timestamp": "2026-10-28T10:30:00Z", "freshness": "LIVE" }
}
```

#### `GET /api/v1/system/status`
Returns high-level system operating state, trading mode, and active leader worker.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<SystemStatusResponse>`

---

### 3.2 Broker Management Endpoints

#### `GET /api/v1/broker/connection`
Queries real-time broker connection status, session validity, and static IP compliance.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<BrokerConnectionResponse>`
```json
{
  "success": true,
  "data": {
    "state": "CONNECTED",
    "brokerName": "Kotak Neo",
    "connectedAt": "2026-10-28T09:00:15Z",
    "sessionExpiresAt": "2026-10-28T23:59:59Z",
    "marketFeedStatus": "CONNECTED",
    "orderFeedStatus": "CONNECTED",
    "reportApiStatus": "CONNECTED",
    "staticIpCompliant": true,
    "lastError": null
  },
  "meta": { "requestId": "req_02", "timestamp": "2026-10-28T10:30:00Z", "freshness": "LIVE" }
}
```

#### `POST /api/v1/broker/connect`
Initiates 2FA authentication session using one-time TOTP.
- **Authentication**: Bearer JWT.
- **Request Body**:
```json
{
  "totp": "582914"
}
```
- **Response**: `ApiResponse<BrokerConnectionResponse>`

#### `POST /api/v1/broker/disconnect`
Terminates active broker session tokens.
- **Authentication**: Bearer JWT.

---

### 3.3 Account & Position Telemetry Endpoints

#### `GET /api/v1/account/funds`
Retrieves live available cash, utilized margin, and mark-to-market P&L.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<AccountFundsResponse>`
```json
{
  "success": true,
  "data": {
    "availableCash": "245000.5000",
    "usedMargin": "45200.0000",
    "availableMargin": "199800.5000",
    "totalCollateral": "0.0000",
    "unrealizedPnl": "1250.0000",
    "realizedPnlToday": "3420.0000",
    "asOf": "2026-10-28T10:30:00Z",
    "freshness": "LIVE"
  },
  "meta": { "requestId": "req_03", "timestamp": "2026-10-28T10:30:00Z", "freshness": "LIVE", "dataSource": "BROKER" }
}
```

#### `GET /api/v1/positions`
Returns current intraday positions.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<Position[]>`

#### `GET /api/v1/orders`
Retrieves orders for current session with optional status filters (`?status=OPEN`).
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<Order[]>`

#### `GET /api/v1/trades`
Returns today's execution fill records.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<Trade[]>`

---

### 3.4 Market Data Feeds

#### `GET /api/v1/market/nifty`
Returns the latest spot quote for the NIFTY 50 Index.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<NiftyQuote>`
```json
{
  "success": true,
  "data": {
    "lastPrice": 24478.25,
    "change": 142.10,
    "changePercent": 0.58,
    "open": 24350.00,
    "high": 24510.50,
    "low": 24320.00,
    "close": 24336.15,
    "volume": 18239014,
    "timestamp": "2026-10-28T10:30:00Z",
    "freshness": "LIVE"
  },
  "meta": { "requestId": "req_04", "timestamp": "2026-10-28T10:30:00Z", "freshness": "LIVE", "dataSource": "BROKER" }
}
```

#### `GET /api/v1/market/candles?symbol=NIFTY&interval=5m&limit=100`
Returns historical OHLCV 5-minute candles.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<CandlesResponse>`

#### `GET /api/v1/market/option-chain?underlying=NIFTY`
Returns the option chain strike ladder with Greeks for the nearest weekly expiry.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<OptionChainResponse>`

---

### 3.5 Strategy Governance Endpoints

#### `GET /api/v1/strategies`
Lists all configured strategies and active versions.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<Strategy[]>`

#### `GET /api/v1/strategies/active`
Retrieves the currently selected operational strategy.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<Strategy>`

#### `PUT /api/v1/strategies/{strategy_id}`
Creates a new immutable `strategy_version` and validates live readiness.
- **Authentication**: Bearer JWT.
- **Request Body**: `StrategyConfig`
- **Response**: `ApiResponse<StrategyValidationResult>`

---

### 3.6 Dashboard Aggregation & Events

#### `GET /api/v1/dashboard/overview`
Aggregated telemetry summary optimized for single-call dashboard rendering.
- **Authentication**: Bearer JWT.
- **Response**: `ApiResponse<DashboardOverview>`

#### `GET /api/v1/system/events?limit=50&severity=WARNING`
Paginated audit of system and risk events.
- **Authentication**: Bearer JWT.
- **Response**: `PaginatedResponse<SystemEvent>`
