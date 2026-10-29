'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { FinancialKpiGrid } from '@/components/dashboard/FinancialKpiGrid';
import { MarketCandleChart } from '@/components/dashboard/MarketCandleChart';
import { ActiveStrategyCard } from '@/components/dashboard/ActiveStrategyCard';
import { AutomationMonitorCard } from '@/components/dashboard/AutomationMonitorCard';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable';
import { OpenPositionsTable } from '@/components/dashboard/OpenPositionsTable';
import { SystemActivityFeed } from '@/components/dashboard/SystemActivityFeed';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import {
  useBrokerConnections,
  useBrokerConnection,
  useReconnectBrokerConnection,
} from '@/hooks/use-queries';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/lib/auth/auth-context';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowRight,
  ExternalLink,
  Layers,
  Lock,
  Radio,
  FileText,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Plus,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeBrokerConnectionId, setActiveBrokerConnectionId } = useUIStore();
  const { data: connections = [], isLoading: connsLoading } = useBrokerConnections();
  const { data: defaultBroker } = useBrokerConnection();
  const reconnectMutation = useReconnectBrokerConnection();

  // Determine active connection
  const activeConn = connections.find((c) => c.id === activeBrokerConnectionId) || connections[0];
  const hasConnectedAccounts = connections.length > 0;
  const isConnected = activeConn?.state === BrokerConnectionState.CONNECTED;
  const activeBrokerName = activeConn?.brokerName ?? defaultBroker?.brokerName ?? 'Kotak Neo';
  const currentState = activeConn?.state ?? defaultBroker?.state ?? BrokerConnectionState.NOT_CONFIGURED;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Trading Terminal"
        subtitle={`Real-time verified multi-broker telemetry, intraday options analytics, and risk governance for ${user?.email || 'Trader'}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/broker"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Building className="w-3.5 h-3.5 text-neutral-500" />
              Manage Brokers
            </Link>
            <Link
              href="/strategies"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5" />
              Strategy Rules
            </Link>
          </div>
        }
      />

      {/* MULTI-BROKER ACCOUNT CONTEXT SWITCHER BAR (Phase 5 Task 1) */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">Active Trading Account:</span>
                {hasConnectedAccounts ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={activeBrokerConnectionId || connections[0]?.id || ''}
                      onChange={(e) => setActiveBrokerConnectionId(e.target.value)}
                      className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      {connections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brokerName} — {c.alias} ({c.accountId})
                        </option>
                      ))}
                    </select>
                    <StatusIndicator status={currentState} size="sm" showLabel />
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 font-medium">No broker connected</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Switching accounts immediately updates margins, open positions, orders, and execution streams without stale data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeConn && !isConnected && (
              <button
                type="button"
                onClick={() => reconnectMutation.mutate(activeConn.id)}
                disabled={reconnectMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
                Reconnect Session
              </button>
            )}
            <Link
              href="/broker"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Account
            </Link>
          </div>
        </div>
      </div>

      {/* PHASE 5 OPERATIONAL SAFETY BANNER */}
      <div className="rounded-2xl border border-blue-200/80 bg-linear-to-r from-blue-50/70 to-indigo-50/40 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900 tracking-tight">
                  Phase 4 & 5: Multi-Broker Engine & Personal Trader Cockpit
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  TENANT ISOLATED
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                All financial figures, positions, and live candlestick charts are partitioned to your verified broker account. Real-money order execution remains locked pending compliance authorization.
              </p>
            </div>
          </div>
          <Link
            href="/live-trading"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 shrink-0 hover:underline"
          >
            Review Safety Lock <Lock className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* GENUINE EMPTY STATE: NO BROKER CONNECTED (Phase 5 Task 7) */}
      {!hasConnectedAccounts && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  No Active Broker Account Connected
                </h4>
                <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                  Connect your Kotak Neo, Dhan, Upstox, FYERS, Zerodha, or Angel One account.
                  In accordance with Rule 12 (Zero Mock Financial Data Policy), the system never displays synthetic balances or simulated candlestick data.
                </p>
              </div>
            </div>
            <Link
              href="/broker"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
            >
              Connect Broker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TOP KPIs GRID (Phase 5 Task 2) */}
      <FinancialKpiGrid />

      {/* MAIN TRADING ROW: CANDLESTICK CHART + AUTOMATION/STRATEGY STACK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candlestick Chart with 9 EMA & 21 EMA (2 Cols on Desktop) */}
        <div className="lg:col-span-2">
          <MarketCandleChart />
        </div>

        {/* SIDE COLUMN: ACTIVE STRATEGY & AUTOMATION MONITOR (1 Col) */}
        <div className="flex flex-col gap-6">
          <ActiveStrategyCard />
          <AutomationMonitorCard />
        </div>
      </div>

      {/* ACTIVE POSITIONS & ORDERS TABLE (Phase 5 Task 4) */}
      <OpenPositionsTable />

      {/* PERFORMANCE CHARTS & SYSTEM ACTIVITY FEED ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceCharts />
        </div>
        <div className="lg:col-span-1">
          <SystemActivityFeed />
        </div>
      </div>

      {/* CANONICAL RECENT TRADES & RECONCILIATION TABLE */}
      <RecentTradesTable />
    </div>
  );
}
