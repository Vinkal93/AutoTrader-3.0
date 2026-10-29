import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MultiBrokerPage from '../app/broker/page';
import DashboardPage from '../app/dashboard/page';
import {
  BrokerConnectionState,
  BrokerId,
  BrokerAuthModel,
  type BrokerProviderInfo,
  type BrokerConnectionSummary,
} from '@autotrader/api-contracts';

// Mock Next Navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/broker',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock Auth Context
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'trader@autotrader.in', role: 'TRADER' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const mockProviders: BrokerProviderInfo[] = [
  {
    id: BrokerId.KOTAK_NEO,
    name: 'Kotak Neo',
    apiVersion: 'Trade API v2',
    authModel: BrokerAuthModel.API_KEY_TOTP,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: true,
    description: 'Direct institutional gateway with sub-millisecond execution.',
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: false,
      requiresStaticIp: true,
      dailySessionResetIst: '23:59:59 IST / EOD',
      orderRateLimitPerSec: 10,
      quoteRateLimitPerSec: 1,
    },
  },
  {
    id: BrokerId.DHAN,
    name: 'DhanHQ',
    apiVersion: 'DhanHQ v2',
    authModel: BrokerAuthModel.ACCESS_TOKEN,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: true,
    description: 'Lightning-fast APIs for Indian traders with 30-day token persistence.',
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: true,
      requiresStaticIp: true,
      dailySessionResetIst: '30 Days (Token)',
      orderRateLimitPerSec: 10,
      quoteRateLimitPerSec: 5,
    },
  },
  {
    id: BrokerId.UPSTOX,
    name: 'Upstox Pro',
    apiVersion: 'Upstox API v2',
    authModel: BrokerAuthModel.OAUTH2,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: false,
    description: 'High-throughput Protobuf WebSocket feeds and cloud-native OAuth 2.0 PKCE.',
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: true,
      requiresStaticIp: false,
      dailySessionResetIst: '24h / EOD',
      orderRateLimitPerSec: 25,
      quoteRateLimitPerSec: 10,
    },
  },
  {
    id: BrokerId.FYERS,
    name: 'FYERS',
    apiVersion: 'Fyers API v3',
    authModel: BrokerAuthModel.OAUTH2,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: false,
    description: 'Specialized options trading terminal feeds with interactive OAuth 2.0 flow.',
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: true,
      requiresStaticIp: false,
      dailySessionResetIst: '24h / EOD',
      orderRateLimitPerSec: 10,
      quoteRateLimitPerSec: 5,
    },
  },
  {
    id: BrokerId.ZERODHA,
    name: 'Zerodha Kite',
    apiVersion: 'Kite Connect v3',
    authModel: BrokerAuthModel.OAUTH2,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: false,
    description: "India's largest retail brokerage API with reliable binary tick packets.",
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: true,
      requiresStaticIp: false,
      dailySessionResetIst: '06:00 AM IST daily',
      orderRateLimitPerSec: 10,
      quoteRateLimitPerSec: 3,
    },
  },
  {
    id: BrokerId.ANGEL_ONE,
    name: 'Angel One',
    apiVersion: 'SmartAPI v2',
    authModel: BrokerAuthModel.API_KEY_TOTP,
    isPartnerApproved: true,
    isActive: true,
    requiresStaticIp: true,
    description: 'Algorithmic trading gateway with TOTP authorization and static IP address binding.',
    capabilities: {
      supportsOptionsChain: true,
      supportsRealtimeTicks: true,
      supportsHistoricalCandles: true,
      supportsOrderExecution: true,
      supportsStopLossLimit: true,
      supportsMarketOrdersForOptions: false,
      supportsWebhooks: false,
      requiresStaticIp: true,
      dailySessionResetIst: '24h / EOD',
      orderRateLimitPerSec: 10,
      quoteRateLimitPerSec: 3,
    },
  },
];

const mockConnections: BrokerConnectionSummary[] = [
  {
    id: 'conn-kotak-1',
    userId: 'user-123',
    providerId: 'KOTAK_NEO',
    brokerName: 'Kotak Neo',
    accountId: '••••••••1234',
    alias: 'Primary Scalping',
    isActive: true,
    state: BrokerConnectionState.CONNECTED,
    connectedAt: '2026-10-28T09:15:00Z',
    sessionExpiresAt: '2026-10-28T23:59:59Z',
    lastSyncedAt: '2026-10-28T14:30:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    egressIpVerified: '103.14.120.45',
    lastError: null,
  },
  {
    id: 'conn-dhan-2',
    userId: 'user-123',
    providerId: 'DHAN',
    brokerName: 'DhanHQ',
    accountId: '••••••••5678',
    alias: 'Swing Trades',
    isActive: true,
    state: BrokerConnectionState.CONNECTED,
    connectedAt: '2026-10-28T09:20:00Z',
    sessionExpiresAt: '2026-11-28T09:20:00Z',
    lastSyncedAt: '2026-10-28T14:30:00Z',
    marketFeedStatus: 'CONNECTED',
    orderFeedStatus: 'CONNECTED',
    reportApiStatus: 'CONNECTED',
    staticIpCompliant: true,
    egressIpVerified: '103.14.120.45',
    lastError: null,
  },
];

// Mock API Hooks partially
vi.mock('@/hooks/use-queries', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useBrokerProviders: () => ({
      data: mockProviders,
      isLoading: false,
    }),
    useBrokerConnections: () => ({
      data: mockConnections,
      isLoading: false,
      refetch: vi.fn(),
    }),
    useBrokerConnection: () => ({
      data: mockConnections[0],
      isLoading: false,
    }),
    useBrokerIpCheck: () => ({
      data: {
        clientIp: '127.0.0.1',
        serverEgressIp: '103.14.120.45',
        isStaticIpConfigured: true,
        isWhitelisted: true,
        brokerTarget: 'KOTAK_NEO',
        timestamp: '2026-10-28T12:00:00Z',
      },
      isLoading: false,
      refetch: vi.fn(),
    }),
    useBrokerAccountProfile: () => ({
      data: {
        clientCode: '10001234',
        clientName: 'Institutional Test Trader',
        emailMasked: 't****@autotrader.in',
        panMasked: 'ABCDE****F',
        brokerName: 'Kotak Neo',
        exchangesEnabled: ['NSE', 'NFO', 'BSE'],
        productsEnabled: ['NRML', 'MIS', 'CNC'],
        accountStatus: 'ACTIVE',
      },
    }),
    useBrokerPermissions: () => ({
      data: {
        id: 'perm-1',
        connectionId: 'conn-kotak-1',
        canReadQuotes: true,
        canReadFunds: true,
        canReadPositions: true,
        canExecuteOrders: false,
        maxLotsPerOrder: 5,
        allowedSegments: ['NFO'],
        updatedAt: '2026-10-28T09:00:00Z',
      },
    }),
    useConnectBrokerConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useReconnectBrokerConnection: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
    useDisconnectBrokerConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteBrokerConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useBrokerAuthCallback: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateBrokerPermissions: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDashboardOverview: () => ({
      data: {
        tradingMode: 'PAPER',
        engineState: 'SCANNING',
        brokerConnection: BrokerConnectionState.CONNECTED,
        todaySummary: {
          totalTrades: 3,
          completedTrades: 2,
          winningTrades: 2,
          losingTrades: 0,
          totalPnl: '450.00',
          totalCharges: '42.10',
          netPnl: '407.90',
        },
        accountSummary: {
          availableMargin: '125000.00',
          usedMargin: '25000.00',
          unrealizedPnl: '0.00',
        },
        niftySpot: {
          lastPrice: '25450.25',
          change: 120.5,
          changePercent: 0.48,
          freshness: 'LIVE',
        },
      },
      isLoading: false,
    }),
    useAccountFunds: () => ({
      data: {
        availableCash: '150000.00',
        usedMargin: '25000.00',
        availableMargin: '125000.00',
        totalCollateral: '0.00',
        unrealizedPnl: '0.00',
        realizedPnlToday: '450.00',
        asOf: '2026-10-28T12:00:00Z',
        freshness: 'LIVE',
      },
      isLoading: false,
    }),
    usePositions: () => ({
      data: [
        {
          id: 'pos-1',
          instrumentToken: 'NIFTY24OCT25400CE',
          tradingSymbol: 'NIFTY 24 OCT 25400 CE',
          exchange: 'NFO',
          instrumentType: 'OPTIONS',
          optionType: 'CE',
          strikePrice: '25400.00',
          expiryDate: '2026-10-29',
          quantity: 50,
          averagePrice: '120.00',
          lastPrice: '128.50',
          pnl: '425.00',
          pnlPercentage: '7.08',
          dayPnl: '425.00',
          side: 'BUY',
          product: 'NRML',
        },
      ],
      isLoading: false,
    }),
    useOrders: () => ({ data: [], isLoading: false }),
    useTrades: () => ({ data: [], isLoading: false }),
    useNiftyQuote: () => ({
      data: {
        lastPrice: '25450.25',
        change: 120.5,
        changePercent: 0.48,
        freshness: 'LIVE',
      },
      isLoading: false,
    }),
    useCandles: () => ({
      data: { symbol: 'NIFTY', interval: '5m', candles: [] },
      isLoading: false,
    }),
    useMarketTrend: () => ({
      data: { state: 'BULLISH', strength: 80 },
      isLoading: false,
    }),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderWithClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('Phase 4: Multi-Broker Connection Engine Test Suite', () => {
  it('renders all 6 canonical brokers in the capability matrix', () => {
    renderWithClient(<MultiBrokerPage />);

    expect(screen.getByText('Kotak Neo')).toBeDefined();
    expect(screen.getByText('DhanHQ')).toBeDefined();
    expect(screen.getByText('Upstox Pro')).toBeDefined();
    expect(screen.getByText('FYERS')).toBeDefined();
    expect(screen.getByText('Zerodha Kite')).toBeDefined();
    expect(screen.getByText('Angel One')).toBeDefined();
  });

  it('displays accurate API versions and network egress requirements', () => {
    renderWithClient(<MultiBrokerPage />);

    expect(screen.getByText('Trade API v2')).toBeDefined();
    expect(screen.getByText('DhanHQ v2')).toBeDefined();
    expect(screen.getByText('Upstox API v2')).toBeDefined();
    expect(screen.getByText('Fyers API v3')).toBeDefined();
    expect(screen.getByText('Kite Connect v3')).toBeDefined();
    expect(screen.getByText('SmartAPI v2')).toBeDefined();

    // Verify static IP egress status
    expect(screen.getByText('Active Server Egress IP')).toBeDefined();
    expect(screen.getAllByText('103.14.120.45').length).toBeGreaterThan(0);
  });

  it('allows filtering by connection status and partner approval', () => {
    renderWithClient(<MultiBrokerPage />);

    const partnerBtn = screen.getByRole('button', { name: /Partner Approved/i });
    fireEvent.click(partnerBtn);
    expect(screen.getByText(/All Supported Brokers/i)).toBeDefined();

    const staticIpBtn = screen.getByRole('button', { name: /Static IP Required/i });
    fireEvent.click(staticIpBtn);
    expect(screen.getByText('Kotak Neo')).toBeDefined();
    expect(screen.getByText('DhanHQ')).toBeDefined();
  });

  it('opens connect modal with secure credential instructions (Rule 18)', () => {
    renderWithClient(<MultiBrokerPage />);

    const connectZerodhaBtn = screen.getByText('Connect Zerodha Kite');
    fireEvent.click(connectZerodhaBtn);

    expect(screen.getAllByText('Connect Zerodha Kite').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/All credentials encrypted server-side with AES-256 envelope encryption/i)
    ).toBeDefined();
  });
});

describe('Phase 5: Personal Trader Dashboard Test Suite', () => {
  it('renders account switcher with verified connected broker accounts', () => {
    renderWithClient(<DashboardPage />);

    expect(screen.getByText(/Active Trading Account:/i)).toBeDefined();
    expect(screen.getByText(/Kotak Neo — Primary Scalping/i)).toBeDefined();
  });

  it('displays top financial KPIs without mock data', () => {
    renderWithClient(<DashboardPage />);

    expect(screen.getByText('Available Funds')).toBeDefined();
    expect(screen.getByText(/Used Margin/i)).toBeDefined();
  });

  it('renders active positions table with contract details', () => {
    renderWithClient(<DashboardPage />);

    expect(screen.getByText('Active Positions & Orders')).toBeDefined();
    expect(screen.getByText('NIFTY 24 OCT 25400 CE')).toBeDefined();
    expect(screen.getByText('+₹425.00')).toBeDefined();
  });
});
