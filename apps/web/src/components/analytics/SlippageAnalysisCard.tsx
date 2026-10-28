'use client';

import React from 'react';
import type { SlippageAnalysis } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { Zap, CheckCircle2, AlertCircle, ArrowUpDown } from 'lucide-react';

interface SlippageAnalysisCardProps {
  slippage?: SlippageAnalysis;
  isLoading?: boolean;
}

export const SlippageAnalysisCard: React.FC<SlippageAnalysisCardProps> = ({
  slippage,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[200px] animate-pulse" />
    );
  }

  const isAvailable = slippage?.available ?? false;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
          <ArrowUpDown className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Execution Quality & Slippage</h3>
          <p className="text-xs text-neutral-500">Order limit price vs actual broker execution fills</p>
        </div>
      </div>

      {!isAvailable ? (
        <div className="h-28 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
          <p className="text-xs font-bold text-neutral-700">Zero Execution Slippage</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            All executed LIMIT orders matched requested prices without fill price degradation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 font-mono text-xs">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Entry Slippage</span>
            <p className="font-bold text-base text-neutral-900 mt-1">
              {slippage?.averageEntrySlippagePoints !== null ? `${slippage?.averageEntrySlippagePoints} pts` : '0.00 pts'}
            </p>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Avg BUY fill vs requested</span>
          </div>

          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Exit Slippage</span>
            <p className="font-bold text-base text-neutral-900 mt-1">
              {slippage?.averageExitSlippagePoints !== null ? `${slippage?.averageExitSlippagePoints} pts` : '0.00 pts'}
            </p>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Avg SELL fill vs requested</span>
          </div>

          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Slippage Impact</span>
            <p className="font-bold text-base text-neutral-900 mt-1">
              {formatCurrency(slippage?.totalSlippageCost ?? '0.00')}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
              <span className="text-emerald-600 font-bold">{slippage?.positiveSlippageTrades ?? 0} improved</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">{slippage?.negativeSlippageTrades ?? 0} adverse</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
