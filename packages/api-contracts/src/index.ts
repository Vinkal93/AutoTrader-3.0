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

export const OrderLifecycleState = {
  CREATED: 'CREATED',
  VALIDATING: 'VALIDATING',
  AWAITING_SUBMISSION: 'AWAITING_SUBMISSION',
  SUBMITTING: 'SUBMITTING',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  OPEN: 'OPEN',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCEL_PENDING: 'CANCEL_PENDING',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  UNKNOWN: 'UNKNOWN',
  RECONCILING: 'RECONCILING',
} as const;
export type OrderLifecycleState = (typeof OrderLifecycleState)[keyof typeof OrderLifecycleState];

export const MarketTrendState = {
  BULLISH: 'BULLISH',
  BEARISH: 'BEARISH',
  SIDEWAYS: 'SIDEWAYS',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  STALE_DATA: 'STALE_DATA',
  MARKET_CLOSED: 'MARKET_CLOSED',
} as const;
export type MarketTrendState = (typeof MarketTrendState)[keyof typeof MarketTrendState];

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

// ---- Phase 8: Monitoring, Watchdog, Incidents & Recovery ----

export const IncidentSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;
export type IncidentSeverity = (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

export const IncidentStatus = {
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export interface SystemIncident {
  id: string;
  incidentType:
    | 'WORKER_HEARTBEAT_TIMEOUT'
    | 'BROKER_SESSION_EXPIRED'
    | 'MARKET_FEED_STALE'
    | 'ORDER_FEED_DISCONNECTED'
    | 'STATIC_IP_MISMATCH'
    | 'PROTECTIVE_SL_REJECTED'
    | 'UNPROTECTED_POSITION'
    | 'SCHEDULED_JOB_FAILURE'
    | 'DATABASE_DOWN'
    | 'CRITICAL_SYSTEM_ERROR';
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  details?: Record<string, unknown>;
  triggeredAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
}

export interface NotificationChannelConfig {
  id: string;
  channelType: 'EMAIL' | 'WEBHOOK' | 'TELEGRAM' | 'SLACK';
  name: string;
  isEnabled: boolean;
  destination: string;
  minSeverity: IncidentSeverity;
  rateLimitPerMinute: number;
}

export interface AlertDeliveryLog {
  id: string;
  incidentId: string;
  channelType: string;
  destination: string;
  status: 'DELIVERED' | 'FAILED' | 'DEDUPLICATED' | 'RETRYING';
  attemptCount: number;
  errorMessage?: string | null;
  deliveredAt: string;
}

export interface WatchdogHealthStatus {
  isHealthy: boolean;
  workerHeartbeatStatus: 'ACTIVE' | 'TIMEOUT' | 'UNKNOWN';
  lastHeartbeatAgeSeconds: number | null;
  brokerSessionStatus: 'VALID' | 'EXPIRED' | 'NOT_CONFIGURED';
  marketFeedStatus: 'LIVE' | 'STALE' | 'DISCONNECTED';
  marketFeedStalenessSeconds: number | null;
  orderFeedStatus: 'CONNECTED' | 'DISCONNECTED';
  staticIpStatus: 'MATCHED' | 'MISMATCH' | 'UNVERIFIED';
  currentStaticIp: string | null;
  openUnprotectedPositionsCount: number;
  unprotectedPositions: Array<{
    tradingSymbol: string;
    quantity: number;
    optionType?: string;
    openedAt: string;
  }>;
  activeIncidentsCount: number;
  safeStateVerified: boolean;
  recoveryModeActive: boolean;
  blockNewEntriesReason: string | null;
}

export interface RecoveryReconciliationResult {
  isSafeToResume: boolean;
  openPositionsReconciled: number;
  unprotectedPositionsCount: number;
  orphanedOrdersDetected: number;
  discrepancies: string[];
  reconciledAt: string;
}

export interface RecoveryActionRequest {
  action: 'RUN_RECONCILIATION' | 'ACKNOWLEDGE_INCIDENT' | 'RESOLVE_INCIDENT' | 'ESCALATE_RISK_LOCK' | 'RESET_RECOVERY';
  incidentId?: string;
  resolutionNotes?: string;
  operatorNotes?: string;
}

export interface EmergencyRunbookStep {
  stepNumber: number;
  title: string;
  actionRequired: string;
  toolOrLocation: string;
  caveat?: string;
  criticalNotice?: string;
}

// ---- Trade Cycles & Detailed Executions ----

export interface ChargeBreakdown {
  brokerage: string;
  stt: string;
  exchangeTxnCharge: string;
  gst: string;
  sebiCharges: string;
  stampDuty: string;
  totalCharges: string;
  isPosted: boolean;
}

export interface TradeCycleDetail {
  id: string;
  strategyRunId: string;
  tradingMode: TradingMode;
  state: TradeCycleState;
  tradingSymbol: string;
  optionType?: OptionType;
  strikePrice?: string;
  expiryDate?: string;
  buyQuantity: number;
  buyAveragePrice: string;
  sellAveragePrice: string;
  grossPnl: string;
  netPnl: string;
  charges: ChargeBreakdown;
  chargesStatus: 'ACTUAL' | 'ESTIMATED' | 'UNAVAILABLE';
  durationSeconds: number | null;
  exitReason: string | null;
  entryOrderId: string | null;
  exitOrderId: string | null;
  brokerOrderRef: string | null;
  reconciliationStatus: 'RECONCILED' | 'PENDING' | 'MISMATCH' | 'PARTIAL';
  startedAt: string;
  closedAt: string | null;
}

// ---- Performance & Analytics ----

export type AnalyticsTimeframe = 'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL' | 'CUSTOM';

export interface PerformanceMetrics {
  timeframe: 'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL' | 'CUSTOM';
  totalTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // 0-100 percentage
  grossPnl: string;
  netPnl: string;
  totalCharges: string;
  chargesStatus: 'ACTUAL' | 'ESTIMATED' | 'UNAVAILABLE';
  maxDrawdown: string | null;
  maxDrawdownPercent: string | null;
  profitFactor: number | null;
  dailyPnlSeries: Array<{
    date: string;
    grossPnl: number;
    netPnl: number;
    tradesCount: number;
  }>;
  equityCurve: Array<{
    timestamp: string;
    equity: number;
  }>;
}

export interface OptionTypePerformance {
  optionType: 'CE' | 'PE';
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  grossPnl: string;
  netPnl: string;
  profitFactor: number | null;
  averagePnl: string | null;
}

export interface StrategyVersionPerformance {
  versionNumber: number;
  strategyId: string;
  strategyName: string;
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossPnl: string;
  netPnl: string;
  profitFactor: number | null;
  maxDrawdown: string | null;
}

export interface HoldingTimeAnalysis {
  averageHoldingTimeSeconds: number | null;
  averageWinningHoldingTimeSeconds: number | null;
  averageLosingHoldingTimeSeconds: number | null;
  minHoldingTimeSeconds: number | null;
  maxHoldingTimeSeconds: number | null;
  totalTradesSampled: number;
}

export interface HeatmapDayEntry {
  date: string; // YYYY-MM-DD
  grossPnl: number;
  netPnl: number;
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  status: 'PROFIT' | 'LOSS' | 'BREAKEVEN' | 'NO_TRADE';
}

export interface SlippageAnalysis {
  available: boolean;
  averageEntrySlippagePoints: number | null;
  averageExitSlippagePoints: number | null;
  totalSlippageCost: string | null;
  positiveSlippageTrades: number;
  negativeSlippageTrades: number;
  zeroSlippageTrades: number;
  sampleCount: number;
}

export interface TradeDrilldown {
  id: string;
  strategyRunId: string | null;
  tradingSymbol: string;
  optionType: 'CE' | 'PE' | null;
  tradingMode: string;
  quantity: number;
  entryPrice: string;
  exitPrice: string;
  entryFilledPrice: string | null;
  exitFilledPrice: string | null;
  entrySlippagePoints: number | null;
  exitSlippagePoints: number | null;
  holdingTimeSeconds: number | null;
  grossPnl: string;
  charges: string;
  netPnl: string;
  startedAt: string;
  closedAt: string | null;
  exitReason: string | null;
}

export interface ComprehensiveAnalytics extends PerformanceMetrics {
  startDate?: string | null;
  endDate?: string | null;
  lossRate: number;
  averageWin: string | null;
  averageLoss: string | null;
  largestWin: string | null;
  largestLoss: string | null;
  payoffRatio: number | null;
  expectancy: string | null;
  expectancyRatio: number | null;
  peakEquity: string | null;
  troughEquity: string | null;
  cePerformance: OptionTypePerformance;
  pePerformance: OptionTypePerformance;
  strategyVersions: StrategyVersionPerformance[];
  holdingTime: HoldingTimeAnalysis;
  calendarHeatmap: HeatmapDayEntry[];
  slippage: SlippageAnalysis;
  drilldowns: TradeDrilldown[];
  sampleSizeWarning: string | null;
}

// ---- Risk Metrics ----

export interface RiskAllowance {
  dailyLossLimit: string | null;
  realizedLossToday: string;
  openExposure: string;
  remainingDailyAllowance: string | null;
  maxRiskPerTrade: string | null;
  isRiskLocked: boolean;
  lockoutReason: string | null;
}

// ---- Engine State Transition Request ----

export interface EngineStateTransitionRequest {
  state: EngineState;
  reason?: string;
}

// ---- Trend Analysis (Task 5) ----

export interface TrendAnalysis {
  state: MarketTrendState;
  trendDirection: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'NEUTRAL';
  ema9: number | null;
  ema21: number | null;
  emaSpread: number | null;
  candleConfirmation: boolean;
  trendStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  lastCandleTimestamp: string | null;
  reasonCodes: string[];
  evaluatedAt: string;
}

// ---- Smart Premium Scanner (Task 4) ----

export interface ScannerConfig {
  underlying: string;
  premiumMin: string;
  premiumMax: string;
  preferredPremium: string;
  direction: 'AUTO' | 'CE' | 'PE';
  expiryDate?: string;
  maxSpread: string;
  minLiquidity: number;
}

export interface ScannerCandidate {
  instrumentToken: string;
  tradingSymbol: string;
  optionType: OptionType;
  strikePrice: number;
  expiryDate: string;
  ltp: number;
  bidPrice: number;
  askPrice: number;
  bidAskSpread: number;
  bidQuantity: number;
  askQuantity: number;
  volume: number;
  openInterest: number;
  lotSize: number;
  tickSize: number;
  isEligible: boolean;
  rejectionReasons: string[];
  rankScore: number;
  selectionExplanation: string;
}

export interface ScannerResult {
  status: 'FOUND' | 'NO_SUITABLE_CONTRACT' | 'MARKET_CLOSED' | 'DISCONNECTED';
  evaluatedAt: string;
  totalEvaluated: number;
  eligibleCount: number;
  selectedCandidate: ScannerCandidate | null;
  candidates: ScannerCandidate[];
  selectionReason: string;
}

// ---- Order Validation & Pre-Flight Checks (Task 6 & 7) ----

export interface OrderValidationRequest {
  instrumentToken: string;
  tradingSymbol: string;
  optionType: OptionType;
  side: OrderSide;
  quantity: number;
  price: string;
  targetPrice: string;
  stopLossPrice: string;
  orderType?: OrderType;
  connectionId?: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  requiredMargin: string;
  estimatedCharges: ChargeBreakdown;
  estimatedGrossProfit: string;
  estimatedGrossLoss: string;
  estimatedNetProfit: string;
  estimatedNetLoss: string;
  targetTickAligned: boolean;
  stopLossTickAligned: boolean;
  quantityLotAligned: boolean;
  validationErrors: string[];
  warnings: string[];
  tradeValue?: string;
  netRiskRewardRatio?: string;
  availableMargin?: string | null;
  marginSufficient?: boolean;
  brokerCapabilityWarnings?: string[];
}

// ---- Strategy Versions & Execution Runs (Phase 4) ----

export interface StrategyVersionRecord {
  id: string;
  strategyId: string;
  versionNumber: number;
  config: StrategyConfig;
  createdBy: string | null;
  changeReason: string | null;
  createdAt: string;
}

export interface StrategyRunRecord {
  id: string;
  strategyId: string;
  strategyVersionId: string | null;
  versionNumber: number;
  tradeDate: string; // YYYY-MM-DD
  tradingMode: TradingMode;
  decision:
    | 'ENTER_CE'
    | 'ENTER_PE'
    | 'NO_TRADE_SIDEWAYS'
    | 'NO_TRADE_NO_CONTRACT'
    | 'NO_TRADE_STALE_DATA'
    | 'SKIP_HOLIDAY'
    | 'SKIP_WEEKEND'
    | 'ALREADY_EVALUATED';
  reason: string;
  selectedContract: ScannerCandidate | null;
  ema9: number | null;
  ema21: number | null;
  emaSpread: number | null;
  spotPrice: number | null;
  evaluatedAt: string;
}

export interface StrategyScheduleStatus {
  strategyId: string;
  strategyName: string;
  scheduledTimeIST: string;
  nextRunIST: string;
  nextRunTimestamp: string;
  isMarketOpen: boolean;
  isTradingDay: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  alreadyRunToday: boolean;
  timeRemainingSeconds: number;
  serverTimeIST: string;
}

export interface BacktestSignalLog {
  date: string;
  timeIST: string;
  signal: 'BUY_CE' | 'BUY_PE' | 'SKIP_SIDEWAYS' | 'NO_SIGNAL';
  reason: string;
  spotPrice: number;
  ema9: number;
  ema21: number;
  candleClose: number;
}

export interface BacktestRequest {
  symbol?: string;
  interval?: string;
  fromDate?: string;
  toDate?: string;
  config?: Partial<StrategyConfig>;
}

export interface BacktestResult {
  totalCandles: number;
  totalDays: number;
  evaluatedDays: number;
  tradeSignals: number;
  ceSignals: number;
  peSignals: number;
  skippedDays: number;
  winRateEstimate: number;
  totalEstimatedGrossPnl: number;
  totalEstimatedNetPnl: number;
  signalLog: BacktestSignalLog[];
}

// ---- Execution & Risk Engine (Phase 5) ----

export interface OrderSubmissionRequest {
  tradingSymbol: string;
  exchange: Exchange;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: string;
  triggerPrice?: string;
  tradingMode: TradingMode;
  idempotencyKey?: string;
  strategyRunId?: string;
  connectionId?: string;
  brokerId?: string;
}

export interface OrderSubmissionResult {
  orderId: string;
  brokerOrderId: string | null;
  lifecycleState: OrderLifecycleState;
  status: OrderStatus;
  tradingSymbol: string;
  side: OrderSide;
  quantity: number;
  filledQuantity: number;
  price: string;
  averageFilledPrice: string | null;
  placedAt: string;
  message: string;
}

export interface OrderCancelRequest {
  orderId: string;
  reason?: string;
}

export interface OrderCancelResult {
  orderId: string;
  brokerOrderId: string | null;
  lifecycleState: OrderLifecycleState;
  cancelledAt: string;
  message: string;
}

export interface OrderEventRecord {
  id: string;
  orderId: string;
  eventType: string;
  timestamp: string;
  userId?: string | null;
  tenantId?: string | null;
  brokerOrderId?: string | null;
  requestedQuantity?: number | null;
  filledQuantity?: number | null;
  rawBrokerResponseCode?: string | null;
  failureCause?: string | null;
  payload?: Record<string, any> | null;
}

export interface ReconciliationDiscrepancy {
  orderId: string;
  brokerOrderId: string | null;
  brokerStatus: string;
  localStatus: string;
  actionTaken: string;
}

export interface ReconciliationReport {
  reconciledAt: string;
  brokerOrdersCount: number;
  dbOrdersCount: number;
  discrepanciesCount: number;
  discrepancies: ReconciliationDiscrepancy[];
  engineState: EngineState;
  status: 'CLEAN' | 'RESOLVED' | 'REQUIRES_MANUAL_INTERVENTION';
}

export interface LiveAuthorizationStatus {
  isAuthorized: boolean;
  hasExplicitConsent: boolean;
  isBrokerConnected: boolean;
  isStaticIpCompliant: boolean;
  areRiskSettingsApproved: boolean;
  blockers: string[];
  authorizedAt: string | null;
  authorizedBy: string | null;
}

export interface FailureModeItem {
  scenarioId: string;
  category: 'NETWORK' | 'BROKER_API' | 'EXECUTION' | 'INFRASTRUCTURE' | 'RISK';
  title: string;
  triggerCondition: string;
  automaticAction: string;
  recoveryRunbook: string;
  unprotectedWindowSeconds: number;
}

// ---- Financial Accounting & Contract Notes (Phase 6) ----

export interface ContractNoteEntry {
  tradeId?: string;
  orderId?: string;
  tradingSymbol: string;
  side: OrderSide;
  quantity: number;
  price: string;
  brokerage: string;
  stt: string;
  exchangeTurnover: string;
  gst: string;
  sebiCharges: string;
  stampDuty: string;
}

export interface ContractNoteImportRequest {
  contractNoteNumber: string;
  tradeDate: string; // YYYY-MM-DD
  settlementNumber?: string;
  entries: ContractNoteEntry[];
}

export interface ContractNoteDiscrepancy {
  cycleId: string;
  tradingSymbol: string;
  estimatedFee: string;
  confirmedFee: string;
  difference: string;
  reason: string;
}

export interface ContractNoteImportResult {
  contractNoteNumber: string;
  tradeDate: string;
  importedCount: number;
  reconciledCyclesCount: number;
  discrepanciesCount: number;
  discrepancies: ContractNoteDiscrepancy[];
  totalConfirmedCharges: string;
  importedAt: string;
}

export interface AccountSnapshotRecord {
  id: string;
  availableCash: string;
  usedMargin: string;
  availableMargin: string;
  totalCollateral: string;
  unrealizedPnl: string;
  realizedPnl: string;
  timestamp: string;
}

export interface FeeScheduleVersion {
  version: string;
  effectiveFrom: string;
  brokeragePerOrder: string;
  sttRateOptionsSell: string;
  exchangeTxnRate: string;
  gstRate: string;
  sebiRatePerCrore: string;
  stampDutyRate: string;
  description: string;
}

export interface TradeCycleFilterParams {
  startDate?: string;
  endDate?: string;
  symbol?: string;
  optionType?: OptionType;
  status?: TradeCycleState;
  strategyId?: string;
  mode?: TradingMode;
}

// ---- API Route Definitions ----

export const API_ROUTES = {
  health: '/api/v1/health',
  systemStatus: '/api/v1/system/status',
  systemMode: '/api/v1/system/mode',
  systemEngineState: '/api/v1/system/engine-state',
  brokerConnection: '/api/v1/broker/connection',
  brokerConnect: '/api/v1/broker/connect',
  brokerDisconnect: '/api/v1/broker/disconnect',
  accountFunds: '/api/v1/account/funds',
  accountSnapshots: '/api/v1/account/snapshots',
  positions: '/api/v1/positions',
  orders: '/api/v1/orders',
  ordersSubmit: '/api/v1/orders/submit',
  ordersCancel: '/api/v1/orders/:id/cancel',
  ordersReconcile: '/api/v1/orders/reconcile',
  trades: '/api/v1/trades',
  tradeCycles: '/api/v1/trade-cycles',
  tradeCyclesExport: '/api/v1/trade-cycles/export',
  contractNotesImport: '/api/v1/funds/contract-notes/import',
  contractNotesReconcile: '/api/v1/funds/contract-notes/reconcile',
  feeSchedules: '/api/v1/funds/fee-schedules',
  niftyQuote: '/api/v1/market/nifty',
  candles: '/api/v1/market/candles',
  optionChain: '/api/v1/market/option-chain',
  marketScanner: '/api/v1/market/scanner',
  marketTrend: '/api/v1/market/trend',
  ordersValidate: '/api/v1/orders/validate',
  ordersTimeline: '/api/v1/orders/timeline',
  orderEvents: '/api/v1/orders/:id/events',
  ordersEmergencyExit: '/api/v1/orders/emergency-exit',
  strategies: '/api/v1/strategies',
  activeStrategy: '/api/v1/strategies/active',
  strategyBacktest: '/api/v1/strategies/backtest',
  dashboardOverview: '/api/v1/dashboard/overview',
  analyticsPerformance: '/api/v1/analytics/performance',
  analyticsComprehensive: '/api/v1/analytics/comprehensive',
  analyticsExport: '/api/v1/analytics/export',
  systemEvents: '/api/v1/system/events',
  systemIncidents: '/api/v1/system/incidents',
  systemIncidentAction: '/api/v1/system/incidents/action',
  watchdogStatus: '/api/v1/watchdog/status',
  watchdogRunCheck: '/api/v1/watchdog/check',
  watchdogRunbook: '/api/v1/watchdog/runbook',
  notificationsConfig: '/api/v1/notifications/config',
  notificationsDeliveries: '/api/v1/notifications/deliveries',
  recoveryReconcile: '/api/v1/recovery/reconcile',
  systemFailureModes: '/api/v1/system/failure-modes',
  systemLiveAuthorization: '/api/v1/system/live-authorization',

  // Auth & Profile Routes
  authSignup: '/api/v1/auth/signup',
  authLogin: '/api/v1/auth/login',
  authSession: '/api/v1/auth/session',
  authLogout: '/api/v1/auth/logout',
  authForgotPassword: '/api/v1/auth/forgot-password',
  authResetPassword: '/api/v1/auth/reset-password',
  userProfile: '/api/v1/user/profile',
  userPreferences: '/api/v1/user/preferences',
  onboardingComplete: '/api/v1/user/onboarding/complete',

  // Multi-Broker Routes (Phase 4 and 5)
  brokerProviders: '/api/v1/broker/providers',
  brokerConnections: '/api/v1/broker/connections',
  brokerInitiateAuth: '/api/v1/broker/connections/initiate-auth',
  brokerAuthCallback: '/api/v1/broker/connections/callback',
  brokerIpCheck: '/api/v1/broker/ip-check',
} as const;

// ---- Auth & Profile Models ----

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  panNumberMasked?: string | null;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  riskAppetite: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  maxCapitalAllocation: number;
  isOnboarded: boolean;
  onboardedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  defaultLotSize: number;
  soundEnabled: boolean;
  defaultBrokerId: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role: string;
    isOnboarded: boolean;
  };
}

export interface OnboardingPayload {
  selectedBrokerId?: string | null;
  connectBrokerNow: boolean;
  theme?: 'light' | 'dark';
  defaultLotSize?: number;
  riskAppetite?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  brokerCredentials?: Record<string, string>;
}


// ==============================================================================
// MULTI-BROKER PLATFORM CONTRACTS (PHASE 4 & 5)
// ==============================================================================

export const BrokerId = {
  KOTAK_NEO: 'KOTAK_NEO',
  DHAN: 'DHAN',
  UPSTOX: 'UPSTOX',
  FYERS: 'FYERS',
  ZERODHA: 'ZERODHA',
  ANGEL_ONE: 'ANGEL_ONE',
} as const;
export type BrokerId = (typeof BrokerId)[keyof typeof BrokerId];

export const BrokerAuthModel = {
  OAUTH2: 'OAUTH2',
  API_KEY_TOTP: 'API_KEY_TOTP',
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  INTERACTIVE: 'INTERACTIVE',
} as const;
export type BrokerAuthModel = (typeof BrokerAuthModel)[keyof typeof BrokerAuthModel];

export interface BrokerCapabilities {
  supportsOptionsChain: boolean;
  supportsRealtimeTicks: boolean;
  supportsHistoricalCandles: boolean;
  supportsOrderExecution: boolean;
  supportsStopLossLimit: boolean;
  supportsMarketOrdersForOptions: boolean;
  supportsWebhooks: boolean;
  requiresStaticIp: boolean;
  dailySessionResetIst: string;
  orderRateLimitPerSec: number;
  quoteRateLimitPerSec: number;
}

export interface BrokerProviderInfo {
  id: string;
  name: string;
  apiVersion: string;
  authModel: BrokerAuthModel;
  isPartnerApproved: boolean;
  isActive: boolean;
  requiresStaticIp: boolean;
  loginUrl?: string;
  apiDocsUrl?: string;
  capabilities: BrokerCapabilities;
  description: string;
}

export interface BrokerPermissions {
  id: string;
  connectionId: string;
  canReadQuotes: boolean;
  canReadFunds: boolean;
  canReadPositions: boolean;
  canExecuteOrders: boolean;
  maxLotsPerOrder: number;
  allowedSegments: string[];
  updatedAt: string;
}

export interface BrokerConnectionSummary {
  id: string;
  userId: string;
  providerId: string;
  brokerName: string;
  accountId: string | null;
  alias: string;
  isActive: boolean;
  state: BrokerConnectionState;
  connectedAt: string | null;
  sessionExpiresAt: string | null;
  lastSyncedAt: string | null;
  marketFeedStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  orderFeedStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  reportApiStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  staticIpCompliant: boolean | null;
  egressIpVerified?: string | null;
  lastError: string | null;
  permissions?: BrokerPermissions;
}

export interface BrokerAccountProfile {
  clientCode: string;
  clientName: string;
  emailMasked: string;
  panMasked: string;
  brokerName: string;
  exchangesEnabled: string[];
  productsEnabled: string[];
  bankAccountMasked?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DORMANT';
}

export interface InitiateAuthRequest {
  providerId: string;
  alias?: string;
  redirectUri?: string;
}

export interface InitiateAuthResponse {
  authUrl?: string;
  state: string;
  authModel: BrokerAuthModel;
  requiresCredentialsForm: boolean;
  instructions: string;
}

export interface AuthCallbackRequest {
  providerId: string;
  state: string;
  code?: string;
  token?: string;
  credentials?: Record<string, string>;
  alias?: string;
}

export interface ConnectBrokerRequest {
  providerId: string;
  alias?: string;
  apiKey?: string;
  apiSecret?: string;
  mobileNumber?: string;
  totp?: string;
  mpin?: string;
  clientId?: string;
}

export interface IpCheckResponse {
  clientIp: string;
  serverEgressIp: string;
  isStaticIpConfigured: boolean;
  isWhitelisted: boolean;
  brokerTarget: string;
  timestamp: string;
}
