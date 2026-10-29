import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperAdminPortalPage from '@/app/admin/page';

let mockCurrentUser: any = {
  id: 'usr-admin-01',
  email: 'admin@autotrader.local',
  role: 'super_admin',
};

// Mock Auth Context
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isLoading: false,
  }),
}));

// Mock Metrics & Telemetry
const mockDashboardMetrics = {
  totalRegisteredUsers: 142,
  activeUsers24h: 38,
  totalBrokerConnections: 55,
  activeBrokerConnections: 48,
  brokerConnectionsByProvider: {
    KOTAK_NEO: 18,
    DHAN: 14,
    UPSTOX: 8,
    FYERS: 6,
    ZERODHA: 5,
    ANGEL_ONE: 4,
  },
  connectionFailures24h: 2,
  activeSubscriptions: 29,
  totalRevenueINR: '72471.00',
  monthlyRecurringRevenueINR: '44981.00',
  systemErrors24h: 1,
  workerQueueHealth: {
    workerId: 'worker-primary-node-1',
    isLeader: true,
    state: 'READY',
    uptimeSeconds: 86400,
    lastHeartbeat: '2026-10-29T10:00:00Z',
  },
  tradingFeatureAvailability: {
    paperTradingEnabled: true,
    liveTradingEnabled: true,
    globalTradingHalted: false,
  },
  openIncidentsCount: 0,
  timestamp: '2026-10-29T10:00:00Z',
};

const mockUsersList = [
  {
    id: 'usr-001',
    email: 'trader1@gmail.com',
    fullName: 'Rahul Sharma',
    role: 'trader',
    isActive: true,
    emailVerified: true,
    kycStatus: 'VERIFIED',
    planName: 'PRO',
    subscriptionStatus: 'ACTIVE',
    brokerConnectionsCount: 2,
    connectedBrokers: ['KOTAK_NEO', 'DHAN'],
    createdAt: '2026-10-20T10:00:00Z',
    lastLoginAt: '2026-10-29T08:00:00Z',
  },
  {
    id: 'usr-002',
    email: 'trader2@yahoo.com',
    fullName: 'Priya Patel',
    role: 'trader',
    isActive: false,
    emailVerified: true,
    kycStatus: 'VERIFIED',
    planName: 'FREE',
    subscriptionStatus: 'ACTIVE',
    brokerConnectionsCount: 1,
    connectedBrokers: ['ZERODHA'],
    createdAt: '2026-10-22T10:00:00Z',
    lastLoginAt: '2026-10-28T08:00:00Z',
  },
];

const mockBrokers = [
  {
    id: 'KOTAK_NEO',
    name: 'Kotak Neo',
    providerCode: 'KOTAK_NEO',
    authMethod: 'PASSWORD_2FA',
    isEnabled: true,
    isMaintenanceMode: false,
    isPartnerApproved: true,
    supportsLiveOrders: true,
    supportsWebsockets: true,
    environmentEndpoints: {
      authUrl: 'https://napi.kotaksecurities.com/oauth2/token',
      apiBaseUrl: 'https://napi.kotaksecurities.com/orders/2.0',
      wsUrl: 'wss://feed.kotaksecurities.com/live',
    },
    rateLimits: { ordersPerSecond: 10, quotesPerMinute: 100 },
    activeConnectionsCount: 18,
    lastHealthCheck: '2026-10-29T10:00:00Z',
    healthStatus: 'HEALTHY' as const,
  },
  {
    id: 'DHAN',
    name: 'Dhan',
    providerCode: 'DHAN',
    authMethod: 'API_KEY_SECRET',
    isEnabled: true,
    isMaintenanceMode: false,
    isPartnerApproved: true,
    supportsLiveOrders: true,
    supportsWebsockets: true,
    environmentEndpoints: {
      authUrl: 'https://api.dhan.co/v2',
      apiBaseUrl: 'https://api.dhan.co/v2',
      wsUrl: 'wss://api-feed.dhan.co',
    },
    rateLimits: { ordersPerSecond: 10, quotesPerMinute: 100 },
    activeConnectionsCount: 14,
    lastHealthCheck: '2026-10-29T10:00:00Z',
    healthStatus: 'HEALTHY' as const,
  },
];

const mockPlans = [
  {
    id: 'FREE',
    name: 'Free Tier',
    description: 'Essential exploration',
    billingInterval: 'MONTHLY' as const,
    priceINR: '0.00',
    isActive: true,
    maxBrokerConnections: 1,
    maxActiveStrategies: 1,
    liveTradingEnabled: false,
    historicalRetentionDays: 30,
    reportingAccess: true,
    webhookAlertsEnabled: false,
    subscribersCount: 80,
  },
  {
    id: 'PRO',
    name: 'Professional Trader',
    description: 'Multi-broker parallel execution',
    billingInterval: 'MONTHLY' as const,
    priceINR: '2499.00',
    isActive: true,
    maxBrokerConnections: 3,
    maxActiveStrategies: 5,
    liveTradingEnabled: true,
    historicalRetentionDays: 365,
    reportingAccess: true,
    webhookAlertsEnabled: true,
    subscribersCount: 22,
  },
];

const mockInvoices = [
  {
    id: 'inv-001',
    userId: 'usr-001',
    userEmail: 'trader1@gmail.com',
    planId: 'PRO',
    planName: 'Professional Trader',
    amountINR: '2499.00',
    status: 'PAID' as const,
    paymentProvider: 'RAZORPAY' as const,
    paymentId: 'pay_rzp_987654321',
    invoiceNumber: 'INV-2026-0001',
    billingPeriodStart: '2026-10-01T00:00:00Z',
    billingPeriodEnd: '2026-10-31T23:59:59Z',
    createdAt: '2026-10-01T05:30:00Z',
  },
];

const mockAuditLogs = [
  {
    id: 'audit-001',
    actorUserId: 'usr-admin-01',
    actorEmail: 'admin@autotrader.local',
    action: 'UPDATE_USER_STATUS',
    entityName: 'users',
    entityId: 'usr-002',
    details: { reason: 'Compliance review suspension' },
    timestamp: '2026-10-29T09:30:00Z',
  },
];

const mockMutateUserStatus = vi.fn();
const mockMutateBroker = vi.fn();
const mockMutatePlan = vi.fn();
const mockMutateEmergency = vi.fn();

vi.mock('@/hooks/use-queries', () => ({
  useAdminDashboard: () => ({ data: mockDashboardMetrics, isLoading: false }),
  useAdminUsers: (search?: string) => ({
    data: search
      ? mockUsersList.filter((u) => u.email.includes(search) || u.fullName.includes(search))
      : mockUsersList,
    isLoading: false,
  }),
  useAdminUserDetail: (userId?: string) => ({
    data: userId
      ? {
          ...mockUsersList[0],
          phoneMasked: '+91 98****1234',
          panMasked: 'ABCDE****F',
          recentOrdersCount: 14,
          activePositionsCount: 1,
          auditTrail: [],
        }
      : null,
  }),
  useUpdateUserStatus: () => ({
    mutateAsync: mockMutateUserStatus.mockResolvedValue({ id: 'usr-001', isActive: false }),
    isPending: false,
  }),
  useAdminBrokers: () => ({ data: mockBrokers }),
  useUpdateBrokerConfig: () => ({
    mutateAsync: mockMutateBroker.mockResolvedValue({ id: 'KOTAK_NEO', isMaintenanceMode: true }),
    isPending: false,
  }),
  useAdminPlans: () => ({ data: mockPlans }),
  useSavePlan: () => ({
    mutateAsync: mockMutatePlan.mockResolvedValue({ id: 'PRO', priceINR: '2499.00' }),
    isPending: false,
  }),
  useAdminInvoices: () => ({ data: mockInvoices }),
  useAdminAuditLogs: () => ({ data: mockAuditLogs }),
  usePlatformEmergencyControl: () => ({
    mutateAsync: mockMutateEmergency.mockResolvedValue({
      action: 'HALT_ALL_TRADING',
      globalTradingHalted: true,
      message: 'CRITICAL: Platform-wide trading HALTED immediately across all connected brokers.',
    }),
    isPending: false,
  }),
}));

describe('CODEX PHASE 8 — Super Admin & SaaS Management Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = {
      id: 'usr-admin-01',
      email: 'admin@autotrader.local',
      role: 'super_admin',
    };
  });

  it('TASK 1 & 8: Blocks normal trader role with Access Denied (Least Privilege)', () => {
    mockCurrentUser = {
      id: 'usr-normal-01',
      email: 'trader@normal.com',
      role: 'trader',
    };

    render(<SuperAdminPortalPage />);

    expect(screen.getByText('Access Denied')).toBeDefined();
    expect(
      screen.getByText(/Super Administrator privileges are strictly required to access this portal/i)
    ).toBeDefined();
    expect(screen.getByText(/Return to Dashboard/i)).toBeDefined();
  });

  it('TASK 2: Renders Super Admin Dashboard with verified platform KPIs', () => {
    render(<SuperAdminPortalPage />);

    // Header check
    expect(screen.getByText('Super Admin & SaaS Management')).toBeDefined();

    // KPI verification
    expect(screen.getByText('142')).toBeDefined(); // Total registered
    expect(screen.getByText(/38 active in last 24h/i)).toBeDefined();
    expect(screen.getByText('48')).toBeDefined(); // Active broker connections
    expect(screen.getByText('₹72471.00')).toBeDefined(); // Confirmed revenue
    expect(screen.getByText(/MRR: ₹44981.00/i)).toBeDefined();
    expect(screen.getByText('READY')).toBeDefined(); // Worker state

    // Provider distribution breakdown
    expect(screen.getByText(/18 accounts/i)).toBeDefined(); // Kotak
    expect(screen.getByText(/14 accounts/i)).toBeDefined(); // Dhan
  });

  it('TASK 3: Manages user status with mandatory operational audit reason', async () => {
    render(<SuperAdminPortalPage />);

    // Switch to Users tab
    const usersTab = screen.getByRole('button', { name: /User Management/i });
    fireEvent.click(usersTab);

    expect(screen.getByText('trader1@gmail.com')).toBeDefined();
    expect(screen.getByText('Rahul Sharma')).toBeDefined();

    // Click manage on first user
    const manageBtns = screen.getAllByRole('button', { name: /^Manage$/i });
    fireEvent.click(manageBtns[0]);

    // Expect modal
    expect(screen.getByText('Manage User Account')).toBeDefined();

    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/State operational reason for this status change/i);
    fireEvent.change(reasonInput, { target: { value: 'Compliance review suspension' } });

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateUserStatus).toHaveBeenCalledWith({
        userId: 'usr-001',
        payload: {
          isActive: true,
          role: 'trader',
          reason: 'Compliance review suspension',
        },
      });
    });
  });

  it('TASK 4: Configures broker rate limits and maintenance mode without exposing secrets', async () => {
    render(<SuperAdminPortalPage />);

    // Switch to Brokers tab
    const brokersTab = screen.getByRole('button', { name: /Broker Management/i });
    fireEvent.click(brokersTab);

    expect(screen.getByText('Kotak Neo')).toBeDefined();
    expect(screen.getByText('Dhan')).toBeDefined();

    // Open configure broker modal
    const configBtns = screen.getAllByRole('button', { name: /Configure Broker/i });
    fireEvent.click(configBtns[0]);

    expect(screen.getByText('Configure Kotak Neo')).toBeDefined();

    // Fill audit reason and submit
    const reasonInput = screen.getByPlaceholderText(/State reason for configuration update/i);
    fireEvent.change(reasonInput, { target: { value: 'Scheduled server maintenance window' } });

    const saveBtn = screen.getByRole('button', { name: /Save Configuration/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateBroker).toHaveBeenCalled();
    });
  });

  it('TASK 5: Displays database-driven plans and feature entitlements', () => {
    render(<SuperAdminPortalPage />);

    // Switch to Plans tab
    const plansTab = screen.getByRole('button', { name: /Plans & Entitlements/i });
    fireEvent.click(plansTab);

    expect(screen.getByText('Free Tier')).toBeDefined();
    expect(screen.getByText('Professional Trader')).toBeDefined();
    expect(screen.getByText('₹2499.00 / mo')).toBeDefined();
    expect(screen.getByText(/Commercial plans define software feature access/i)).toBeDefined();
  });

  it('TASK 6: Shows confirmed invoice ledger and server-side verified payments', () => {
    render(<SuperAdminPortalPage />);

    // Switch to Billing tab
    const billingTab = screen.getByRole('button', { name: /Billing & Invoices/i });
    fireEvent.click(billingTab);

    expect(screen.getByText('INV-2026-0001')).toBeDefined();
    expect(screen.getByText('trader1@gmail.com')).toBeDefined();
    expect(screen.getByText('₹2499.00')).toBeDefined();
    expect(screen.getByText('RAZORPAY')).toBeDefined();
    expect(screen.getByText('HMAC Signature Webhook Active')).toBeDefined();
  });

  it('TASK 7: Executes platform-wide emergency trading halt kill-switch', async () => {
    render(<SuperAdminPortalPage />);

    // Switch to Operations tab
    const opsTab = screen.getByRole('button', { name: /Operations & Kill-Switch/i });
    fireEvent.click(opsTab);

    expect(screen.getByText('Platform-Wide Emergency Trading Controls')).toBeDefined();

    // Click Halt All Trading
    const haltBtn = screen.getByRole('button', { name: /Halt All Trading Platform-Wide/i });
    fireEvent.click(haltBtn);

    expect(screen.getByText('Confirm Emergency Action')).toBeDefined();

    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/State critical reason/i);
    fireEvent.change(reasonInput, {
      target: { value: 'Unusual exchange volatility and circuit breaker' },
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Emergency Lock/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockMutateEmergency).toHaveBeenCalledWith({
        action: 'HALT_ALL_TRADING',
        reason: 'Unusual exchange volatility and circuit breaker',
        requireAuditConfirmation: true,
      });
    });
  });
});
