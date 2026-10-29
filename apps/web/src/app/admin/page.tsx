'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useAuth } from '@/lib/auth/auth-context';
import {
  useAdminDashboard,
  useAdminUsers,
  useAdminUserDetail,
  useUpdateUserStatus,
  useAdminBrokers,
  useUpdateBrokerConfig,
  useAdminPlans,
  useSavePlan,
  useAdminInvoices,
  useAdminAuditLogs,
  usePlatformEmergencyControl,
} from '@/hooks/use-queries';
import {
  AdminBrokerConfig,
  AdminPlan,
  AdminUserListItem,
  UserRole,
} from '@autotrader/api-contracts';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CreditCard,
  Layers,
  Cpu,
  AlertTriangle,
  AlertOctagon,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  Sliders,
  FileText,
  RotateCcw,
  Building2,
  TrendingUp,
  Clock,
  Eye,
  Settings,
  HelpCircle,
  Save,
} from 'lucide-react';

export default function SuperAdminPortalPage() {
  const { user, isLoading: authLoading } = useAuth();

  // Role Security Guard (Task 1 & 8)
  const userRole = (user as any)?.role || 'trader';
  const isSuperAdmin =
    userRole === 'super_admin' || userRole === 'admin' || userRole === 'service_role';

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'USERS' | 'BROKERS' | 'PLANS' | 'BILLING' | 'OPERATIONS'
  >('OVERVIEW');

  // Queries
  const { data: dashboard, isLoading: dashLoading } = useAdminDashboard();
  const [userSearch, setUserSearch] = useState('');
  const { data: usersList, isLoading: usersLoading } = useAdminUsers(userSearch);
  const { data: brokersList } = useAdminBrokers();
  const { data: plansList } = useAdminPlans();
  const { data: invoicesList } = useAdminInvoices();
  const { data: auditLogs } = useAdminAuditLogs();

  // Mutations
  const updateUserStatus = useUpdateUserStatus();
  const updateBrokerConfig = useUpdateBrokerConfig();
  const savePlan = useSavePlan();
  const emergencyControl = usePlatformEmergencyControl();

  // Modal States
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: userDetail } = useAdminUserDetail(selectedUserId || undefined);
  const [userActionModalOpen, setUserActionModalOpen] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [targetUserStatus, setTargetUserStatus] = useState<boolean>(true);
  const [targetUserRole, setTargetUserRole] = useState<UserRole>('trader');

  const [editingBroker, setEditingBroker] = useState<AdminBrokerConfig | null>(null);
  const [brokerReason, setBrokerReason] = useState('');

  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyAction, setEmergencyAction] = useState<
    'HALT_ALL_TRADING' | 'DISABLE_NEW_ENTRIES' | 'RESUME_NORMAL_TRADING'
  >('HALT_ALL_TRADING');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // If loading authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-neutral-500 font-sans">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // Task 1 & 8: Strict Role Check - Never allow normal users to elevate or access
  if (!user || !isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-rose-200 rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Access Denied</h2>
          <p className="text-xs text-neutral-500 mt-1 font-sans">
            Super Administrator privileges are strictly required to access this portal.
          </p>
        </div>
        <div className="p-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-600 border border-neutral-200 text-left font-mono">
          Security Alert: Unauthorized access attempt has been logged with audit IP tracking.
        </div>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  // Handlers
  const handleConfirmUserStatus = async () => {
    if (!selectedUserId || !statusReason.trim()) return;
    try {
      await updateUserStatus.mutateAsync({
        userId: selectedUserId,
        payload: {
          isActive: targetUserStatus,
          role: targetUserRole,
          reason: statusReason,
        },
      });
      setUserActionModalOpen(false);
      setStatusReason('');
      setActionFeedback(`User status updated successfully.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message || 'Failed to update user'}`);
    }
  };

  const handleSaveBrokerConfig = async () => {
    if (!editingBroker || !brokerReason.trim()) return;
    try {
      await updateBrokerConfig.mutateAsync({
        brokerId: editingBroker.id,
        payload: {
          isMaintenanceMode: editingBroker.isMaintenanceMode,
          isPartnerApproved: editingBroker.isPartnerApproved,
          supportsLiveOrders: editingBroker.supportsLiveOrders,
          rateLimits: {
            ordersPerSecond: editingBroker.rateLimits.ordersPerSecond,
            quotesPerMinute: editingBroker.rateLimits.quotesPerMinute,
          },
          reason: brokerReason,
        },
      });
      setEditingBroker(null);
      setBrokerReason('');
      setActionFeedback(`Broker configuration updated.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message || 'Failed to update broker'}`);
    }
  };

  const handleSavePlanDetails = async () => {
    if (!editingPlan) return;
    try {
      await savePlan.mutateAsync({
        planId: editingPlan.id,
        payload: {
          name: editingPlan.name,
          description: editingPlan.description,
          priceINR: editingPlan.priceINR,
          billingInterval: editingPlan.billingInterval,
          isActive: editingPlan.isActive,
          maxBrokerConnections: editingPlan.maxBrokerConnections,
          maxActiveStrategies: editingPlan.maxActiveStrategies,
          liveTradingEnabled: editingPlan.liveTradingEnabled,
          historicalRetentionDays: editingPlan.historicalRetentionDays,
          reportingAccess: editingPlan.reportingAccess,
          webhookAlertsEnabled: editingPlan.webhookAlertsEnabled,
        },
      });
      setEditingPlan(null);
      setActionFeedback(`Plan ${editingPlan.id} saved.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message || 'Failed to update plan'}`);
    }
  };

  const handleConfirmEmergencyControl = async () => {
    if (!emergencyReason.trim()) return;
    try {
      const res = await emergencyControl.mutateAsync({
        action: emergencyAction,
        reason: emergencyReason,
        requireAuditConfirmation: true,
      });
      setEmergencyModalOpen(false);
      setEmergencyReason('');
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 6000);
    } catch (err: any) {
      setActionFeedback(`Emergency control error: ${err.message || 'Action failed'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      <PageHeader
        title="Super Admin & SaaS Management"
        subtitle="Platform-wide multi-broker telemetry, user privilege controls, database plans, verified billing, and operations"
        breadcrumbs={[
          { label: 'Platform' },
          { label: 'Super Admin Cockpit' },
        ]}
      />

      {/* Global Status Banner / Kill-Switch Notice */}
      {dashboard?.tradingFeatureAvailability.globalTradingHalted && (
        <div className="p-4 bg-rose-500 text-white rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <div>
              <span className="font-bold text-sm block">CRITICAL: GLOBAL TRADING IS CURRENTLY HALTED</span>
              <p className="text-xs text-rose-100">
                All order submissions and automated strategies are locked platform-wide.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmergencyAction('RESUME_NORMAL_TRADING');
              setEmergencyModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-xs hover:bg-rose-50"
          >
            Resume Trading
          </button>
        </div>
      )}

      {/* Action Notification */}
      {actionFeedback && (
        <div className="p-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button type="button" onClick={() => setActionFeedback(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'OVERVIEW'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Activity className="w-3.5 h-3.5" /> Dashboard Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'USERS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Users className="w-3.5 h-3.5" /> User Management
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BROKERS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'BROKERS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Building2 className="w-3.5 h-3.5" /> Broker Management
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PLANS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'PLANS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Sliders className="w-3.5 h-3.5" /> Plans & Entitlements
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BILLING')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'BILLING'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <CreditCard className="w-3.5 h-3.5" /> Billing & Invoices
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OPERATIONS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'OPERATIONS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <AlertOctagon className="w-3.5 h-3.5" /> Operations & Kill-Switch
        </button>
      </div>

      {/* TAB 1: OVERVIEW & REAL-DATA KPIS (Task 2) */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Registered Traders</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-2">
                {dashboard?.totalRegisteredUsers ?? 0}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {dashboard?.activeUsers24h ?? 0} active in last 24h
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Connected Brokers</span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-2">
                {dashboard?.activeBrokerConnections ?? 0}{' '}
                <span className="text-xs text-neutral-400 font-normal">/ {dashboard?.totalBrokerConnections ?? 0}</span>
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {dashboard?.connectionFailures24h ?? 0} connection errors in 24h
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Confirmed SaaS Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-2">
                ₹{dashboard?.totalRevenueINR ?? '0.00'}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                MRR: ₹{dashboard?.monthlyRecurringRevenueINR ?? '0.00'} • {dashboard?.activeSubscriptions ?? 0} subs
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Worker & Queue Health</span>
                <Cpu className="w-4 h-4 text-blue-600" />
              </div>
              <p className="tabular-nums text-lg font-bold text-neutral-900 mt-2">
                {dashboard?.workerQueueHealth.state ?? 'READY'}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Leader: {dashboard?.workerQueueHealth.isLeader ? 'YES' : 'STANDBY'} • Errors (24h): {dashboard?.systemErrors24h ?? 0}
              </span>
            </div>
          </div>

          {/* Broker Distribution Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-neutral-900">Broker Connections by Provider</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {['KOTAK_NEO', 'DHAN', 'UPSTOX', 'FYERS', 'ZERODHA', 'ANGEL_ONE'].map((prov) => {
                const count = dashboard?.brokerConnectionsByProvider?.[prov] || 0;
                return (
                  <div key={prov} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                    <span className="text-neutral-500 font-semibold text-[10px] block">{prov}</span>
                    <p className="tabular-nums font-bold text-base text-neutral-900 mt-0.5">{count} accounts</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (Task 3) */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">User Account & Permission Management</h4>
              <p className="text-xs text-neutral-500 font-sans">
                Review trader accounts, subscription states, and suspend or reactivate access with full audit trail.
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user email or name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Email & Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">KYC</th>
                  <th className="py-2.5 px-3">Brokers</th>
                  <th className="py-2.5 px-3">Registered At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {!usersList || usersList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-neutral-400 text-xs">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-neutral-900 block">{u.email}</span>
                        <span className="text-[11px] text-neutral-400">{u.fullName || '—'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider',
                            u.role === 'super_admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-700">{u.planName}</td>
                      <td className="py-3 px-3 text-[11px] text-neutral-500">{u.kycStatus}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] tabular-nums font-semibold text-neutral-800">
                          {u.brokerConnectionsCount} {u.connectedBrokers.length > 0 && `(${u.connectedBrokers.join(', ')})`}
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums text-neutral-500 text-[11px]">
                        {formatISTDateTime(u.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setTargetUserStatus(u.isActive);
                            setTargetUserRole(u.role);
                            setUserActionModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BROKER MANAGEMENT (Task 4) */}
      {activeTab === 'BROKERS' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h4 className="font-bold text-sm text-neutral-900">Canonical Broker Capability & Maintenance</h4>
            <p className="text-xs text-neutral-500 font-sans">
              Manage partner status, maintenance windows, and rate limits without exposing user credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brokersList?.map((b) => (
              <div key={b.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm text-neutral-900">{b.name}</span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                      b.isMaintenanceMode
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    )}
                  >
                    {b.isMaintenanceMode ? 'Maintenance' : 'Operational'}
                  </span>
                </div>

                <div className="space-y-1.5 text-neutral-600 text-[11px]">
                  <div>Auth Method: <strong className="text-neutral-900">{b.authMethod}</strong></div>
                  <div>Partner Status: <strong className="text-neutral-900">{b.isPartnerApproved ? 'Approved Partner' : 'Standard API'}</strong></div>
                  <div>Rate Limits: <strong className="text-neutral-900">{b.rateLimits.ordersPerSecond} orders/sec, {b.rateLimits.quotesPerMinute} quotes/min</strong></div>
                  <div>Active Connections: <strong className="text-neutral-900 tabular-nums">{b.activeConnectionsCount}</strong></div>
                  <div className="truncate">Base API: <span className="font-mono text-[10px] text-neutral-500">{b.environmentEndpoints.apiBaseUrl}</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBroker(b);
                    setBrokerReason('');
                  }}
                  className="w-full py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold border border-neutral-300 shadow-2xs"
                >
                  Configure Broker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLANS AND ENTITLEMENTS (Task 5) */}
      {activeTab === 'PLANS' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Database-Driven SaaS Plans & Entitlements</h4>
              <p className="text-xs text-neutral-500 font-sans">
                Commercial plans define software feature access and quota allowances; they never override broker/exchange restrictions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plansList?.map((p) => (
              <div key={p.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="font-bold text-base text-neutral-900">{p.name}</span>
                  <span className="tabular-nums font-bold text-blue-600 text-sm">₹{p.priceINR} / mo</span>
                </div>
                <p className="text-[11px] text-neutral-500 h-8">{p.description}</p>
                <div className="space-y-1.5 text-neutral-700 text-[11px]">
                  <div>Broker Connections: <strong className="tabular-nums">{p.maxBrokerConnections}</strong></div>
                  <div>Active Strategies: <strong className="tabular-nums">{p.maxActiveStrategies}</strong></div>
                  <div>Live Execution: <strong>{p.liveTradingEnabled ? 'Enabled' : 'Paper Only'}</strong></div>
                  <div>Data Retention: <strong className="tabular-nums">{p.historicalRetentionDays} days</strong></div>
                  <div>Webhook Alerts: <strong>{p.webhookAlertsEnabled ? 'Yes' : 'No'}</strong></div>
                  <div>Subscribers: <strong className="tabular-nums">{p.subscribersCount} traders</strong></div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPlan(p)}
                  className="w-full py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold border border-neutral-300 shadow-2xs"
                >
                  Edit Plan Quotas
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BILLING AND INVOICES (Task 6) */}
      {activeTab === 'BILLING' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Confirmed SaaS Invoices & Verified Payments</h4>
              <p className="text-xs text-neutral-500 font-sans">
                Server-side verified webhooks with HMAC signatures and idempotency keys. Never trusts unverified frontend redirects.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>HMAC Signature Webhook Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Trader Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount (INR)</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {!invoicesList || invoicesList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-neutral-400 text-xs">
                      No invoices recorded yet. Invoices generate on server-side verified payment capture.
                    </td>
                  </tr>
                ) : (
                  invoicesList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-semibold text-neutral-700">{inv.userEmail}</td>
                      <td className="py-3 px-3">{inv.planName}</td>
                      <td className="py-3 px-3 tabular-nums font-bold text-neutral-900">₹{inv.amountINR}</td>
                      <td className="py-3 px-3 font-mono text-[11px]">{inv.paymentProvider}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">{inv.paymentId || '—'}</td>
                      <td className="py-3 px-3 tabular-nums text-neutral-500 text-[11px]">{formatISTDateTime(inv.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: OPERATIONS, EMERGENCY KILL-SWITCH & AUDIT LOGS (Task 7) */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-6">
          {/* Emergency Control Box */}
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Platform-Wide Emergency Trading Controls</span>
            </div>
            <p className="text-rose-700">
              Immediate kill-switch to halt automated executions across all connected brokers or disable new position entries during market anomalies.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmergencyAction('HALT_ALL_TRADING');
                  setEmergencyModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <AlertOctagon className="w-4 h-4" /> Halt All Trading Platform-Wide
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmergencyAction('DISABLE_NEW_ENTRIES');
                  setEmergencyModalOpen(true);
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Disable New Entries
              </button>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-neutral-900">Administrator Action Audit Ledger</h4>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp (IST)</th>
                    <th className="py-2.5 px-3">Administrator</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Details / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {!auditLogs || auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-400 text-xs">
                        No audit records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-500">
                          {formatISTDateTime(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">{log.actorEmail || 'System'}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">
                          {log.entityName}:{log.entityId}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 text-[11px] max-w-sm truncate">
                          {JSON.stringify(log.details || {})}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Manage User Status */}
      {userActionModalOpen && selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Manage User Account</h3>
            <p className="text-xs text-neutral-500">
              User ID: <span className="font-mono">{selectedUserId}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-700 font-semibold block mb-1">Account Active Status</label>
                <select
                  value={targetUserStatus ? 'active' : 'suspended'}
                  onChange={(e) => setTargetUserStatus(e.target.value === 'active')}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="suspended">Suspended (Access Blocked)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">User Role</label>
                <select
                  value={targetUserRole}
                  onChange={(e) => setTargetUserRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <option value="trader">Trader (Normal User)</option>
                  <option value="support">Support</option>
                  <option value="admin">Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">
                  Mandatory Audit Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="State operational reason for this status change..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserActionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUserStatus}
                disabled={!statusReason.trim() || updateUserStatus.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
              >
                {updateUserStatus.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Configure Broker */}
      {editingBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Configure {editingBroker.name}</h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBroker.isMaintenanceMode}
                  onChange={(e) =>
                    setEditingBroker({ ...editingBroker, isMaintenanceMode: e.target.checked })
                  }
                  className="rounded border-neutral-300 text-blue-600"
                />
                <span className="font-semibold text-neutral-800">Enable Maintenance Mode (Block Orders)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBroker.isPartnerApproved}
                  onChange={(e) =>
                    setEditingBroker({ ...editingBroker, isPartnerApproved: e.target.checked })
                  }
                  className="rounded border-neutral-300 text-blue-600"
                />
                <span className="font-semibold text-neutral-800">Partner Approved Integration</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-600 font-medium block">Orders / Sec</label>
                  <input
                    type="number"
                    value={editingBroker.rateLimits.ordersPerSecond}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        rateLimits: {
                          ...editingBroker.rateLimits,
                          ordersPerSecond: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-neutral-600 font-medium block">Quotes / Min</label>
                  <input
                    type="number"
                    value={editingBroker.rateLimits.quotesPerMinute}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        rateLimits: {
                          ...editingBroker.rateLimits,
                          quotesPerMinute: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">
                  Audit Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="State reason for configuration update..."
                  value={brokerReason}
                  onChange={(e) => setBrokerReason(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBroker(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBrokerConfig}
                disabled={!brokerReason.trim() || updateBrokerConfig.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
              >
                {updateBrokerConfig.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Edit Plan: {editingPlan.name}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-600 font-medium block">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-600 font-medium block">Monthly Price (INR)</label>
                  <input
                    type="text"
                    value={editingPlan.priceINR}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceINR: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-neutral-600 font-medium block">Max Brokers</label>
                  <input
                    type="number"
                    value={editingPlan.maxBrokerConnections}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, maxBrokerConnections: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-600 font-medium block">Max Strategies</label>
                  <input
                    type="number"
                    value={editingPlan.maxActiveStrategies}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, maxActiveStrategies: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-neutral-600 font-medium block">Retention Days</label>
                  <input
                    type="number"
                    value={editingPlan.historicalRetentionDays}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        historicalRetentionDays: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan.liveTradingEnabled}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, liveTradingEnabled: e.target.checked })
                  }
                  className="rounded border-neutral-300 text-blue-600"
                />
                <span className="font-semibold text-neutral-800">Permit Live Trading Execution</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlanDetails}
                disabled={savePlan.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
              >
                {savePlan.isPending ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Emergency Control Confirmation */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-rose-300 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">Confirm Emergency Action</h3>
                <p className="text-xs text-rose-600 font-semibold">{emergencyAction}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              This action affects all connected trading accounts across all brokers. It will be recorded in the immutable platform audit ledger with your credentials.
            </p>

            <div>
              <label className="text-neutral-700 text-xs font-semibold block mb-1">
                Mandatory Operational Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="State critical reason (e.g. Exchange volatility spike, network anomaly, manual market halt)..."
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergencyControl}
                disabled={!emergencyReason.trim() || emergencyControl.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {emergencyControl.isPending ? 'Executing...' : 'Confirm Emergency Lock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
