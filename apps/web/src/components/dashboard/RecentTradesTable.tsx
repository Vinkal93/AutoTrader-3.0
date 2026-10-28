'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTradeCycles, useTradeCycleDetail } from '@/hooks/use-queries';
import { type TradeCycleDetail } from '@autotrader/api-contracts';
import { formatCurrency, formatISTDateTime, formatISTTime } from '@/lib/formatters';
import {
  History,
  Search,
  Filter,
  X,
  ChevronRight,
  Receipt,
  FileCheck,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';

export const RecentTradesTable: React.FC<{ className?: string }> = ({ className }) => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CE' | 'PE'>('ALL');
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const { data: cycles, isLoading } = useTradeCycles(page, 15);
  const { data: selectedDetail, isLoading: detailLoading } = useTradeCycleDetail(selectedCycleId);

  const filteredCycles = (cycles ?? []).filter((c) => {
    if (searchTerm && !c.tradingSymbol.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'ALL' && c.optionType !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col', className)}>
      {/* Table Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Recent Trade Cycles</h3>
            <p className="text-xs text-neutral-500">
              Canonical trade records & broker reconciliation
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-48"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['ALL', 'CE', 'PE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2 py-1 rounded-md transition-all',
                  typeFilter === t ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Surface */}
      <div className="relative overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Date / Time</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Buy Avg</th>
              <th className="py-2.5 px-3 text-right">Sell Avg</th>
              <th className="py-2.5 px-3 text-right">Gross P&L</th>
              <th className="py-2.5 px-3 text-right">Charges</th>
              <th className="py-2.5 px-3 text-right">Net P&L</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-neutral-400 font-sans">
                  Loading trade cycles...
                </td>
              </tr>
            ) : filteredCycles.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-neutral-400 font-sans">
                  No trade cycles recorded. Real trades will appear here upon strategy execution.
                </td>
              </tr>
            ) : (
              filteredCycles.map((c) => {
                const gross = parseFloat(c.grossPnl);
                const net = parseFloat(c.netPnl);
                const isPositive = net > 0;
                const isPartial = c.reconciliationStatus === 'PARTIAL';

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCycleId(c.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 text-neutral-600 font-sans whitespace-nowrap">
                      {formatISTDateTime(c.startedAt)}
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-900 font-sans">
                      {c.tradingSymbol} {c.strikePrice}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase',
                          c.optionType === 'CE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}
                      >
                        {c.optionType ?? 'OPT'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-700 font-semibold">
                      {c.buyQuantity}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-700">
                      ₹{c.buyAveragePrice}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-700">
                      ₹{c.sellAveragePrice}
                    </td>
                    <td
                      className={cn(
                        'py-3 px-3 text-right font-bold',
                        gross > 0 ? 'text-emerald-600' : gross < 0 ? 'text-red-600' : 'text-neutral-700'
                      )}
                    >
                      {gross >= 0 ? '+' : ''}₹{c.grossPnl}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-500">
                      -₹{c.charges.totalCharges}
                    </td>
                    <td
                      className={cn(
                        'py-3 px-3 text-right font-bold',
                        net > 0 ? 'text-emerald-600' : net < 0 ? 'text-red-600' : 'text-neutral-700'
                      )}
                    >
                      {net >= 0 ? '+' : ''}₹{c.netPnl}
                    </td>
                    <td className="py-3 px-3 font-sans whitespace-nowrap">
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                          isPartial
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : c.closedAt
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        {isPartial ? 'PARTIAL' : c.closedAt ? 'CLOSED' : 'OPEN'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Trade Detail Drawer Overlay */}
      {selectedCycleId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Trade Cycle Detail</h3>
                  <p className="text-xs text-neutral-400 font-mono">ID: {selectedCycleId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCycleId(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading ? (
                <div className="py-12 text-center text-xs text-neutral-400">Loading cycle details...</div>
              ) : selectedDetail ? (
                <div className="space-y-5 pt-4 text-xs font-sans">
                  {/* PnL Highlights */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <div>
                      <span className="text-[11px] text-neutral-400 font-medium">Gross Realized P&L</span>
                      <p className="font-mono text-base font-bold text-neutral-900">
                        ₹{selectedDetail.grossPnl}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 font-medium">Net Realized P&L</span>
                      <p className={cn('font-mono text-base font-bold', parseFloat(selectedDetail.netPnl) >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                        ₹{selectedDetail.netPnl}
                      </p>
                    </div>
                  </div>

                  {/* Execution Metrics */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider text-[11px]">
                      Execution Specifics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-neutral-600 font-mono text-[11px] bg-white border border-neutral-200 rounded-lg p-3">
                      <div>Symbol: <strong className="text-neutral-900">{selectedDetail.tradingSymbol}</strong></div>
                      <div>Type: <strong className="text-neutral-900">{selectedDetail.optionType}</strong></div>
                      <div>Buy Price: <strong className="text-neutral-900">₹{selectedDetail.buyAveragePrice}</strong></div>
                      <div>Sell Price: <strong className="text-neutral-900">₹{selectedDetail.sellAveragePrice}</strong></div>
                      <div>Quantity: <strong className="text-neutral-900">{selectedDetail.buyQuantity}</strong></div>
                      <div>Duration: <strong className="text-neutral-900">{selectedDetail.durationSeconds ?? 0}s</strong></div>
                    </div>
                  </div>

                  {/* Itemized Charges Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider text-[11px]">
                        Statutory Charges Breakdown
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {selectedDetail.charges.isPosted ? 'Posted in Ledger' : 'Calculated Estimate'}
                      </span>
                    </div>
                    <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>Brokerage:</span>
                        <span>₹{selectedDetail.charges.brokerage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Securities Transaction Tax (STT):</span>
                        <span>₹{selectedDetail.charges.stt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exchange Turnover Charges:</span>
                        <span>₹{selectedDetail.charges.exchangeTxnCharge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18% on Brokerage & Txn):</span>
                        <span>₹{selectedDetail.charges.gst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SEBI Turnover Fees:</span>
                        <span>₹{selectedDetail.charges.sebiCharges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stamp Duty:</span>
                        <span>₹{selectedDetail.charges.stampDuty}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-neutral-200 font-bold text-neutral-900">
                        <span>Total Statutory Charges:</span>
                        <span>₹{selectedDetail.charges.totalCharges}</span>
                      </div>
                    </div>
                  </div>

                  {/* Exit Reason & Reconciliation */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <span className="text-neutral-400 font-medium">Exit Reason:</span>
                    <p className="font-semibold text-neutral-800 mt-0.5">
                      {selectedDetail.exitReason ?? 'Manual / Target'}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setSelectedCycleId(null)}
              className="w-full mt-6 py-2 px-4 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


