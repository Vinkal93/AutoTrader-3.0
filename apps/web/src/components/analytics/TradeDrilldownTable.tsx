'use client';

import React, { useState } from 'react';
import type { TradeDrilldown } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { TradeDrilldownModal } from './TradeDrilldownModal';
import { Search, Eye, Filter, ListFilter } from 'lucide-react';

interface TradeDrilldownTableProps {
  drilldowns?: TradeDrilldown[];
  isLoading?: boolean;
}

export const TradeDrilldownTable: React.FC<TradeDrilldownTableProps> = ({
  drilldowns = [],
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [optionFilter, setOptionFilter] = useState<'ALL' | 'CE' | 'PE'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [selectedTrade, setSelectedTrade] = useState<TradeDrilldown | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[300px] animate-pulse" />
    );
  }

  const filtered = drilldowns.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const matchSym = t.tradingSymbol.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchSym && !matchId) return false;
    }
    if (optionFilter !== 'ALL' && t.optionType !== optionFilter) return false;
    if (outcomeFilter === 'WIN' && parseFloat(t.netPnl) <= 0) return false;
    if (outcomeFilter === 'LOSS' && parseFloat(t.netPnl) >= 0) return false;
    return true;
  });

  const formatSecs = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Trade-Level Execution Drilldown</h3>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                {filtered.length} of {drilldowns.length} trades
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Itemized inspection of individual entry/exit fills, slippage, and net P&L
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symbol or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500 w-44"
              />
            </div>

            {/* CE/PE Filter */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
              {(['ALL', 'CE', 'PE'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOptionFilter(opt)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    optionFilter === opt
                      ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Outcome Filter */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
              {(['ALL', 'WIN', 'LOSS'] as const).map((outc) => (
                <button
                  key={outc}
                  type="button"
                  onClick={() => setOutcomeFilter(outc)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    outcomeFilter === outc
                      ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {outc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-neutral-400">
            No trades match the selected search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3 font-semibold">Contract</th>
                  <th className="py-2.5 px-3 font-semibold">Legs (Buy / Sell)</th>
                  <th className="py-2.5 px-3 font-semibold">Holding</th>
                  <th className="py-2.5 px-3 font-semibold">Gross</th>
                  <th className="py-2.5 px-3 font-semibold">Charges</th>
                  <th className="py-2.5 px-3 font-semibold">Net Realized</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filtered.map((t) => {
                  const isNetPos = parseFloat(t.netPnl) > 0;
                  const isNetNeg = parseFloat(t.netPnl) < 0;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="hover:bg-neutral-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.optionType === 'CE'
                                ? 'bg-blue-100 text-blue-700'
                                : t.optionType === 'PE'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {t.optionType ?? 'NIFTY'}
                          </span>
                          <span className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                            {t.tradingSymbol}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {t.quantity} qty • {t.tradingMode}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-700 font-bold">
                            ₹{t.entryFilledPrice || t.entryPrice}
                          </span>
                          <span className="text-neutral-400">→</span>
                          <span className="text-neutral-700 font-bold">
                            ₹{t.exitFilledPrice || t.exitPrice}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          Slip: {t.entrySlippagePoints ?? 0}pt / {t.exitSlippagePoints ?? 0}pt
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-neutral-700">
                          {formatSecs(t.holdingTimeSeconds)}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {t.closedAt ? t.closedAt.slice(11, 19) : 'Open'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-neutral-600 font-medium">
                        {formatCurrency(t.grossPnl)}
                      </td>

                      <td className="py-3 px-3 text-neutral-400 font-medium">
                        -{formatCurrency(t.charges)}
                      </td>

                      <td
                        className={`py-3 px-3 font-bold ${
                          isNetPos
                            ? 'text-emerald-600'
                            : isNetNeg
                            ? 'text-rose-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {formatCurrency(t.netPnl)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrade(t);
                          }}
                          className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TradeDrilldownModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </>
  );
};
