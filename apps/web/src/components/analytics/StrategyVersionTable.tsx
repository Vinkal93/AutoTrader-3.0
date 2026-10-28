'use client';

import React from 'react';
import type { StrategyVersionPerformance } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { GitBranch, CheckCircle2 } from 'lucide-react';

interface StrategyVersionTableProps {
  versions?: StrategyVersionPerformance[];
  isLoading?: boolean;
}

export const StrategyVersionTable: React.FC<StrategyVersionTableProps> = ({
  versions = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[200px] animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Strategy Version Comparison</h3>
          <p className="text-xs text-neutral-500">Evaluation across strategy configuration versions</p>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="h-28 flex items-center justify-center text-xs text-neutral-400">
          No strategy versions recorded with closed trades.
        </div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Version</th>
                <th className="py-2.5 px-3 font-semibold text-right">Trades</th>
                <th className="py-2.5 px-3 font-semibold text-right">Win Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Gross P&L</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net P&L</th>
                <th className="py-2.5 px-3 font-semibold text-right">Profit Factor</th>
                <th className="py-2.5 px-3 font-semibold text-right">Max DD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {versions.map((v) => {
                const isNetPos = parseFloat(v.netPnl) > 0;
                const isNetNeg = parseFloat(v.netPnl) < 0;

                return (
                  <tr key={v.versionNumber} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      v{v.versionNumber}
                      <span className="text-[10px] text-neutral-400 font-normal ml-1">({v.strategyName})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{v.tradesCount}</td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      {v.tradesCount > 0 ? `${v.winRate.toFixed(1)}%` : '—'}
                      <span className="text-[10px] text-neutral-400 font-normal ml-1">
                        ({v.winningTrades}W/{v.losingTrades}L)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(v.grossPnl)}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                        isNetPos ? 'text-emerald-600' : isNetNeg ? 'text-rose-600' : 'text-neutral-900'
                      }`}
                    >
                      {formatCurrency(v.netPnl)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      {v.profitFactor !== null && v.profitFactor !== undefined
                        ? v.profitFactor >= 999
                          ? '∞'
                          : v.profitFactor.toFixed(2)
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600 tabular-nums font-semibold">
                      {v.maxDrawdown ? formatCurrency(v.maxDrawdown) : '₹0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
