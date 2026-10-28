'use client';

import React from 'react';
import type { ComprehensiveAnalytics } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  Layers,
  Clock,
  Zap,
  Activity,
  AlertTriangle,
  Receipt,
  FileCheck2,
} from 'lucide-react';

interface AnalyticsMetricsGridProps {
  data?: ComprehensiveAnalytics;
  isLoading?: boolean;
}

export const AnalyticsMetricsGrid: React.FC<AnalyticsMetricsGridProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-28 bg-neutral-100 rounded-2xl border border-neutral-200/80" />
        ))}
      </div>
    );
  }

  const netPnlNum = parseFloat(data?.netPnl ?? '0');
  const isNetPositive = netPnlNum > 0;
  const isNetNegative = netPnlNum < 0;

  const winRate = data?.winRate ?? 0;
  const closedCount = data?.closedTrades ?? 0;
  const profitFactor = data?.profitFactor;
  const maxDd = data?.maxDrawdown ? formatCurrency(data.maxDrawdown) : '₹0.00';
  const maxDdParm = data?.maxDrawdownPercent ? ` (${data.maxDrawdownPercent})` : '';

  const formatSecs = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Realized P&L */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Net Realized P&L</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isNetPositive
                ? 'bg-emerald-50 text-emerald-600'
                : isNetNegative
                ? 'bg-rose-50 text-rose-600'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {isNetPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : isNetNegative ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Scale className="w-4 h-4" />
            )}
          </div>
        </div>
        <p
          className={`tabular-nums text-2xl font-bold mt-1 tracking-tight ${
            isNetPositive
              ? 'text-emerald-600'
              : isNetNegative
              ? 'text-rose-600'
              : 'text-neutral-900'
          }`}
        >
          {formatCurrency(data?.netPnl ?? '0.00')}
        </p>
        <div className="text-[11px] text-neutral-500 tabular-nums mt-2 flex items-center justify-between">
          <span>Gross: {formatCurrency(data?.grossPnl ?? '0.00')}</span>
          <span>Fees: -{formatCurrency(data?.totalCharges ?? '0.00')}</span>
        </div>
      </div>

      {/* 2. Win Rate */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Win Rate (Closed)</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {closedCount > 0 ? `${winRate.toFixed(1)}%` : '—'}
        </p>
        <div className="text-[11px] text-neutral-500 tabular-nums mt-2 flex items-center gap-1.5 font-medium">
          <span className="text-emerald-600 font-bold">{data?.winningTrades ?? 0}W</span>
          <span>•</span>
          <span className="text-rose-600 font-bold">{data?.losingTrades ?? 0}L</span>
          <span>•</span>
          <span className="text-neutral-500">{data?.breakevenTrades ?? 0}BE</span>
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Profit Factor</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {profitFactor !== null && profitFactor !== undefined
            ? profitFactor >= 999
              ? '∞ (No Losses)'
              : profitFactor.toFixed(2)
            : '—'}
        </p>
        <span className="text-[11px] text-neutral-400 mt-2 block">
          Gross Wins vs Gross Losses ratio
        </span>
      </div>

      {/* 4. Peak Drawdown */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Maximum Drawdown</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {maxDd}
          <span className="text-xs text-neutral-500 font-normal">{maxDdParm}</span>
        </p>
        <span className="text-[11px] text-neutral-400 tabular-nums mt-2 block">
          Peak Equity: {formatCurrency(data?.peakEquity ?? '0.00')}
        </span>
      </div>

      {/* 5. Average Win vs Loss */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Avg Win vs Avg Loss</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="tabular-nums text-lg font-bold text-emerald-600">
            {data?.averageWin ? formatCurrency(data.averageWin) : '—'}
          </span>
          <span className="text-xs text-neutral-400">/</span>
          <span className="tabular-nums text-lg font-bold text-rose-600">
            {data?.averageLoss ? `-${formatCurrency(data.averageLoss)}` : '—'}
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 tabular-nums mt-2 block">
          Payoff Ratio: {data?.payoffRatio ? `${data.payoffRatio.toFixed(2)}x` : '—'}
        </span>
      </div>

      {/* 6. Expectancy per Trade */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Trade Expectancy</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`tabular-nums text-2xl font-bold mt-1 ${
            parseFloat(data?.expectancy ?? '0') > 0
              ? 'text-emerald-600'
              : parseFloat(data?.expectancy ?? '0') < 0
              ? 'text-rose-600'
              : 'text-neutral-900'
          }`}
        >
          {data?.expectancy ? formatCurrency(data.expectancy) : '₹0.00'}
        </p>
        <span className="text-[11px] text-neutral-400 tabular-nums mt-2 block">
          Expected value / trade (Ratio: {data?.expectancyRatio ? `${data.expectancyRatio.toFixed(2)}` : '—'})
        </span>
      </div>

      {/* 7. Average Holding Time */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Avg Holding Time</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {formatSecs(data?.holdingTime?.averageHoldingTimeSeconds)}
        </p>
        <div className="text-[11px] text-neutral-500 tabular-nums mt-2 flex items-center justify-between font-medium">
          <span>Wins: {formatSecs(data?.holdingTime?.averageWinningHoldingTimeSeconds)}</span>
          <span>Losses: {formatSecs(data?.holdingTime?.averageLosingHoldingTimeSeconds)}</span>
        </div>
      </div>

      {/* 8. CE vs PE Split */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">CE vs PE Net P&L</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <div>
            <span className="text-[10px] font-semibold text-blue-600 uppercase block">CE Net</span>
            <span className="tabular-nums text-sm font-bold text-neutral-900">
              {formatCurrency(data?.cePerformance?.netPnl ?? '0.00')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-purple-600 uppercase block">PE Net</span>
            <span className="tabular-nums text-sm font-bold text-neutral-900">
              {formatCurrency(data?.pePerformance?.netPnl ?? '0.00')}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 tabular-nums mt-2 flex items-center justify-between font-medium">
          <span>CE: {data?.cePerformance?.tradesCount ?? 0} trades</span>
          <span>PE: {data?.pePerformance?.tradesCount ?? 0} trades</span>
        </div>
      </div>

      {/* 9. Largest Win vs Loss */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Largest Win / Loss</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="tabular-nums text-base font-bold text-emerald-600">
            {data?.largestWin ? formatCurrency(data.largestWin) : '—'}
          </span>
          <span className="text-xs text-neutral-400">/</span>
          <span className="tabular-nums text-base font-bold text-rose-600">
            {data?.largestLoss ? `-${formatCurrency(data.largestLoss)}` : '—'}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 mt-2 block">
          Best trade vs worst single drawdown
        </span>
      </div>

      {/* 10. Execution Quality & Slippage */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Execution Slippage</span>
          <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-xl font-bold text-neutral-900 mt-1">
          {data?.slippage?.available
            ? `${data.slippage.averageEntrySlippagePoints ?? 0} pts`
            : '0.00 pts (Exact)'}
        </p>
        <span className="text-[11px] text-neutral-400 tabular-nums mt-2 block">
          Total Cost Impact: {formatCurrency(data?.slippage?.totalSlippageCost ?? '0.00')}
        </span>
      </div>

      {/* 11. Statutory Deductions Quality */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Statutory Deductions</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {formatCurrency(data?.totalCharges ?? '0.00')}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              data?.chargesStatus === 'ACTUAL'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : data?.chargesStatus === 'ESTIMATED'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            {data?.chargesStatus ?? 'UNAVAILABLE'}
          </span>
          <span className="text-[10px] text-neutral-400">broker audited</span>
        </div>
      </div>

      {/* 12. Total Closed Cycles */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Total Closed Cycles</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <p className="tabular-nums text-2xl font-bold text-neutral-900 mt-1">
          {closedCount}
        </p>
        <span className="text-[11px] text-neutral-400 tabular-nums mt-2 block">
          Total Initiated: {data?.totalTrades ?? 0} trade cycles
        </span>
      </div>
    </div>
  );
};
