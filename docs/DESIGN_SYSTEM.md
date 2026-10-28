# Design System & UI Component Specification (DESIGN_SYSTEM.md)

> Institutional trading interface design system and component catalog for **NIFTY Auto Trader 3.0**, backed by [`packages/ui-tokens`](file:///d:/Coding/Auto%20Trader%203.0/packages/ui-tokens/src/index.ts).

---

## 1. Design Principles for Financial Interfaces

1. **High Visual Hierarchy & Scannability**: Traders must assess profit/loss, exposure, broker connectivity, and system state within 500 milliseconds of glancing at the screen.
2. **Deterministic Data Provenance**: Every number presented on screen must display its source (`BROKER`, `CACHE`, `DATABASE`) and its freshness (`LIVE`, `RECENT`, `STALE`, `UNAVAILABLE`).
3. **Zero Ambiguity in Zero/Null States**: A broker that is disconnected must display `"Not Connected"` or `"No Data"` with neutral or warning badges—never blank values, artificial dashes, or zeroes that could be mistaken for actual balances.
4. **Institutional Color Invariants**: In the Indian market context, Green indicates Profit / Positive / Buy, Red indicates Loss / Negative / Sell, and Slate/Neutral indicates Flat / Unchanged.

---

## 2. Design Tokens Catalog

### 2.1 Color Palette

#### Primary Palette (Brand & Interactive Accents)
- `primary-50`: `#eff6ff`
- `primary-100`: `#dbeafe`
- `primary-500`: `#3b82f6` (Interactive links & active tab borders)
- `primary-600`: `#2563eb` (Primary buttons & focused inputs)
- `primary-900`: `#1e3a8a`

#### Semantic Financial Tokens
```typescript
export const financeTokens = {
  profit: '#16a34a', // success.600 - Profit, Up ticks, Positive returns
  loss:   '#dc2626', // danger.600  - Loss, Down ticks, Negative returns
  neutral:'#6b7280', // neutral.500 - Unchanged, Flat, Zero
  buy:    '#16a34a', // Call options, Long exposure
  sell:   '#dc2626', // Put options, Short exposure
};
```

#### Status Indicators
```typescript
export const statusTokens = {
  connected:    '#22c55e', // success.500
  disconnected: '#9ca3af', // neutral.400
  warning:      '#f59e0b', // warning.500
  error:        '#ef4444', // danger.500
  loading:      '#60a5fa', // primary.400
};
```

#### Neutral & Background Greys (Dark Mode Focus)
- `neutral-50`: `#f9fafb` (Light mode cards)
- `neutral-100`: `#f3f4f6`
- `neutral-700`: `#374151` (Card borders in dark mode)
- `neutral-800`: `#1f2937` (Card & panel surface background)
- `neutral-900`: `#111827` (Global application canvas)

---

### 2.2 Typography
- **Primary Interface Font**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Used for labels, navigation, headings, table headers, and modal text.
- **Monospace Financial Font**: `"JetBrains Mono", "Fira Code", Consolas, monospace`
  - **Mandatory for all monetary figures, strike prices, quantities, timestamps, and order IDs** to prevent layout jitter as digits update in real time.
- **Scale**:
  - `xs`: `0.75rem` (12px) - Meta tags, freshness indicators, timestamps
  - `sm`: `0.875rem` (14px) - Table rows, field descriptions, body text
  - `base`: `1.00rem` (16px) - Navigation items, button text
  - `lg`: `1.125rem` (18px) - Section headers, card titles
  - `xl`: `1.25rem` (20px) - Subheadings
  - `2xl`: `1.50rem` (24px) - Metric card values, NIFTY spot ticker
  - `3xl`: `1.875rem` (30px) - Primary hero KPI metrics

---

### 2.3 Spacing & Layout Rhythm
- Base 4px grid system:
  - `spacing-1`: `0.25rem` (4px)
  - `spacing-2`: `0.50rem` (8px)
  - `spacing-3`: `0.75rem` (12px)
  - `spacing-4`: `1.00rem` (16px) - Standard card padding
  - `spacing-6`: `1.50rem` (24px) - Grid column gap
  - `spacing-8`: `2.00rem` (32px) - Page section spacing

---

## 3. UI Component Specifications

### 3.1 AppShell, Topbar & Sidebar
- **`AppShell`**: Wraps the viewport in a 2-column layout (collapsible 260px sidebar + flex-grow main stage).
- **`Topbar`**:
  - Left: System breadcrumb, current Engine State badge (`READY`, `RUNNING`, etc.), and Trading Mode banner (`PAPER` / `OFF`).
  - Center: Live NIFTY Spot Quote ticker (`24,478.25` with `+142.10 (+0.58%)` colorized).
  - Right: Broker Connection indicator dot, last synced timestamp, and User profile avatar with role badge.
- **`Sidebar`**: Navigation links with active route indicator:
  - Dashboard Overview (`/dashboard`)
  - Live Positions & Orders (`/orders`)
  - NIFTY Option Chain (`/option-chain`)
  - Strategy Governance (`/strategy`)
  - System Events & Audit (`/events`)
  - Settings & Broker Auth (`/settings`)

---

### 3.2 MetricCard
Displays key financial indicators (e.g. Net P&L, Available Margin, Used Margin).
- **Header**: Label (12px neutral-400 uppercase tracking-wider) + optional tool-tip icon.
- **Value**: Monospace 24px bold. Colorized dynamically if representing P&L (`financeTokens.profit` if > 0, `financeTokens.loss` if < 0, `neutral-300` if 0).
- **Footer**: Delta badge or sub-metric (e.g. `Realized: ₹3,420 | Unrealized: ₹1,250`).
- **Corner Badge**: `DataFreshnessIndicator`.

```
┌──────────────────────────────────────────────┐
│ TODAY'S NET P&L                        [LIVE]│
│ +₹4,670.00                                   │
│ Realized: ₹3,420.00  •  Unrealized: ₹1,250.00 │
└──────────────────────────────────────────────┘
```

---

### 3.3 DataFreshnessIndicator
Visual badge attached to all live data containers.
- **`LIVE`**: Green pulsing dot + `"Live"` label.
- **`RECENT`**: Blue solid dot + `"Cached (<1m)"`.
- **`STALE`**: Amber exclamation + `"Stale (>1m)"`.
- **`UNAVAILABLE`**: Grey dot + `"Unavailable"`.

---

### 3.4 DataTable
Tabular view for Orders, Positions, Trades, and Option Chains.
- **Header**: Sticky top, uppercase neutral-400 font, sort indicators on click.
- **Row Heights**: Compact 36px for dense financial scanning.
- **Zebra Striping**: Alternating `neutral-800` and `neutral-800/50`.
- **Alignment**:
  - Text & Symbol: Left aligned.
  - Numbers, Quantities & Prices: Right aligned, monospace font.
  - Status badges: Centered.
- **Empty State**: Integrated component rendering when `rows.length === 0`.

---

### 3.5 EmptyState & ErrorState
- **`EmptyState`**: Rendered when a dataset is genuinely empty (e.g., `"No Open Positions Today"`). Contains subtle outline icon, descriptive subtext, and clear non-alarmist phrasing.
- **`ErrorState`**: Rendered when a query fails (e.g., `"Broker Gateway Timeout"`). Highlights error code (`BROKER_API_ERROR`), displays raw message in expandable drawer, and renders a `"Retry Connection"` action button.

---

### 3.6 ConfirmDialog (Dual-Key Action Gate)
Modal confirmation dialogue required before executing any administrative state changes (e.g. Switching trading modes, updating strategy versions, disconnecting broker).
- Requires typing a confirmation keyword (e.g., `"CONFIRM"`) for high-impact actions.
- Displays explicit warning regarding financial risk.

---

## 4. UI Copy & Localization Standards

All user-facing copy is centralized in [`packages/ui-tokens/src/index.ts`](file:///d:/Coding/Auto%20Trader%203.0/packages/ui-tokens/src/index.ts):

| Domain | Key | Standard Copy String |
| :--- | :--- | :--- |
| **App** | `labels.app.name` | `"NIFTY Auto Trader"` |
| **Currency** | `labels.currency.symbol` | `"₹"` (Indian Rupee) |
| **States** | `labels.states.notConnected` | `"Not Connected"` |
| **States** | `labels.states.notConfigured` | `"Not Configured"` |
| **States** | `labels.states.noData` | `"No Data"` |
| **States** | `labels.states.stale` | `"Stale Data"` |
| **Modes** | `labels.trading.off` | `"Trading Off"` |
| **Modes** | `labels.trading.paper` | `"Paper Trading"` |
| **Modes** | `labels.trading.live` | `"Live Trading"` |

---

## 5. Accessibility & Responsive Guidelines

1. **Contrast Ratios**: All text against background meets WCAG AAA standards (minimum 7:1 ratio).
2. **Keyboard Navigation**: Full keyboard accessibility (`Tab`, `Shift+Tab`, `Enter`, `Escape`) across all interactive data tables, dropdowns, and modals.
3. **Screen Readers**: `aria-live="polite"` applied to live ticker elements so screen readers receive updates without overwhelming speech synthesizers.
4. **Responsive Breakpoints**:
   - `sm`: 640px (Single-column layout, drawer navigation)
   - `md`: 768px (Tablet split view)
   - `lg`: 1024px (Standard desktop layout with fixed sidebar)
   - `xl`: 1280px (Wide multi-column trading desk layout)
   - `2xl`: 1536px (Multi-monitor ultrawide option chain view)
