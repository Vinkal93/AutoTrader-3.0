'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useMarketScanner } from '@/hooks/use-queries';
import { type ScannerCandidate } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import {
  Radar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { SelectedOptionContract } from './OptionChainTable';

interface SmartPremiumScannerCardProps {
  onSelectCandidate: (candidate: SelectedOptionContract) => void;
  className?: string;
}

export const SmartPremiumScannerCard: React.FC<SmartPremiumScannerCardProps> = ({
  onSelectCandidate,
  className,
}) => {
  const [premiumMin, setPremiumMin] = useState('40.00');
  const [premiumMax, setPremiumMax] = useState('45.00');
  const [preferredPremium, setPreferredPremium] = useState('42.50');
  const [direction, setDirection] = useState<'AUTO' | 'CE' | 'PE'>('AUTO');
  const [showConfig, setShowConfig] = useState(false);

  const { data: scanResult, isLoading, refetch } = useMarketScanner({
    underlying: 'NIFTY',
    premiumMin,
    premiumMax,
    preferredPremium,
    direction,
  });

  const selected = scanResult?.selectedCandidate;
  const isFound = scanResult?.status === 'FOUND';
  const isNone = scanResult?.status === 'NO_SUITABLE_CONTRACT';
  const isDisconnected = scanResult?.status === 'DISCONNECTED';

  const handleSelect = (candidate: ScannerCandidate) => {
    onSelectCandidate({
      instrumentToken: candidate.instrumentToken,
      tradingSymbol: candidate.tradingSymbol,
      optionType: candidate.optionType,
      strikePrice: candidate.strikePrice,
      expiryDate: candidate.expiryDate,
      ltp: candidate.ltp,
      bidPrice: candidate.bidPrice,
      askPrice: candidate.askPrice,
      bidQuantity: candidate.bidQuantity,
      askQuantity: candidate.askQuantity,
      lotSize: candidate.lotSize,
      tickSize: candidate.tickSize,
    });
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col', className)}>
      {/* Header and Direction Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Smart Premium Scanner</h3>
            <p className="text-[11px] text-neutral-500">
              Evaluates executable Ask price in [₹{premiumMin} - ₹{premiumMax}]
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['AUTO', 'CE', 'PE'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirection(dir)}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-all',
                  direction === dir ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {dir}
              </button>
            ))}
          </div>

          {/* Config toggle */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
            title="Adjust scanner parameters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Scanner Parameters Adjustment */}
      {showConfig && (
        <div className="grid grid-cols-3 gap-2 p-3 my-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block">Min Ask (₹)</label>
            <input
              type="number"
              step="0.5"
              value={premiumMin}
              onChange={(e) => setPremiumMin(e.target.value)}
              className="mt-1 w-full p-1 bg-white border border-neutral-200 rounded text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block">Max Ask (₹)</label>
            <input
              type="number"
              step="0.5"
              value={premiumMax}
              onChange={(e) => setPremiumMax(e.target.value)}
              className="mt-1 w-full p-1 bg-white border border-neutral-200 rounded text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block">Preferred (₹)</label>
            <input
              type="number"
              step="0.5"
              value={preferredPremium}
              onChange={(e) => setPreferredPremium(e.target.value)}
              className="mt-1 w-full p-1 bg-white border border-neutral-200 rounded text-xs tabular-nums"
            />
          </div>
        </div>
      )}

      {/* Main Status & Selected Candidate */}
      <div className="my-3">
        {isLoading ? (
          <div className="p-6 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400 font-sans">
            Scanning real option chain quotes...
          </div>
        ) : isFound && selected ? (
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Optimal Contract Discovered</span>
              </div>
              <span className="text-[10px] tabular-nums px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Score: {selected.rankScore}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100">
              <div>
                <span className="font-bold text-sm text-neutral-900">
                  {selected.tradingSymbol}
                </span>
                <div className="flex items-center gap-2 text-xs tabular-nums mt-0.5 text-neutral-600">
                  <span>Executable Ask: <strong className="text-neutral-900">₹{selected.askPrice.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Spread: ₹{selected.bidAskSpread.toFixed(2)}</span>
                  <span>•</span>
                  <span>Depth: {selected.askQuantity}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(selected)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
              >
                Load Ticket <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-emerald-700 italic font-sans leading-tight">
              {scanResult.selectionReason}
            </p>
          </div>
        ) : isNone ? (
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>NO SUITABLE CONTRACT</span>
            </div>
            <p className="text-neutral-600 leading-relaxed font-sans text-[11px]">
              {scanResult?.selectionReason}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 text-center font-sans">
            Broker disconnected or scanner idle. Connect broker session to evaluate live candidate options.
          </div>
        )}
      </div>

      {/* Candidate Ranking Comparison Table (Task 4.10) */}
      {scanResult && scanResult.candidates.length > 0 && (
        <div className="mt-1">
          <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
            Evaluated Candidates Comparison ({scanResult.eligibleCount} eligible of {scanResult.totalEvaluated})
          </span>
          <div className="overflow-x-auto max-h-36 overflow-y-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 sticky top-0">
                <tr>
                  <th className="py-1.5 px-2">Contract</th>
                  <th className="py-1.5 px-2 text-right">Ask</th>
                  <th className="py-1.5 px-2 text-right">Spread</th>
                  <th className="py-1.5 px-2 text-right">Depth</th>
                  <th className="py-1.5 px-2">Eligibility & Reasons</th>
                  <th className="py-1.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {scanResult.candidates.map((cand) => (
                  <tr
                    key={cand.instrumentToken}
                    className={cn(
                      'hover:bg-neutral-50 transition-colors',
                      cand.isEligible ? 'bg-white' : 'opacity-60 bg-neutral-50/50'
                    )}
                  >
                    <td className="py-1.5 px-2 font-bold">{cand.tradingSymbol}</td>
                    <td className="py-1.5 px-2 text-right">₹{cand.askPrice.toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right">₹{cand.bidAskSpread.toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right">{cand.askQuantity}</td>
                    <td className="py-1.5 px-2 font-sans text-[10px] text-neutral-500 truncate max-w-xs">
                      {cand.isEligible ? (
                        <span className="text-emerald-700 font-semibold">Eligible (Score: {cand.rankScore})</span>
                      ) : (
                        <span className="text-rose-600">{cand.rejectionReasons[0]}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      {cand.isEligible && (
                        <button
                          type="button"
                          onClick={() => handleSelect(cand)}
                          className="text-[10px] font-sans font-bold text-blue-600 hover:text-blue-800"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
