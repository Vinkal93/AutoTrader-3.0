# Multi-Broker Capability & Compliance Matrix (BROKER_MATRIX.md)

> Canonical comparison of supported broker APIs, authentication mechanisms, network boundaries, and compliance constraints for **NIFTY Auto Trader 3.0**.

---

## 1. Broker Integration Strategy

To provide independent traders with flexibility while preserving architectural unity, NIFTY Auto Trader 3.0 implements a **canonical broker adapter interface** (`AbstractBrokerAdapter`). All broker-specific nuances (payload structures, authentication sequences, WebSocket protocols, error codes) are encapsulated within dedicated adapters behind uniform data contracts.

```mermaid
flowchart TD
    subgraph CoreEngine["Canonical Trading Engine & REST Gateway"]
        E["Trading Worker / API Gateway"]
        I["AbstractBrokerAdapter Interface"]
        E --> I
    end

    subgraph Adapters["Broker Adapter Implementations"]
        I --> K["KotakNeoAdapter (Trade API v2)"]
        I --> Z["ZerodhaKiteAdapter (Kite Connect v3)"]
        I --> U["UpstoxAdapter (Upstox Pro API v2)"]
        I --> A["AngelOneAdapter (SmartAPI)"]
        I --> D["DhanAdapter (DhanHQ API v2)"]
        I --> F["FyersAdapter (Fyers API v3)"]
    end

    subgraph ExternalGateways["External Broker Trading Gateways"]
        K --> KG["Kotak Securities API Gateway"]
        Z --> ZG["Zerodha Connect Gateway"]
        U --> UG["Upstox API Gateway"]
        A --> AG["Angel One SmartAPI Gateway"]
        D --> DG["DhanHQ Infrastructure"]
        F --> FG["Fyers Trading Gateway"]
    end
```

---

## 2. Canonical Broker Comparison Matrix

| Specification | Kotak Neo | Zerodha Kite | Upstox Pro | Angel One | DhanHQ | Fyers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API Version** | Trade API v2 | Kite Connect v3 | Upstox API v2 | SmartAPI v2 | DhanHQ v2 | Fyers API v3 |
| **Primary Auth Flow** | TOTP + MPIN / Password | OAuth 2.0 (Login URL) | OAuth 2.0 (PKCE) | TOTP + Password / MPIN | Access Token + Secret | OAuth 2.0 Flow |
| **Broker-Hosted Login?** | Limited / API-driven | **Yes** (Kite Login) | **Yes** (Upstox Login) | Limited / API-driven | **Yes** (Dhan Web) | **Yes** (Fyers Login) |
| **Daily Session Expiry** | 24 Hours / EOD | 06:00 AM IST daily | 24 Hours / EOD | 24 Hours / EOD | 30 Days (Token) | 24 Hours / EOD |
| **Static IP Mandatory?** | **Yes** (Whitelist portal) | No (App-bound) | No (App-bound) | **Yes** (IP Binding) | **Yes** (API Whitelist) | Optional |
| **Order Placement Rate Limit** | 10 req / sec | 10 req / sec | 25 req / sec | 10 req / sec | 10 req / sec | 10 req / sec |
| **Quote Rate Limit** | 1 req / sec (REST) | 3 req / sec | 10 req / sec | 3 req / sec | 5 req / sec | 5 req / sec |
| **WebSocket Market Feed** | Binary / JSON Ticks | Binary Packets | Protobuf WebSocket | Binary / Text Ticks | Binary Packets | Binary Protobuf |
| **NIFTY Options Depth** | Level 1 / Best 5 | Level 1 / Best 5 | Level 1 / Best 5 | Level 1 / Best 5 | Level 1 / Best 5 | Level 1 / Best 5 |
| **SL-L Order Support** | Yes (`SL`) | Yes (`SL`) | Yes (`SL`) | Yes (`STOPLOSS_LIMIT`) | Yes (`SL`) | Yes (`SL-L`) |
| **Market Orders for Options** | Disallowed by broker | Disallowed (Limit only)| Disallowed (Limit only) | Disallowed (Limit only) | Disallowed | Disallowed |
| **Execution Quality / Fills** | Tradebook API | Orderbook + Postbacks | WebSocket Postbacks | Orderbook API | Webhooks / Postbacks | Webhooks |

---

## 3. Credential & 2FA Handling Invariants

> [!IMPORTANT]
> In accordance with **Rule 18** and Indian cybersecurity guidelines:
> - The SaaS platform **does not collect or store client broker passwords, MPINs, or TOTP seeds** in plain text.
> - For brokers offering standard OAuth 2.0 (Zerodha, Upstox, Dhan, Fyers), the trader authorizes via the broker's official hosted portal. The platform stores only the resulting ephemeral access token and refresh token.
> - For brokers requiring API-driven credentials (Kotak Neo, Angel One), credentials must be stored encrypted using **AES-256-GCM envelope encryption** with distinct data encryption keys per tenant.
> - Daily session renewal occurs either via interactive broker-hosted re-login or via tenant-consented automated session workers where formally compliant.

---

## 4. Static-IP Compliance & Network Routing Architecture

> [!CAUTION]
> **Rule 20 Invariant**: Unrelated traders' live order flow must never be routed through a single shared static IP without broker and exchange authorization.

### 4.1 Deployment Topologies by Subscription Tier

```mermaid
flowchart LR
    subgraph TierStarter["Starter Tier: Single Tenant VM"]
        T1["Trader A"] --> W1["Worker Node A (Dedicated Elastic Static IP 1)"]
        W1 --> B1["Kotak Neo Gateway"]
    end

    subgraph TierPro["Pro Tier: Dedicated Outbound Egress"]
        T2["Trader B"] --> Egress["Cloud NAT with Dedicated Static Egress IP 2"]
        Egress --> B2["Broker Gateway"]
    end

    subgraph TierOAuth["OAuth-Native Brokers (No Static IP Lock)"]
        T3["Trader C"] --> W3["Shared SaaS Cluster"]
        W3 --> ZG["Zerodha / Upstox Gateway"]
    end
```

1. **Static IP-Bound Brokers (Kotak Neo, Angel One, Dhan)**:
   - For tenants utilizing static-IP-bound brokers in LIVE trading mode, orders must egress via a verified, whitelisted static IP address dedicated to that tenant's execution context.
   - The platform verifies outbound IP address parity via `/api/v1/broker/ip-check` before submitting orders.
2. **Dynamic / OAuth-Native Brokers (Zerodha Kite, Upstox)**:
   - Zerodha Kite Connect and Upstox Pro API bind authorization to registered API keys and redirect URLs rather than rigid client IP whitelists.
   - These brokers can be routed through scalable SaaS application clusters while adhering to application-level rate limits.

---

## 5. Standardized Genuine Connection States

Per **Rule 24**, the platform UI and API must report genuine broker states without masking or synthesizing connectivity:

```mermaid
stateDiagram-v2
    [*] --> NOT_CONFIGURED: New Tenant Account
    NOT_CONFIGURED --> ACCESS_PENDING: Credentials / OAuth Initiated
    ACCESS_PENDING --> LOADING: Establishing Handshake
    LOADING --> READY: Session Authenticated & Feeds Verified
    READY --> STALE: Market Feed Lag > 30s
    STALE --> READY: Feed Resumed Nominal
    READY --> NOT_CONNECTED: Session Disconnected / Expired
    NOT_CONNECTED --> LOADING: Reconnect Triggered
    LOADING --> ERROR: Broker Gateway Rejection / Timeout
    ERROR --> UNSUPPORTED: Feature Unavailable for Account
```

- **`NOT_CONFIGURED`**: No broker credentials or OAuth integrations exist for this tenant.
- **`ACCESS_PENDING`**: OAuth redirect pending user authorization on broker website.
- **`LOADING`**: Handshake, JWT exchange, or feed subscription in progress.
- **`READY`**: Authenticated session active, market feeds streaming, static IP verified.
- **`STALE`**: Broker connection established but market data ticks older than 30 seconds.
- **`NOT_CONNECTED`**: Daily session expired or broker connection closed cleanly.
- **`ERROR`**: Authentication rejection, network partition, or API gateway error.
- **`UNSUPPORTED`**: Tenant attempted an order type or feature not supported by this broker.
