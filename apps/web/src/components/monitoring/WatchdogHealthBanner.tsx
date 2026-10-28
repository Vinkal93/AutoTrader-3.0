'use client';

import React from 'react';
import type { WatchdogHealthStatus } from '@autotrader/api-contracts';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, RefreshCw, BookOpen } from 'lucide-react';

interface WatchdogHealthBannerProps {
  status?: WatchdogHealthStatus;
  isLoading?: boolean;
  onOpenRunbook: () => void;
  onRunReconciliation: () => void;
  onEscalateRiskLock: () => void;
  isReconciling?: boolean;
}

export const WatchdogHealthBanner: React.FC<WatchdogHealthBannerProps> = ({
  status,
  isLoading,
  onOpenRunbook,
  onRunReconciliation,
  onEscalateRiskLock,
  isReconciling,
}) => {
  if (isLoading) {
    return <div className="h-20 bg-neutral-100 rounded-2xl animate-pulse border border-neutral-200" />;
  }

  const isSafe = status?.safeStateVerified ?? false;
  const blockReason = status?.blockNewEntriesReason;
  const activeIncidents = status?.activeIncidentsCount ?? 0;
  const unprotectedCount = status?.openUnprotectedPositionsCount ?? 0;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
        isSafe
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Status Indicator */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSafe ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white animate-pulse'
            }`}
          >
            {isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base tracking-tight">
                {isSafe ? 'System Watchdog: Safe State Verified' : 'Watchdog Alert: Safe State Unverified'}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                  isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isSafe ? 'Execution Unlocked' : 'NEW ENTRIES BLOCKED'}
              </span>
            </div>

            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {isSafe
                ? 'All subsystems healthy. Heartbeat active (<15s), broker session valid, market quotes streaming, zero unprotected positions.'
                : `Automatic entry block active: ${blockReason || 'Subsystem anomaly detected'}. Duplication guards engaged.`}
            </p>

            {!isSafe && (
              <div className="flex items-center gap-3 mt-2 text-xs font-mono font-semibold">
                {activeIncidents > 0 && (
                  <span className="text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {activeIncidents} Active Incidents
                  </span>
                )}
                {unprotectedCount > 0 && (
                  <span className="text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {unprotectedCount} Unprotected Positions
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onOpenRunbook}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Emergency Runbook</span>
          </button>

          <button
            type="button"
            onClick={onRunReconciliation}
            disabled={isReconciling}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>Reconcile State</span>
          </button>

          {!isSafe && (
            <button
              type="button"
              onClick={onEscalateRiskLock}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Escalate Risk-Lock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
