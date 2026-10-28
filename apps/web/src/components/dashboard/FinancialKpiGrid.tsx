'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useAccountFunds,
  useDashboardOverview,
  usePerformanceMetrics,
  useRiskAllowance,
  useBrokerConnection,
} from '@/hooks/use-queries';
import { BrokerConnectionState, DataFreshness } from '@autotrader/api-contracts';
import { formatCurrency, formatISTTime } from '@/lib/formatters';
import {
  Wallet,
  TrendingUp,
  Receipt,
  Scale,
  Award,
  ShieldAlert,
  HelpCircle,
  Clock,
  AlertTriangle,
  Lock,
  Info,
} from 'lucide-react';

export const FinancialKpiGrid: React.FC<{ className?: string }> = ({ className }) => {
  const [winRateRange, setWinRateRange] = useState<'TODAY' | '7D' | '30D' | 'ALL'>('TODAY');

  const { data: broker } = useBrokerConnection();
  const { data: funds, isLoading: fundsLoading } = useAccountFunds();
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: perf, isLoading: perfLoading } = usePerformanceMetrics(winRateRange);
  const { data: risk, isLoading: riskLoading } = useRiskAllowance();

  const isBrokerConnected = broker?.state === BrokerConnectionState.CONNECTED;

  // 1. Available Trading Funds
  const availableFunds = funds?.availableMargin ?? null;
  const usedMargin = funds?.usedMargin ?? null;
  const totalCollateral = funds?.totalCollateral ?? null;
  const fundsFreshness = funds?.freshness ?? DataFreshness.UNAVAILABLE;

  // 2. Today's Gross Realized P&L
  const grossPnlToday = overview?.todaySummary?.totalPnl ?? null;
  const grossNum = grossPnlToday ? parseFloat(grossPnlToday) : null;

  // 3. Today's Net Realized P&L & Charges Status
  const netPnlToday = overview?.todaySummary?.netPnl ?? null;
  const netNum = netPnlToday ? parseFloat(netPnlToday) : null;
  const chargesStatus = perf?.chargesStatus ?? 'UNAVAILABLE';

  // 4. Today's Charges & Posted vs Estimated Breakdown
  const totalChargesToday = overview?.todaySummary?.totalCharges ?? null;

  // 5. Win Rate Breakdown
  const closedCount = perf?.closedTrades ?? 0;
  const winsCount = perf?.winningTrades ?? 0;
  const lossesCount = perf?.losingTrades ?? 0;
  const breakevenCount = perf?.breakevenTrades ?? 0;
  const winRateVal = perf?.winRate ?? 0;

  // 6. Trading Risk Allowance
  const dailyLossLimit = risk?.dailyLossLimit ?? null;
  const realizedLossToday = risk?.realizedLossToday ?? '0.00';
  const remainingAllowance = risk?.remainingDailyAllowance ?? null;
  const isRiskLocked = risk?.isRiskLocked ?? false;

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)}>
      {/* CARD 1: Available Trading Funds */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold text-neutral-600 tracking-tight">Available Funds</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1">
            {fundsLoading ? (
              <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded" />
            ) : availableFunds !== null && isBrokerConnected ? (
              <span className="tabular-nums text-xl font-bold text-neutral-900 tracking-tight">
                {formatCurrency(availableFunds)}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="tabular-nums text-xl font-bold">—</span>
                <span className="text-[11px] font-sans">
                  {broker?.state === BrokerConnectionState.NOT_CONFIGURED ? 'Unconfigured' : 'Disconnected'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 tabular-nums flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="font-normal">Used Margin:</span>
            <span className="text-neutral-700 font-semibold">
              {usedMargin !== null && isBrokerConnected ? formatCurrency(usedMargin) : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-normal">Collateral:</span>
            <span className="text-neutral-700 font-semibold">
              {totalCollateral !== null && isBrokerConnected ? formatCurrency(totalCollateral) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: Today's Gross Realized P&L */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold text-neutral-600 tracking-tight">Today&apos;s Gross P&L</span>
            <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-1">
            {overviewLoading ? (
              <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded" />
            ) : grossNum !== null ? (
              <span
                className={cn(
                  'tabular-nums text-xl font-bold tracking-tight',
                  grossNum > 0 ? 'text-emerald-600' : grossNum < 0 ? 'text-red-600' : 'text-neutral-700'
                )}
              >
                {grossNum >= 0 ? '+' : ''}
                {formatCurrency(grossNum)}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-neutral-400">
                <span className="tabular-nums text-xl font-bold">₹0.00</span>
                <span className="text-[11px] text-neutral-400 font-sans">(No fills)</span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Completed Fills:</span>
          <span className="tabular-nums text-neutral-800 font-semibold">
            {overview?.todaySummary?.completedTrades ?? 0}
          </span>
        </div>
      </div>

      {/* CARD 3: Today's Net Realized P&L */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-neutral-600 tracking-tight">Today&apos;s Net P&L</span>
              <span
                className={cn(
                  'text-[9px] px-1 py-0.2 rounded font-semibold uppercase',
                  chargesStatus === 'ACTUAL'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : chargesStatus === 'ESTIMATED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-neutral-100 text-neutral-600'
                )}
              >
                {chargesStatus}
              </span>
            </div>
            <Receipt className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-1">
            {overviewLoading ? (
              <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded" />
            ) : netNum !== null ? (
              <span
                className={cn(
                  'tabular-nums text-xl font-bold tracking-tight',
                  netNum > 0 ? 'text-emerald-600' : netNum < 0 ? 'text-red-600' : 'text-neutral-700'
                )}
              >
                {netNum >= 0 ? '+' : ''}
                {formatCurrency(netNum)}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-neutral-400">
                <span className="tabular-nums text-xl font-bold">₹0.00</span>
                <span className="text-[11px] text-neutral-400 font-sans">(Net zero)</span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Fee Deductions:</span>
          <span className="tabular-nums text-neutral-700 font-semibold">
            {totalChargesToday ? `-₹${totalChargesToday}` : '₹0.00'}
          </span>
        </div>
      </div>

      {/* CARD 4: Today's Charges Breakdown */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold text-neutral-600 tracking-tight">Trading Charges</span>
            <Scale className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="mt-1">
            {overviewLoading ? (
              <div className="h-7 w-20 bg-neutral-100 animate-pulse rounded" />
            ) : (
              <span className="tabular-nums text-xl font-bold text-neutral-900 tracking-tight">
                {totalChargesToday ? formatCurrency(totalChargesToday) : '₹0.00'}
              </span>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[10px] text-neutral-500 flex items-center justify-between">
          <span>Brokerage / STT / GST</span>
          <span className="text-neutral-400 font-sans text-[10px]">
            {chargesStatus === 'ACTUAL' ? 'Posted in Ledger' : 'Statutory Estimate'}
          </span>
        </div>
      </div>

      {/* CARD 5: Win Rate with Exact Denominator */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold text-neutral-600 tracking-tight">Win Rate</span>
            {/* Date range switcher */}
            <div className="flex items-center gap-0.5 bg-neutral-100 rounded-md p-0.5 text-[9px] font-semibold">
              {(['TODAY', '7D', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setWinRateRange(r)}
                  className={cn(
                    'px-1.5 py-0.5 rounded transition-all',
                    winRateRange === r ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-neutral-500'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            {perfLoading ? (
              <div className="h-7 w-16 bg-neutral-100 animate-pulse rounded" />
            ) : closedCount > 0 ? (
              <>
                <span className="tabular-nums text-xl font-bold text-neutral-900 tracking-tight">
                  {winRateVal.toFixed(1)}%
                </span>
                <span className="text-[11px] text-neutral-400 tabular-nums font-medium">
                  ({winsCount}W / {lossesCount}L)
                </span>
              </>
            ) : (
              <div className="flex items-baseline gap-1 text-neutral-400">
                <span className="tabular-nums text-xl font-bold">—</span>
                <span className="text-[11px] font-sans">(0 closed cycles)</span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Total Closed:</span>
          <span className="tabular-nums text-neutral-800 font-semibold">{closedCount}</span>
        </div>
      </div>

      {/* CARD 6: Trading Risk & Loss Limit Allowance */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold text-neutral-600 tracking-tight">Daily Risk Guard</span>
            {isRiskLocked ? (
              <Lock className="w-4 h-4 text-red-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-1">
            {riskLoading ? (
              <div className="h-7 w-20 bg-neutral-100 animate-pulse rounded" />
            ) : isRiskLocked ? (
              <span className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                RISK LOCKED
              </span>
            ) : dailyLossLimit ? (
              <span className="tabular-nums text-xl font-bold text-neutral-900 tracking-tight">
                {remainingAllowance ? formatCurrency(remainingAllowance) : '—'}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-neutral-500">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Unconfigured
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Max Daily Limit:</span>
          <span className="tabular-nums text-neutral-800 font-semibold">
            {dailyLossLimit ? formatCurrency(dailyLossLimit) : 'Unset'}
          </span>
        </div>
      </div>
    </div>
  );
};
