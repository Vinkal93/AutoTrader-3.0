'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceMetrics } from '@/hooks/use-queries';
import { formatCurrency } from '@/lib/formatters';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
} from 'lucide-react';

export const PerformanceCharts: React.FC<{ className?: string }> = ({ className }) => {
  const [timeframe, setTimeframe] = useState<'TODAY' | '7D' | '30D' | 'ALL'>('7D');
  const [chartType, setChartType] = useState<'DAILY_PNL' | 'EQUITY_CURVE'>('DAILY_PNL');

  const { data: perf, isLoading } = usePerformanceMetrics(timeframe);

  const dailySeries = perf?.dailyPnlSeries ?? [];
  const equityCurve = perf?.equityCurve ?? [];
  const hasData = (perf?.closedTrades ?? 0) > 0;

  // Max absolute PnL for scaling SVG bar chart
  const maxAbsPnl = Math.max(
    ...dailySeries.map((d: { netPnl: number; grossPnl: number }) => Math.max(Math.abs(d.netPnl), Math.abs(d.grossPnl))),
    100
  );

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col', className)}>
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Performance Analytics</h3>
            <p className="text-xs text-neutral-500">
              Verified P&L realization & equity progression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType('DAILY_PNL')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all',
                chartType === 'DAILY_PNL' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Daily Net P&L
            </button>
            <button
              type="button"
              onClick={() => setChartType('EQUITY_CURVE')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all',
                chartType === 'EQUITY_CURVE' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Equity Curve
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['TODAY', '7D', '30D', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2 py-1 rounded-md transition-all',
                  timeframe === tf ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="relative flex-1 w-full min-h-[220px] mt-4 select-none">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/50 rounded-xl">
            <span className="text-xs text-neutral-400">Loading performance data...</span>
          </div>
        ) : !hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/40 rounded-xl border border-dashed border-neutral-200 p-6 text-center">
            <Activity className="w-8 h-8 text-neutral-300 mb-2" />
            <h4 className="text-sm font-semibold text-neutral-700">No Closed Trades for Selected Period</h4>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Performance metrics and daily equity charts will generate automatically once the trading worker completes filled trade cycles.
            </p>
          </div>
        ) : chartType === 'DAILY_PNL' ? (
          /* Daily P&L Bar Chart SVG */
          <div className="w-full h-full flex flex-col justify-end">
            <div className="flex items-end justify-around h-44 border-b border-neutral-200 px-4">
              {dailySeries.map((entry: { date: string; netPnl: number }) => {
                const isPositive = entry.netPnl >= 0;
                const heightPct = Math.max(8, Math.min(100, (Math.abs(entry.netPnl) / maxAbsPnl) * 100));

                return (
                  <div key={entry.date} className="flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPositive ? '+' : ''}₹{entry.netPnl.toFixed(0)}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        'w-8 sm:w-12 rounded-t-md transition-all group-hover:brightness-95',
                        isPositive ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                    />
                    <span className="text-[10px] font-mono text-neutral-500 mt-1">
                      {entry.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Cumulative Equity Curve Polyline SVG */
          <div className="w-full h-44 flex flex-col justify-end">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points={equityCurve
                  .map((pt: { equity: number }, i: number) => {
                    const x = (i / Math.max(1, equityCurve.length - 1)) * 500;
                    const y = 80 - Math.min(65, Math.max(-65, pt.equity * 0.5));
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-neutral-100 text-xs">
        <div className="flex flex-col">
          <span className="text-neutral-400 font-medium">Win / Loss Ratio</span>
          <span className="font-bold text-neutral-800 font-mono">
            {perf?.winningTrades ?? 0}W / {perf?.losingTrades ?? 0}L ({perf?.breakevenTrades ?? 0}BE)
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 font-medium">Profit Factor</span>
          <span className="font-bold text-neutral-800 font-mono">
            {perf?.profitFactor !== null && perf?.profitFactor !== undefined ? perf.profitFactor.toFixed(2) : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 font-medium">Period Net P&L</span>
          <span className={cn('font-bold font-mono', (parseFloat(perf?.netPnl ?? '0') >= 0 ? 'text-emerald-600' : 'text-red-600'))}>
            {formatCurrency(perf?.netPnl ?? '0.00')}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 font-medium">Max Drawdown</span>
          <span className="font-bold text-neutral-800 font-mono">
            {perf?.maxDrawdown ? formatCurrency(perf.maxDrawdown) : '₹0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};
