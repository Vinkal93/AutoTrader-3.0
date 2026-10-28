'use client';

import React from 'react';
import type { TradeDrilldown } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { X, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface TradeDrilldownModalProps {
  trade: TradeDrilldown | null;
  onClose: () => void;
}

export const TradeDrilldownModal: React.FC<TradeDrilldownModalProps> = ({ trade, onClose }) => {
  if (!trade) return null;

  const netNum = parseFloat(trade.netPnl);
  const isPos = netNum > 0;
  const isNeg = netNum < 0;

  const formatSecs = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                trade.optionType === 'CE'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : trade.optionType === 'PE'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              {trade.optionType ?? 'NIFTY'}
            </span>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
                {trade.tradingSymbol}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">ID: {trade.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Realized Outcome Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between tabular-nums ${
              isPos
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isNeg
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <div>
              <span className="text-[10px] font-semibold uppercase opacity-70 block font-sans">Net Realized Outcome</span>
              <span className="text-2xl font-bold tracking-tight">{formatCurrency(trade.netPnl)}</span>
            </div>
            <div className="text-right text-xs">
              <span className="block opacity-75">Gross: {formatCurrency(trade.grossPnl)}</span>
              <span className="block opacity-75">Fees: -{formatCurrency(trade.charges)}</span>
            </div>
          </div>

          {/* Pricing & Execution Details */}
          <div className="grid grid-cols-2 gap-3 text-xs tabular-nums">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block font-sans">Entry Leg</span>
              <p className="font-bold text-neutral-900 text-sm mt-0.5">
                {formatCurrency(trade.entryFilledPrice || trade.entryPrice)}
              </p>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">
                Req: {formatCurrency(trade.entryPrice)} (Slip: {trade.entrySlippagePoints ?? 0} pts)
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block font-sans">Exit Leg</span>
              <p className="font-bold text-neutral-900 text-sm mt-0.5">
                {formatCurrency(trade.exitFilledPrice || trade.exitPrice)}
              </p>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">
                Req: {formatCurrency(trade.exitPrice)} (Slip: {trade.exitSlippagePoints ?? 0} pts)
              </span>
            </div>
          </div>

          {/* Timing & Holding Metadata */}
          <div className="space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/70 text-xs">
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-500">Position Size:</span>
              <span className="font-semibold text-neutral-900 tabular-nums">{trade.quantity} Qty (1 Lot)</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-500">Execution Mode:</span>
              <span className="font-semibold text-neutral-900">{trade.tradingMode}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-500">Holding Duration:</span>
              <span className="font-semibold text-neutral-900 tabular-nums">{formatSecs(trade.holdingTimeSeconds)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-400">Entry Timestamp:</span>
              <span className="text-neutral-700">{trade.startedAt}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-400">Exit Timestamp:</span>
              <span className="text-neutral-700">{trade.closedAt ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="text-neutral-400">Exit Trigger:</span>
              <span className="font-bold text-neutral-900">{trade.exitReason ?? 'NORMAL_EXIT'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
