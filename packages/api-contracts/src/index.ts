// ============================================
// NIFTY Auto Trader 3.0 — API Contracts v1
// ============================================
// Shared types between frontend and backend.
// Backend (Python/Pydantic) must mirror these exactly.

// ---- Enums ----

export const TradingMode = {
  OFF: 'OFF',
  PAPER: 'PAPER',
  LIVE: 'LIVE',
} as const;
export type TradingMode = (typeof TradingMode)[keyof typeof TradingMode];

export const EngineState = {
  STOPPED: 'STOPPED',
  STARTING: 'STARTING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  RECONCILING: 'RECONCILING',
  DEGRADED: 'DEGRADED',
  ERROR: 'ERROR',
  RISK_LOCKED: 'RISK_LOCKED',
} as const;
export type EngineState = (typeof EngineState)[keyof typeof EngineState];

export const BrokerConnectionState = {
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ERROR: 'ERROR',
} as const;
export type BrokerConnectionState = (typeof BrokerConnectionState)[keyof typeof BrokerConnectionState];

export const OrderSide = {
  BUY: 'BUY',
  SELL: 'SELL',
} as const;
export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide];

export const OrderType = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  SL: 'SL',
  SL_MARKET: 'SL_MARKET',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderStatus = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  ERROR: 'ERROR',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OptionType = {
  CE: 'CE',
  PE: 'PE',
} as const;
export type OptionType = (typeof OptionType)[keyof typeof OptionType];

export const InstrumentType = {
  EQUITY: 'EQUITY',
  FUTURES: 'FUTURES',
  OPTIONS: 'OPTIONS',
  INDEX: 'INDEX',
} as const;
export type InstrumentType = (typeof InstrumentType)[keyof typeof InstrumentType];

export const Exchange = {
  NSE: 'NSE',
  NFO: 'NFO',
  BSE: 'BSE',
  BFO: 'BFO',
  CDS: 'CDS',
  MCX: 'MCX',
} as const;
export type Exchange = (typeof Exchange)[keyof typeof Exchange];

export const TradeCycleState = {
  PENDING_ENTRY: 'PENDING_ENTRY',
  ENTRY_PLACED: 'ENTRY_PLACED',
  IN_POSITION: 'IN_POSITION',
  EXIT_PLACED: 'EXIT_PLACED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  ERROR: 'ERROR',
} as const;
export type TradeCycleState = (typeof TradeCycleState)[keyof typeof TradeCycleState];

export const SystemEventSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;
export type SystemEventSeverity = (typeof SystemEventSeverity)[keyof typeof SystemEventSeverity];

export const DataFreshness = {
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  STALE: 'STALE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;
export type DataFreshness = (typeof DataFreshness)[keyof typeof DataFreshness];

// ---- Common Response Wrapper ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  meta: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string; // ISO 8601 UTC
  asOf?: string; // ISO 8601 UTC — when the data was last fetched from source
  lastSyncedAt?: string; // ISO 8601 UTC
  dataSource?: 'BROKER' | 'CACHE' | 'DATABASE';
  freshness?: DataFreshness;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ---- Health & System ----

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number; // seconds
  checks: {
    database: ComponentHealth;
    broker: ComponentHealth;
    worker: ComponentHealth;
    redis?: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  message?: string;
  lastCheckedAt: string;
}

export interface SystemStatusResponse {
  tradingMode: TradingMode;
  engineState: EngineState;
  brokerConnection: BrokerConnectionState;
  activeStrategyId: string | null;
  workerHeartbeat: string | null; // ISO 8601 UTC
  marketStatus: 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'HOLIDAY' | 'UNKNOWN';
  lastStateChange: {
    state: EngineState;
    reason: string;
    timestamp: string;
  };
}

// ---- Broker Connection ----

export interface BrokerConnectionResponse {
  state: BrokerConnectionState;
  brokerName: string;
  connectedAt: string | null;
  sessionExpiresAt: string | null;
  marketFeedStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  orderFeedStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  reportApiStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  staticIpCompliant: boolean | null;
  lastError: string | null;
}

// ---- Account ----

export interface AccountFundsResponse {
  availableCash: string; // Decimal string for precision
  usedMargin: string;
  availableMargin: string;
  totalCollateral: string;
  unrealizedPnl: string;
  realizedPnlToday: string;
  asOf: string;
  freshness: DataFreshness;
}

// ---- Positions ----

export interface Position {
  id: string;
  instrumentToken: string;
  tradingSymbol: string;
  exchange: Exchange;
  instrumentType: InstrumentType;
  optionType?: OptionType;
  strikePrice?: string;
  expiryDate?: string;
  quantity: number;
  averagePrice: string;
  lastPrice: string;
  pnl: string;
  pnlPercentage: string;
  dayPnl: string;
  side: OrderSide;
  product: string;
}

// ---- Orders ----

export interface Order {
  id: string;
  brokerOrderId: string | null;
  tradingSymbol: string;
  exchange: Exchange;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price: string;
  triggerPrice: string | null;
  averageFilledPrice: string | null;
  status: OrderStatus;
  statusMessage: string | null;
  placedAt: string;
  updatedAt: string;
  strategyRunId: string | null;
  tradeCycleId: string | null;
  idempotencyKey: string;
}

// ---- Trades (Fills) ----

export interface Trade {
  id: string;
  orderId: string;
  brokerTradeId: string;
  tradingSymbol: string;
  exchange: Exchange;
  side: OrderSide;
  quantity: number;
  price: string;
  tradeTime: string;
}

// ---- Market Data ----

export interface NiftyQuote {
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
  freshness: DataFreshness;
}

export interface Candle {
  timestamp: string; // ISO 8601
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesResponse {
  symbol: string;
  interval: string;
  candles: Candle[];
  asOf: string;
}

export interface OptionChainEntry {
  strikePrice: number;
  expiryDate: string;
  ce: OptionGreeks | null;
  pe: OptionGreeks | null;
}

export interface OptionGreeks {
  instrumentToken: string;
  tradingSymbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  bidPrice: number;
  bidQuantity: number;
  askPrice: number;
  askQuantity: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

export interface OptionChainResponse {
  underlying: string;
  spotPrice: number;
  expiryDate: string;
  entries: OptionChainEntry[];
  asOf: string;
  freshness: DataFreshness;
}

// ---- Strategy ----

export interface Strategy {
  id: string;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  tradingMode: TradingMode;
  config: StrategyConfig;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyConfig {
  underlying: string;
  instrumentType: InstrumentType;
  entryTimeIST: string; // HH:mm format, Asia/Kolkata
  premiumMin: string; // Decimal
  premiumMax: string; // Decimal
  targetPremiumMove: string;
  initialStopLoss: string;
  candleInterval: string; // e.g., '5m'
  trendIndicators: string[];
  maxTradesPerDay: number;
  lotCount: number;
  sidewaysAction: 'SKIP' | 'WAIT' | 'ENTER_CAUTIOUS';
  // Risk limits — MUST be explicitly configured before LIVE
  maxRiskPerTrade: string | null;
  maxDailyLoss: string | null;
  minTradingFunds: string | null;
  maxBidAskSpread: string | null;
  minLiquidity: number | null;
  entryPriceTolerance: string | null;
  maxDataAgeSeconds: number | null;
  maxOrderWaitSeconds: number | null;
  timeBasedExitIST: string | null; // HH:mm
  expirySelectionPolicy: 'CURRENT_WEEK' | 'NEXT_WEEK' | 'CURRENT_MONTH' | null;
  marketHolidayBehavior: 'SKIP' | 'ALERT' | null;
  automatedRecoveryPolicy: 'PAUSE' | 'RETRY_ONCE' | 'STOP' | null;
}

export interface StrategyValidationResult {
  isValid: boolean;
  errors: StrategyValidationError[];
  warnings: StrategyValidationWarning[];
  liveReadiness: {
    ready: boolean;
    missingRequiredFields: string[];
  };
}

export interface StrategyValidationError {
  field: string;
  message: string;
  code: string;
}

export interface StrategyValidationWarning {
  field: string;
  message: string;
}

// ---- Dashboard ----

export interface DashboardOverview {
  tradingMode: TradingMode;
  engineState: EngineState;
  brokerConnection: BrokerConnectionState;
  todaySummary: {
    totalTrades: number;
    completedTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnl: string;
    totalCharges: string;
    netPnl: string;
  } | null; // null when no data
  accountSummary: {
    availableMargin: string;
    usedMargin: string;
    unrealizedPnl: string;
  } | null;
  niftySpot: {
    lastPrice: number;
    change: number;
    changePercent: number;
    freshness: DataFreshness;
  } | null;
  activeStrategy: {
    id: string;
    name: string;
    status: string;
  } | null;
  recentEvents: SystemEvent[];
}

// ---- System Events ----

export interface SystemEvent {
  id: string;
  severity: SystemEventSeverity;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ---- API Route Definitions ----

export const API_ROUTES = {
  health: '/api/v1/health',
  systemStatus: '/api/v1/system/status',
  brokerConnection: '/api/v1/broker/connection',
  brokerConnect: '/api/v1/broker/connect',
  brokerDisconnect: '/api/v1/broker/disconnect',
  accountFunds: '/api/v1/account/funds',
  positions: '/api/v1/positions',
  orders: '/api/v1/orders',
  trades: '/api/v1/trades',
  niftyQuote: '/api/v1/market/nifty',
  candles: '/api/v1/market/candles',
  optionChain: '/api/v1/market/option-chain',
  strategies: '/api/v1/strategies',
  activeStrategy: '/api/v1/strategies/active',
  dashboardOverview: '/api/v1/dashboard/overview',
  systemEvents: '/api/v1/system/events',
} as const;
