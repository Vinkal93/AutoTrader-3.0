import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StrategyEnginePage from '@/app/strategies/page';
import { BrokerConnectionState, TradingMode } from '@autotrader/api-contracts';

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
  };
});

// Mock Next Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/strategies',
}));

// Mock Auth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'usr-trader-01', email: 'trader@autotrader.in', role: 'authenticated' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockStrategy = {
  id: 'strat-nifty-01',
  name: 'NIFTY 12:20 Rule-Based Directional Buyer',
  description: 'Automated 12:20 PM IST breakout strategy',
  version: 1,
  isActive: true,
  tradingMode: TradingMode.PAPER,
  userId: 'usr-trader-01',
  connectionId: 'conn-kotak-01',
  brokerAccountId: 'KOTAK1234',
  config: {
    underlying: 'NIFTY',
    instrumentType: 'OPTIONS',
    direction: 'AUTO',
    entryTimeIST: '12:20',
    candleInterval: '5m',
    trendIndicators: ['EMA_9', 'EMA_21'],
    premiumMin: '40.00',
    premiumMax: '45.00',
    targetPremiumMove: '1.00',
    initialStopLoss: '3.00',
    maxTradesPerDay: 1,
    lotCount: 1,
    sidewaysAction: 'SKIP',
    maxRiskPerTrade: '1500.00',
    maxDailyLoss: '3000.00',
    minTradingFunds: '10000.00',
    maxBidAskSpread: '1.50',
    minLiquidity: 50,
    entryPriceTolerance: '0.50',
    maxDataAgeSeconds: 60,
    maxOrderWaitSeconds: 15,
    timeBasedExitIST: '15:15',
    expirySelectionPolicy: 'CURRENT_WEEK',
    marketHolidayBehavior: 'SKIP',
    automatedRecoveryPolicy: 'PAUSE',
  },
  createdAt: '2026-10-25T10:00:00Z',
  updatedAt: '2026-10-29T10:00:00Z',
};

const mockBrokerConnections = [
  {
    id: 'conn-kotak-01',
    userId: 'usr-trader-01',
    providerId: 'KOTAK_NEO',
    brokerName: 'Kotak Neo',
    alias: 'Kotak Primary',
    accountId: 'KOTAK1234',
    state: BrokerConnectionState.CONNECTED,
    isActive: true,
    isPartnerApproved: true,
    canExecuteOrders: true,
    connectedAt: '2026-10-25T10:00:00Z',
    sessionExpiresAt: '2026-10-30T10:00:00Z',
    lastSyncedAt: '2026-10-29T10:00:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    lastError: null,
  },
  {
    id: 'conn-dhan-02',
    userId: 'usr-trader-01',
    providerId: 'DHAN',
    brokerName: 'Dhan',
    alias: 'Dhan Scalp',
    accountId: 'DHAN9876',
    state: BrokerConnectionState.CONNECTED,
    isActive: true,
    isPartnerApproved: true,
    canExecuteOrders: true,
    connectedAt: '2026-10-26T10:00:00Z',
    sessionExpiresAt: '2026-10-30T10:00:00Z',
    lastSyncedAt: '2026-10-29T10:00:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    lastError: null,
  },
];

const mockSchedule = {
  strategyId: 'strat-nifty-01',
  strategyName: 'NIFTY 12:20 Rule-Based Directional Buyer',
  scheduledTimeIST: '12:20',
  nextRunIST: '2026-10-29 12:20:00 IST',
  nextRunTimestamp: '2026-10-29T06:50:00Z',
  isMarketOpen: true,
  isTradingDay: true,
  isHoliday: false,
  holidayName: null,
  alreadyRunToday: false,
  timeRemainingSeconds: 3600,
  serverTimeIST: '2026-10-29 11:20:00 IST',
};

const mockWorkerStatus = {
  workerId: 'worker-primary-node-1',
  isLeader: true,
  engineState: 'READY',
  tradingMode: 'PAPER',
  uptimeSeconds: 7200,
  lastHeartbeat: '2026-10-29T10:00:00Z',
  activeStrategiesCount: 1,
  scheduledEvaluationsCount: 1,
  isMarketOpen: true,
  isHoliday: false,
  holidayName: null,
};

const mockNiftyTemplate = {
  name: 'NIFTY 12:20 Momentum Breakout',
  description: 'Rule-based directional options buyer targeting ₹1 profit movement at 12:20 PM IST.',
  tradingMode: TradingMode.PAPER,
  disclaimer:
    'Unvalidated strategy parameters, not proven profitable settings. User is solely responsible for backtesting and evaluating risk. Stop-Loss Limit orders do not guarantee execution in market gaps.',
  config: {
    underlying: 'NIFTY',
    instrumentType: 'OPTIONS',
    direction: 'AUTO',
    entryTimeIST: '12:20',
    timeBasedExitIST: '15:15',
    candleInterval: '5m',
    trendIndicators: ['EMA_9', 'EMA_21'],
    premiumMin: '40.00',
    premiumMax: '45.00',
    targetPremiumMove: '1.00',
    initialStopLoss: '3.00',
    maxTradesPerDay: 1,
    lotCount: 1,
    sidewaysAction: 'SKIP',
    maxRiskPerTrade: '1500.00',
    maxDailyLoss: '3000.00',
    minTradingFunds: '10000.00',
    maxBidAskSpread: '1.50',
    minLiquidity: 50,
  },
};

const mockMutateControl = vi.fn();
const mockMutateUpdate = vi.fn();
const mockMutateEvaluate = vi.fn();
const mockMutateBacktest = vi.fn();

vi.mock('@/hooks/use-queries', () => ({
  useActiveStrategy: () => ({ data: mockStrategy, isLoading: false }),
  useStrategyVersions: () => ({
    data: [
      {
        id: 'ver-01',
        strategyId: 'strat-nifty-01',
        versionNumber: 1,
        config: mockStrategy.config,
        createdBy: 'trader@autotrader.in',
        changeReason: 'Initial setup',
        createdAt: '2026-10-25T10:00:00Z',
      },
    ],
  }),
  useStrategyRuns: () => ({
    data: [
      {
        id: 'run-01',
        strategyId: 'strat-nifty-01',
        tradeDate: '2026-10-28',
        decision: 'ENTER_CE',
        selectedContract: {
          tradingSymbol: 'NIFTY26OCT24400CE',
          askPrice: 42.5,
        },
        evaluatedAt: '2026-10-28T06:50:00Z',
        reason: 'Qualifying ENTER_CE signal. Spread: +3.20. Target: ₹43.50, SL: ₹39.50.',
      },
    ],
  }),
  useStrategySchedule: () => ({ data: mockSchedule }),
  useBrokerConnections: () => ({ data: mockBrokerConnections }),
  useWorkerStatus: () => ({ data: mockWorkerStatus }),
  useNiftyStrategyTemplate: () => ({ data: mockNiftyTemplate }),
  useUpdateStrategy: () => ({
    mutateAsync: mockMutateUpdate.mockResolvedValue({ id: 'strat-nifty-01', version: 2 }),
    isPending: false,
  }),
  useEvaluateStrategy: () => ({
    mutateAsync: mockMutateEvaluate.mockResolvedValue({
      tradeDate: '2026-10-29',
      decision: 'NO_TRADE_SIDEWAYS',
      reason: 'EMA spread (+1.10) within sideways threshold (±2.00)',
    }),
    isPending: false,
  }),
  useBacktestStrategy: () => ({
    mutateAsync: mockMutateBacktest.mockResolvedValue({
      totalDays: 20,
      evaluatedDays: 20,
      tradeSignals: 12,
      ceSignals: 7,
      peSignals: 5,
      skippedDays: 8,
      totalEstimatedNetPnl: -305.4,
      signalLog: [],
    }),
    isPending: false,
  }),
  useStrategyControl: () => ({
    mutateAsync: mockMutateControl.mockResolvedValue({
      strategyId: 'strat-nifty-01',
      status: 'PAUSED',
      actionApplied: 'PAUSE',
      message: 'Automation paused. Reason: Operator paused',
    }),
    isPending: false,
  }),
}));

describe('CODEX PHASE 7 — Multi-User Automation Engine Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TASK 1 & 2: Renders strategy configuration bound to user and broker account', () => {
    render(<StrategyEnginePage />);

    // Header and core titles
    expect(screen.getByText('Multi-User Automation Engine')).toBeDefined();
    expect(screen.getByText('NIFTY 12:20 Rule-Based Directional Buyer')).toBeDefined();
    expect(screen.getByText('Active Engine')).toBeDefined();

    // Verify Direction and Broker Account selectors
    expect(screen.getByText('Trade Direction Rule')).toBeDefined();
    expect(screen.getByText('Bound Broker Trading Account')).toBeDefined();
    expect(screen.getByText(/Kotak Neo/i)).toBeDefined();

    // Verify Strategy parameters
    expect(screen.getByDisplayValue('12:20')).toBeDefined();
    expect(screen.getByDisplayValue('40.00')).toBeDefined();
    expect(screen.getByDisplayValue('45.00')).toBeDefined();
    expect(screen.getByDisplayValue('1.00')).toBeDefined();
    expect(screen.getByDisplayValue('3.00')).toBeDefined();
  });

  it('TASK 1: Loading Original NIFTY Strategy Template displays unvalidated disclaimer', async () => {
    render(<StrategyEnginePage />);

    const loadTemplateBtn = screen.getByRole('button', { name: /Load NIFTY Template/i });
    fireEvent.click(loadTemplateBtn);

    // Disclaimer must be explicitly surfaced
    await waitFor(() => {
      expect(screen.getByText('Original NIFTY 12:20 Strategy Template Loaded')).toBeDefined();
      expect(screen.getByText(/Unvalidated strategy parameters, not proven profitable settings/i)).toBeDefined();
    });
  });

  it('TASK 3 & 8: Displays Worker Status, Leadership, and Market Calendar telemetry', () => {
    render(<StrategyEnginePage />);

    // Worker telemetry
    expect(screen.getByText(/worker-primary-node-1/i)).toBeDefined();
    expect(screen.getByText(/Leader Active/i)).toBeDefined();

    // Market Calendar & Schedule
    expect(screen.getByText(/Next Scheduled Evaluation/i)).toBeDefined();
    expect(screen.getByText(/OPEN \(09:15-15:30 IST\)/i)).toBeDefined();
    expect(screen.getByText(/Max ₹3000.00 • 0 \/ 1 Trades/i)).toBeDefined();
  });

  it('TASK 7: Executes Control Panel actions (Pause, Resume, Emergency Halt)', async () => {
    render(<StrategyEnginePage />);

    // Pause button
    const pauseBtn = screen.getByRole('button', { name: /Pause Strategy/i });
    fireEvent.click(pauseBtn);

    await waitFor(() => {
      expect(mockMutateControl).toHaveBeenCalledWith({
        strategyId: 'strat-nifty-01',
        action: 'PAUSE',
        reason: 'Operator control action: PAUSE',
      });
    });

    // Emergency Halt button
    const haltBtn = screen.getByRole('button', { name: /Emergency Halt/i });
    fireEvent.click(haltBtn);

    await waitFor(() => {
      expect(mockMutateControl).toHaveBeenCalledWith({
        strategyId: 'strat-nifty-01',
        action: 'EMERGENCY_HALT',
        reason: 'Operator control action: EMERGENCY_HALT',
      });
    });
  });

  it('TASK 6: Enforces Stop-Loss Limit execution disclosure and fill recalculation policy', () => {
    render(<StrategyEnginePage />);

    // SEBI / Exchange disclosure
    expect(
      screen.getByText(/Target and stop-loss levels are recalculated from verified broker execution fill prices/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Stop-Loss Limit orders do not guarantee execution in market gaps/i)
    ).toBeDefined();
  });

  it('TASK 4: Runs on-demand strategy evaluation and displays decision result', async () => {
    render(<StrategyEnginePage />);

    const runEvalBtn = screen.getByRole('button', { name: /Run Evaluation Now/i });
    fireEvent.click(runEvalBtn);

    await waitFor(() => {
      expect(mockMutateEvaluate).toHaveBeenCalledWith({
        strategyId: 'strat-nifty-01',
        force: true,
      });
      expect(screen.getByText(/Evaluation Decision: NO_TRADE_SIDEWAYS/i)).toBeDefined();
      expect(screen.getByText(/within sideways threshold/i)).toBeDefined();
    });
  });
});
