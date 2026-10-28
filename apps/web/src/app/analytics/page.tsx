'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { usePerformanceMetrics } from '@/hooks/use-queries';
import { formatCurrency } from '@/lib/formatters';
import { BarChart3, TrendingUp, Award, Scale, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: perf } = usePerformanceMetrics('ALL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics & Equity Progression"
        subtitle="Mathematical evaluation of trade outcomes, win rates, and drawdown metrics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Performance & Analytics' },
        ]}
      />

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">All-Time Net Realized P&L</span>
          <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
            {formatCurrency(perf?.netPnl ?? '0.00')}
          </p>
          <span className="text-[10px] text-neutral-400 font-mono mt-2 block">
            Gross P&L: {formatCurrency(perf?.grossPnl ?? '0.00')}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Win Rate (Closed Cycles)</span>
          <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
            {perf?.winRate ? `${perf.winRate.toFixed(1)}%` : '—'}
          </p>
          <span className="text-[10px] text-neutral-400 font-mono mt-2 block">
            {perf?.winningTrades ?? 0} Wins / {perf?.losingTrades ?? 0} Losses
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Total Statutory Deductions</span>
          <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
            {formatCurrency(perf?.totalCharges ?? '0.00')}
          </p>
          <span className="text-[10px] text-neutral-400 font-mono mt-2 block">
            Fee Quality: {perf?.chargesStatus ?? 'UNAVAILABLE'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Peak Drawdown</span>
          <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
            {perf?.maxDrawdown ? formatCurrency(perf.maxDrawdown) : '₹0.00'}
          </p>
          <span className="text-[10px] text-neutral-400 font-mono mt-2 block">
            Profit Factor: {perf?.profitFactor ? perf.profitFactor.toFixed(2) : '—'}
          </span>
        </div>
      </div>

      <PerformanceCharts />
    </div>
  );
}
