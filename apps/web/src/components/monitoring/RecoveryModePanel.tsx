'use client';

import React from 'react';
import type { RecoveryReconciliationResult } from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Lock, Play } from 'lucide-react';

interface RecoveryModePanelProps {
  lastResult?: RecoveryReconciliationResult | null;
  isReconciling?: boolean;
  onRunReconciliation: () => void;
  onResetRecovery: () => void;
  onEscalateRiskLock: () => void;
}

export const RecoveryModePanel: React.FC<RecoveryModePanelProps> = ({
  lastResult,
  isReconciling,
  onRunReconciliation,
  onResetRecovery,
  onEscalateRiskLock,
}) => {
  const isSafe = lastResult?.isSafeToResume ?? true;
  const discrepancies = lastResult?.discrepancies ?? [];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
              Recovery Mode & Reconciliation Center
            </h3>
            <p className="text-xs text-neutral-500">
              Reconciles broker positions and orderbook with local database state before allowing trading to resume
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRunReconciliation}
            disabled={isReconciling}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>{isReconciling ? 'Reconciling...' : 'Run Full Reconciliation'}</span>
          </button>

          <button
            type="button"
            onClick={onEscalateRiskLock}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Engine</span>
          </button>

          <button
            type="button"
            onClick={onResetRecovery}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Verify & Resume Trading</span>
          </button>
        </div>
      </div>

      {/* Discrepancies and State Display */}
      <div className="mt-4">
        {lastResult ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Reconciled Cycles
                </span>
                <span className="font-bold text-base tabular-nums text-neutral-900 mt-1 block">
                  {lastResult.openPositionsReconciled}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Unprotected Positions
                </span>
                <span
                  className={`font-bold text-base tabular-nums mt-1 block ${
                    lastResult.unprotectedPositionsCount === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {lastResult.unprotectedPositionsCount}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Safety Preconditions
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {isSafe ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span className={`font-bold ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isSafe ? 'Safe to Resume' : 'Discrepancies Found'}
                  </span>
                </div>
              </div>
            </div>

            {discrepancies.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block text-rose-950 mb-1">
                  Active Discrepancies ({discrepancies.length}):
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                  {discrepancies.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1 tabular-nums">
              <span>Last Reconciled: {formatISTDateTime(lastResult.reconciledAt)}</span>
              <span className="font-semibold text-neutral-500">Duplicate BUY Guards: ACTIVE</span>
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-xs text-neutral-400">
            Click &quot;Run Full Reconciliation&quot; to cross-reference broker positions and orders with database records.
          </div>
        )}
      </div>
    </div>
  );
};
