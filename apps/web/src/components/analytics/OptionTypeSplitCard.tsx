'use client';

import React from 'react';
import type { OptionTypePerformance } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface OptionTypeSplitCardProps {
  ce?: OptionTypePerformance;
  pe?: OptionTypePerformance;
  isLoading?: boolean;
}

export const OptionTypeSplitCard: React.FC<OptionTypeSplitCardProps> = ({
  ce,
  pe,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[240px] animate-pulse" />
    );
  }

  const renderSide = (
    perf: OptionTypePerformance | undefined,
    label: string,
    badgeColor: string,
    isCe: boolean
  ) => {
    const netNum = parseFloat(perf?.netPnl ?? '0');
    const isPos = netNum > 0;
    const isNeg = netNum < 0;

    return (
      <div className="flex-1 bg-neutral-50/70 rounded-xl p-4 border border-neutral-200/70 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeColor}`}>
                {label}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {isCe ? 'Call Options' : 'Put Options'}
              </span>
            </div>
            {isCe ? (
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-purple-600" />
            )}
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase">Net Realized P&L</span>
            <p
              className={`tabular-nums text-2xl font-bold mt-0.5 tracking-tight ${
                isPos ? 'text-emerald-600' : isNeg ? 'text-rose-600' : 'text-neutral-900'
              }`}
            >
              {formatCurrency(perf?.netPnl ?? '0.00')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-200/60 text-xs tabular-nums">
          <div>
            <span className="text-neutral-400 text-[10px] block">Win Rate</span>
            <span className="font-bold text-neutral-900">
              {perf && perf.tradesCount > 0 ? `${perf.winRate.toFixed(1)}%` : '—'}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              {perf?.winningTrades ?? 0}W / {perf?.losingTrades ?? 0}L
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] block">Profit Factor</span>
            <span className="font-bold text-neutral-900">
              {perf?.profitFactor !== null && perf?.profitFactor !== undefined
                ? perf.profitFactor >= 999
                  ? '∞'
                  : perf.profitFactor.toFixed(2)
                : '—'}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Avg: {perf?.averagePnl ? formatCurrency(perf.averagePnl) : '—'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">CE vs PE Performance Split</h3>
          <p className="text-xs text-neutral-500">Comparative outcome between Bullish (CE) and Bearish (PE) candidates</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {renderSide(ce, 'CE', 'bg-blue-100 text-blue-700 border border-blue-200', true)}
        {renderSide(pe, 'PE', 'bg-purple-100 text-purple-700 border border-purple-200', false)}
      </div>
    </div>
  );
};
