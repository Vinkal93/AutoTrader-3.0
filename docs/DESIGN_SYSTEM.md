# UI/UX & Design System Specification (DESIGN_SYSTEM.md)
## NIFTY Auto Trader 3.0 — Multi-Tenant, Multi-Broker Trading SaaS

> Unified visual design system, typography guidelines, and component hierarchy for **NIFTY Auto Trader 3.0**.

---

## 1. Typography System

### 1.1 Primary Font Family: Inter
Per the project standard, **Inter** is the single primary font family across the entire web application, loaded via `next/font/google`.

- **Font Family**: `var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Weights Used**:
  - `400` (Regular): Secondary descriptions, help text, table column headers.
  - `500` (Medium): Primary body text, labels, navigation links.
  - `600` (SemiBold): Card titles, subsection headings, status pills, action buttons.
  - `700` (Bold): Page headers, primary KPI metrics, trade outcome banners.
- **OpenType Feature Settings**:
  ```css
  font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'tnum' 1;
  ```

### 1.2 Numeric Tabular Alignment (`.tabular-nums`)
All financial values, prices, percentage changes, lot counts, timestamps, and order books strictly utilize `font-variant-numeric: tabular-nums` (`.tabular-nums`). This guarantees that digits across table columns and KPI cards maintain consistent vertical alignment.

### 1.3 Monospace Typography Boundary
Monospace typography (`JetBrains_Mono`, `--font-mono`) is strictly reserved for:
- Code snippets (`<code>.env</code>`)
- Technical identifiers (UUIDs, Kotak Neo Order IDs, transaction hashes)
- Raw JSON logs and API payload drawers

---

## 2. Multi-Tenant SaaS UI Components

### 2.1 Tenant / Organization Switcher
Located in the top-left sidebar header, the Tenant Switcher allows traders who belong to multiple trading desks to toggle their active tenant context:
- Displays current tenant name, slug, and subscription badge (`STARTER`, `PRO`, `ENTERPRISE`).
- Dropdown menu lists all accessible tenants with one-click switching.
- Includes `"Create New Desk"` action for authenticated administrators.

### 2.2 Multi-Broker Connection Cards
Displays the connected broker or triggers the connection wizard:
- Displays broker logo/badge (Kotak Neo, Zerodha Kite, Upstox, Angel One, Dhan).
- Status indicator with genuine state badge:
  - `READY`: Emerald indicator with `"Connected & Verified"`.
  - `ACCESS_PENDING`: Amber indicator with `"Awaiting Broker Login"`.
  - `LOADING`: Blue spinning indicator with `"Connecting..."`.
  - `STALE`: Amber indicator with `"Feed Delayed (>30s)"`.
  - `NOT_CONNECTED`: Neutral indicator with `"Session Expired"`.
  - `ERROR`: Rose indicator with `"Connection Error"`.
  - `UNSUPPORTED`: Purple indicator with `"Feature Not Supported"`.
- Action buttons: `"Connect via OAuth"`, `"Reconnect Session"`, `"Disconnect"`.

### 2.3 Subscription Tier Badges & Quotas
- Badges:
  - `FREE`: Neutral grey pill (`bg-neutral-100 text-neutral-700`).
  - `STARTER`: Blue pill (`bg-blue-50 text-blue-700 border-blue-200`).
  - `PRO`: Indigo pill (`bg-indigo-50 text-indigo-700 border-indigo-200`).
  - `ENTERPRISE`: Purple pill (`bg-purple-50 text-purple-700 border-purple-200`).
- Inline quota progress bars (e.g., `1 of 3 Brokers Connected`, `2 of 5 Strategies Active`).

### 2.4 User Role Badges
- `OWNER`: Gold/Amber badge with Crown icon.
- `ADMIN`: Blue badge with Shield icon.
- `TRADER`: Emerald badge with Terminal icon.
- `VIEWER`: Neutral grey badge with Eye icon.

---

## 3. Theme & Accessibility Guidelines

- **Default Theme**: Professional Light Theme optimized for daytime market trading readability, high contrast (`#0f172a` text on `#ffffff` / `#f8fafc` backgrounds), and crisp borders (`#e2e8f0`).
- **Optional Dark Theme**: High-contrast dark palette (`#090d16` background, `#1e293b` card surfaces, `#f8fafc` text) toggled via user preference or system setting.
- **Color Invariants**:
  - Profits / Positive Movements / BUY: Emerald green (`#10b981`, `#059669`).
  - Losses / Negative Movements / SELL: Crimson red (`#ef4444`, `#dc2626`).
  - System Telemetry / Neutral: Cool slate / neutral grays (`#64748b`).
- **Responsive Layout**: Fluid breakpoints supporting full widescreen trading desks (1440px+), laptops (1024px), tablets (768px), and mobile inspection screens (375px+).
