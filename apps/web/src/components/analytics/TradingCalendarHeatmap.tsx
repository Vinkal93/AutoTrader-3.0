'use client';

import React from 'react';
import type { HeatmapDayEntry } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface TradingCalendarHeatmapProps {
  entries?: HeatmapDayEntry[];
  isLoading?: boolean;
}

export const TradingCalendarHeatmap: React.FC<TradingCalendarHeatmapProps> = ({
  entries = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[240px] flex items-center justify-center">
        <span className="text-xs text-neutral-400">Loading trading calendar heatmap...</span>
      </div>
    );
  }

  const profitDays = entries.filter((e) => e.status === 'PROFIT').length;
  const lossDays = entries.filter((e) => e.status === 'LOSS').length;
  const breakevenDays = entries.filter((e) => e.status === 'BREAKEVEN').length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Trading Calendar Heatmap</h3>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              Daily Realizations
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Day-by-day distribution of profitable and unprofitable trading sessions
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-neutral-700 font-semibold">{profitDays} Green Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className="text-neutral-700 font-semibold">{lossDays} Red Days</span>
          </div>
          {breakevenDays > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300 inline-block" />
              <span className="text-neutral-500">{breakevenDays} Breakeven</span>
            </div>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="h-36 flex flex-col items-center justify-center text-center">
          <Calendar className="w-7 h-7 text-neutral-300 mb-1.5" />
          <p className="text-xs text-neutral-400">No trading calendar entries recorded for this timeframe.</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {entries.map((day, idx) => {
              const isProfit = day.status === 'PROFIT';
              const isLoss = day.status === 'LOSS';
              const isBreakeven = day.status === 'BREAKEVEN';

              let tileBg = 'bg-neutral-50 border-neutral-200 text-neutral-500';
              if (isProfit) tileBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
              if (isLoss) tileBg = 'bg-rose-50 border-rose-200 text-rose-800';
              if (isBreakeven) tileBg = 'bg-amber-50 border-amber-200 text-amber-800';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all hover:shadow-xs group relative flex flex-col justify-between ${tileBg}`}
                >
                  <div className="flex items-center justify-between text-[11px] tabular-nums font-bold">
                    <span>{day.date.slice(5)}</span>
                    <span className="text-[10px] opacity-70">{day.tradesCount}t</span>
                  </div>

                  <div className="mt-2 text-right">
                    <p className="tabular-nums text-sm font-bold">
                      {formatCurrency(day.netPnl)}
                    </p>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-neutral-900 text-white rounded-lg p-2.5 text-[11px] tabular-nums shadow-lg whitespace-nowrap min-w-[140px]">
                      <p className="font-bold border-b border-neutral-700 pb-1 mb-1">{day.date}</p>
                      <div className="flex justify-between gap-4 text-neutral-300">
                        <span>Trades:</span>
                        <span className="font-bold text-white">{day.tradesCount} ({day.winningTrades}W / {day.losingTrades}L)</span>
                      </div>
                      <div className="flex justify-between gap-4 text-neutral-300">
                        <span>Gross P&L:</span>
                        <span className="font-bold text-white">{formatCurrency(day.grossPnl)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-neutral-300">
                        <span>Net Realized:</span>
                        <span className={`font-bold ${isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-neutral-200'}`}>
                          {formatCurrency(day.netPnl)}
                        </span>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-neutral-900 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
