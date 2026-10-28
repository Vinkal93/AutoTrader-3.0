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
import { SystemActivityFeed } from '@/components/dashboard/SystemActivityFeed';
import { useBrokerConnection, useReconnectBroker } from '@/hooks/use-queries';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { data: broker } = useBrokerConnection();
  const reconnectMutation = useReconnectBroker();

  const isBrokerConfigured = broker?.state !== BrokerConnectionState.NOT_CONFIGURED;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Trading Terminal"
        subtitle="Real-time verified Kotak Neo market telemetry, intraday options analytics, and risk governance"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reconnectMutation.mutate()}
              disabled={reconnectMutation.isPending || !isBrokerConfigured}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconnectMutation.isPending ? 'animate-spin text-blue-600' : ''}`} />
              {reconnectMutation.isPending ? 'Reconnecting...' : 'Sync Broker'}
            </button>
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

      {/* PHASE 2 OPERATIONAL STATUS BANNER */}
      <div className="rounded-2xl border border-blue-200/80 bg-linear-to-r from-blue-50/70 to-indigo-50/40 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900 tracking-tight">
                  Phase 2: Complete Dashboard & Live Broker Telemetry
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  READ-ONLY MONITORING
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Every KPI, chart, and execution fill is sourced from real broker APIs or validated database records. Real-money order submission remains locked until Phase 3.
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

      {/* UNCONFIGURED BROKER ONBOARDING CARD (When credentials absent) */}
      {!isBrokerConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Broker Connection Not Configured
                </h4>
                <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                  Your Kotak Neo API Consumer Key and credentials are not configured in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>.
                  In accordance with the Zero-Mock Financial Policy, the system will not display synthetic balances or simulated candlestick data.
                </p>
              </div>
            </div>
            <Link
              href="/broker"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
            >
              Configure Credentials <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TASK 4: 6-PANEL FINANCIAL KPI CARDS GRID */}
      <FinancialKpiGrid />

      {/* MAIN TRADING ROW: CANDLESTICK CHART + AUTOMATION/STRATEGY STACK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TASK 5: Interactive Candlestick Chart (2 Cols on Desktop) */}
        <div className="lg:col-span-2">
          <MarketCandleChart />
        </div>

        {/* SIDE COLUMN: ACTIVE STRATEGY & AUTOMATION MONITOR (1 Col) */}
        <div className="flex flex-col gap-6">
          <ActiveStrategyCard />
          <AutomationMonitorCard />
        </div>
      </div>

      {/* PERFORMANCE CHARTS & SYSTEM ACTIVITY FEED ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TASK 9: Performance Analytics (Daily P&L & Equity Curve) */}
        <div className="lg:col-span-2">
          <PerformanceCharts />
        </div>

        {/* TASK 11: Real-time System Audit Stream */}
        <div className="lg:col-span-1">
          <SystemActivityFeed />
        </div>
      </div>

      {/* TASK 10: CANONICAL RECENT TRADES & RECONCILIATION TABLE */}
      <RecentTradesTable />
    </div>
  );
}
