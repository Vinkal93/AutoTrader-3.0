import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LiveTradingTerminalPage from '../app/live-trading/page';
import { TradeTicket } from '../components/terminal/TradeTicket';
import { TerminalHeader } from '../components/terminal/TerminalHeader';
import { TerminalBottomTabs } from '../components/terminal/TerminalBottomTabs';
import {
  BrokerConnectionState,
  BrokerId,
  OrderSide,
  OrderType,
  TradingMode,
  EngineState,
  type BrokerConnectionSummary,
} from '@autotrader/api-contracts';

// Mock Next Navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/app/trading',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock Auth Context
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'usr-trader-01', email: 'trader@autotrader.in', role: 'authenticated' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock Broker Connections
const mockBrokerConnections: BrokerConnectionSummary[] = [
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
    lastSyncAt: '2026-10-29T10:00:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    lastError: null,
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z',
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
    lastSyncAt: '2026-10-29T10:00:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    lastError: null,
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z',
  },
];

const mockFunds = {
  totalEquity: '175000.00',
  availableMargin: '150000.00',
  availableCash: '150000.00',
  usedMargin: '25000.00',
  collateralMargin: '0.00',
  currency: 'INR',
  lastUpdated: '2026-10-29T10:00:00Z',
};

const mockQuote = {
  symbol: 'NIFTY 50',
  lastPrice: 24350.75,
  open: 24280.00,
  high: 24390.20,
  low: 24260.10,
  close: 24295.50,
  change: 55.25,
  changePercent: 0.23,
  timestamp: '2026-10-29T10:00:00Z',
};

const mockPositions = [
  {
    tradingSymbol: 'NIFTY26OCT24400CE',
    exchange: 'NFO',
    product: 'NRML',
    side: 'BUY',
    quantity: 25,
    averagePrice: '42.50',
    lastPrice: '46.00',
    pnl: '87.50',
    unrealizedPnl: '87.50',
    realizedPnl: '0.00',
    dayBuyQuantity: 25,
    dayBuyValue: '1062.50',
    daySellQuantity: 0,
    daySellValue: '0.00',
  },
];

const mockOrders = [
  {
    id: 'ord-test-01',
    brokerOrderId: 'BRK-89210',
    tradingSymbol: 'NIFTY26OCT24400CE',
    exchange: 'NFO',
    side: 'BUY',
    orderType: 'LIMIT',
    quantity: 25,
    filledQuantity: 25,
    price: '42.50',
    triggerPrice: null,
    averageFilledPrice: '42.50',
    status: 'FILLED',
    statusMessage: 'Completed on Virtual Engine',
    placedAt: '2026-10-29T09:30:00Z',
    updatedAt: '2026-10-29T09:30:01Z',
    strategyRunId: null,
    tradeCycleId: null,
    idempotencyKey: 'IDEMP_TEST_01',
  },
];

const mockTrades = [
  {
    id: 'trd-test-01',
    orderId: 'ord-test-01',
    brokerTradeId: 'TRD-5512',
    tradingSymbol: 'NIFTY26OCT24400CE',
    exchange: 'NFO',
    side: 'BUY',
    quantity: 25,
    price: '42.50',
    tradeTime: '2026-10-29T09:30:01Z',
  },
];

const mockTimelineEvents = [
  {
    id: 'ev-01',
    orderId: 'ord-test-01',
    eventType: 'VALIDATING',
    timestamp: '2026-10-29T09:30:00.100Z',
    userId: 'usr-trader-01',
    tenantId: 'usr-trader-01',
    brokerOrderId: null,
    requestedQuantity: 25,
    filledQuantity: 0,
    rawBrokerResponseCode: 'PREFLIGHT_PASS',
    failureCause: null,
    payload: { reason: 'Pre-flight checks passed' },
  },
  {
    id: 'ev-02',
    orderId: 'ord-test-01',
    eventType: 'SUBMITTING',
    timestamp: '2026-10-29T09:30:00.200Z',
    userId: 'usr-trader-01',
    tenantId: 'usr-trader-01',
    brokerOrderId: null,
    requestedQuantity: 25,
    filledQuantity: 0,
    rawBrokerResponseCode: 'SIM_SUBMIT',
    failureCause: null,
    payload: { reason: 'Dispatched in PAPER mode' },
  },
  {
    id: 'ev-03',
    orderId: 'ord-test-01',
    eventType: 'FILLED',
    timestamp: '2026-10-29T09:30:00.400Z',
    userId: 'usr-trader-01',
    tenantId: 'usr-trader-01',
    brokerOrderId: 'BRK-89210',
    requestedQuantity: 25,
    filledQuantity: 25,
    rawBrokerResponseCode: '200_SIM_FILLED',
    failureCause: null,
    payload: { reason: 'Filled 25 units @ ₹42.50' },
  },
];

// Mock use-queries hooks
vi.mock('@/hooks/use-queries', () => ({
  useSystemStatus: () => ({
    data: {
      tradingMode: 'PAPER',
      engineState: 'RUNNING',
      marketStatus: 'OPEN',
      brokerConnected: true,
    },
    isLoading: false,
  }),
  useBrokerConnections: () => ({
    data: mockBrokerConnections,
    isLoading: false,
  }),
  useBrokerConnection: () => ({
    data: {
      state: 'CONNECTED',
      brokerName: 'Kotak Neo',
      staticIpCompliant: true,
    },
    isLoading: false,
  }),
  useAccountFunds: () => ({
    data: mockFunds,
    isLoading: false,
  }),
  useNiftyQuote: () => ({
    data: mockQuote,
    isLoading: false,
  }),
  usePositions: () => ({
    data: mockPositions,
    isLoading: false,
  }),
  useOrders: () => ({
    data: mockOrders,
    isLoading: false,
  }),
  useTrades: () => ({
    data: mockTrades,
    isLoading: false,
  }),
  useOrderTimeline: () => ({
    data: mockTimelineEvents,
    isLoading: false,
  }),
  useOptionChain: () => ({
    data: {
      spotPrice: 24350.75,
      entries: [
        {
          strikePrice: 24400,
          ce: {
            instrumentToken: 'tok-24400-ce',
            tradingSymbol: 'NIFTY26OCT24400CE',
            lastPrice: 42.50,
            ltp: 42.50,
            bidPrice: 42.40,
            askPrice: 42.55,
            bidQuantity: 1500,
            askQuantity: 1800,
            oi: 45000,
            volume: 250000,
            iv: 13.2,
            delta: 0.48,
            theta: -4.5,
          },
          pe: {
            instrumentToken: 'tok-24400-pe',
            tradingSymbol: 'NIFTY26OCT24400PE',
            lastPrice: 45.10,
            ltp: 45.10,
            bidPrice: 45.00,
            askPrice: 45.20,
            bidQuantity: 1200,
            askQuantity: 1400,
            oi: 42000,
            volume: 220000,
            iv: 13.8,
            delta: -0.52,
            theta: -4.8,
          },
        },
      ],
    },
    isLoading: false,
  }),
  useMarketScanner: () => ({
    data: {
      status: 'FOUND',
      candidates: [],
      selectedCandidate: null,
      selectionReason: 'NIFTY trend matches preferences',
    },
    isLoading: false,
  }),
  useTrendAnalysis: () => ({
    data: {
      state: 'BULLISH',
      trendDirection: 'BULLISH',
      ema9: 24340.5,
      ema21: 24320.1,
    },
    isLoading: false,
  }),
  useMarketTrend: () => ({
    data: {
      state: 'BULLISH',
      trendDirection: 'BULLISH',
      ema9: 24340.5,
      ema21: 24320.1,
    },
    isLoading: false,
  }),
  useCandles: () => ({
    data: { candles: [] },
    isLoading: false,
  }),
  useFailureModes: () => ({
    data: [],
    isLoading: false,
  }),
  useSystemEvents: () => ({
    data: [],
    isLoading: false,
  }),
  useSetTradingMode: () => ({
    mutate: vi.fn(),
  }),
  useTransitionEngineState: () => ({
    mutate: vi.fn(),
  }),
  useEmergencyExit: () => ({
    mutate: vi.fn(),
  }),
  useReconcileOrders: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCancelOrder: () => ({
    mutate: vi.fn(),
  }),
  useValidateOrder: () => ({
    mutate: vi.fn(),
    data: {
      isValid: true,
      requiredMargin: '1062.50',
      tradeValue: '1062.50',
      availableMargin: '150000.00',
      marginSufficient: true,
      netRiskRewardRatio: '1 : 3.00',
      estimatedCharges: {
        brokerage: '40.00',
        stt: '1.34',
        exchangeTxnCharge: '1.09',
        gst: '7.40',
        sebiCharges: '0.01',
        stampDuty: '0.03',
        totalCharges: '49.87',
        isPosted: false,
      },
      estimatedGrossProfit: '25.00',
      estimatedGrossLoss: '75.00',
      estimatedNetProfit: '-24.87',
      estimatedNetLoss: '-124.87',
      targetTickAligned: true,
      stopLossTickAligned: true,
      quantityLotAligned: true,
      validationErrors: [],
      warnings: ['Statutory fees exceed gross gain on 1-lot position.'],
    },
  }),
  useSubmitOrder: () => ({
    mutate: vi.fn(),
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CODEX Phase 6: Multi-Broker Live Trading Terminal Test Suite', () => {
  it('Task 1: Renders Live Trading Terminal with Broker Account Selector and Header Controls', () => {
    renderWithClient(<LiveTradingTerminalPage />);

    // Page header check
    expect(screen.getAllByText('Live Trading Terminal')[0]).toBeInTheDocument();
    expect(screen.getByText('NIFTY 50')).toBeInTheDocument();

    // Connected account selector present
    expect(screen.getByText('Kotak Primary')).toBeInTheDocument();
    expect(screen.getByText('KOTAK1234')).toBeInTheDocument();

    // Mode switch buttons
    expect(screen.getByText('OFF')).toBeInTheDocument();
    expect(screen.getByText('PAPER')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();

    // Fast Action Controls
    expect(screen.getByText('Emergency Halt')).toBeInTheDocument();
    expect(screen.getByText('Reconcile')).toBeInTheDocument();
  });

  it('Task 2: Enforces Broker Capabilities Matrix on Order Types', () => {
    const mockContract = {
      instrumentToken: 'tok-24400-ce',
      tradingSymbol: 'NIFTY26OCT24400CE',
      optionType: 'CE' as any,
      strikePrice: 24400,
      expiryDate: '26-OCT-2026',
      ltp: 42.50,
      bidPrice: 42.40,
      askPrice: 42.55,
      bidQuantity: 1500,
      askQuantity: 1800,
      lotSize: 25,
      tickSize: 0.05,
    };

    renderWithClient(<TradeTicket selectedContract={mockContract} />);

    // Limit and SL-L order types are enabled
    expect(screen.getByText('LIMIT')).toBeInTheDocument();
    expect(screen.getByText('SL-L')).toBeInTheDocument();

    // MARKET order on options is strictly disabled by broker capability & exchange policy
    const marketBtn = screen.getByText('MARKET').closest('button');
    expect(marketBtn).toBeDisabled();
    expect(screen.getByText(/Market orders on options are disabled/i)).toBeInTheDocument();
  });

  it('Task 3 & 4: Calculates Margin Preview, Itemized Statutory Charges, and Net R:R', () => {
    const mockContract = {
      instrumentToken: 'tok-24400-ce',
      tradingSymbol: 'NIFTY26OCT24400CE',
      optionType: 'CE' as any,
      strikePrice: 24400,
      expiryDate: '26-OCT-2026',
      ltp: 42.50,
      bidPrice: 42.40,
      askPrice: 42.55,
      bidQuantity: 1500,
      askQuantity: 1800,
      lotSize: 25,
      tickSize: 0.05,
    };

    renderWithClient(<TradeTicket selectedContract={mockContract} />);

    // Available broker margin vs required margin
    expect(screen.getByText(/Available Broker Margin:/i)).toBeInTheDocument();
    expect(screen.getByText(/Margin Required:/i)).toBeInTheDocument();
    expect(screen.getByText('Sufficient Margin')).toBeInTheDocument();

    // Itemized charges
    expect(screen.getByText(/Estimated Statutory Deductions:/i)).toBeInTheDocument();
    expect(screen.getByText('Brokerage: ₹40.00')).toBeInTheDocument();
    expect(screen.getByText('STT: ₹1.34')).toBeInTheDocument();
    expect(screen.getByText('GST: ₹7.40')).toBeInTheDocument();

    // Net Risk-to-Reward Ratio displayed
    expect(screen.getByText('Net Risk:Reward Ratio:')).toBeInTheDocument();
    expect(screen.getByText('1 : 3.00')).toBeInTheDocument();
  });

  it('Task 5: Enforces Live Execution Safety Lock and Paper Matching', () => {
    const mockContract = {
      instrumentToken: 'tok-24400-ce',
      tradingSymbol: 'NIFTY26OCT24400CE',
      optionType: 'CE' as any,
      strikePrice: 24400,
      expiryDate: '26-OCT-2026',
      ltp: 42.50,
      bidPrice: 42.40,
      askPrice: 42.55,
      bidQuantity: 1500,
      askQuantity: 1800,
      lotSize: 25,
      tickSize: 0.05,
    };

    renderWithClient(<TradeTicket selectedContract={mockContract} />);

    // Submission button indicates Paper Order
    const submitBtn = screen.getByText('Place Paper BUY Order');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeEnabled();

    // Safety lock text is visible
    expect(
      screen.getByText(/Live real-money order execution remains safety-locked/i)
    ).toBeInTheDocument();

    // Open confirmation modal
    fireEvent.click(submitBtn);
    expect(screen.getByText('Confirm Order Placement')).toBeInTheDocument();
    expect(screen.getByText(/Master Safety Lock/i)).toBeInTheDocument();
  });

  it('Task 6: Order Event Timeline displays full audit log attributes', () => {
    renderWithClient(<TerminalBottomTabs />);

    // Switch to Order Event Timeline tab
    const timelineTabBtn = screen.getByText(/Order Event Timeline/i);
    expect(timelineTabBtn).toBeInTheDocument();
    fireEvent.click(timelineTabBtn);

    // Verify audit log table headers
    expect(screen.getByText('Timestamp (IST)')).toBeInTheDocument();
    expect(screen.getByText('Event / Lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Broker Order ID')).toBeInTheDocument();
    expect(screen.getByText('Req / Filled')).toBeInTheDocument();
    expect(screen.getByText('Raw Response')).toBeInTheDocument();
    expect(screen.getByText('Reason / Details')).toBeInTheDocument();

    // Verify audit event rows
    expect(screen.getByText('FILLED')).toBeInTheDocument();
    expect(screen.getByText('VALIDATING')).toBeInTheDocument();
    expect(screen.getByText('200_SIM_FILLED')).toBeInTheDocument();
    expect(screen.getByText('BRK-89210')).toBeInTheDocument();
  });
});
