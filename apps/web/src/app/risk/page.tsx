'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRiskAllowance, useActiveStrategy } from '@/hooks/use-queries';
import { formatCurrency } from '@/lib/formatters';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, Scale, Activity } from 'lucide-react';

export default function RiskPage() {
  const { data: risk } = useRiskAllowance();
  const { data: strategy } = useActiveStrategy();

  const isRiskLocked = risk?.isRiskLocked ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Governance & Safety Controls"
        subtitle="Mandatory circuit breakers, daily capital protection limits, and trading halts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Risk Management' },
        ]}
      />

      {/* Lockout Status Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-xs flex items-center justify-between ${
          isRiskLocked
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {isRiskLocked ? (
            <Lock className="w-6 h-6 text-red-600" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {isRiskLocked ? 'Risk Lockout Activated' : 'Risk Guard Active & Nominal'}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {isRiskLocked
                ? risk?.lockoutReason ?? 'Daily drawdown threshold reached. Live operations halted.'
                : 'Trading operations within configured daily and per-trade drawdown limits.'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-white border shadow-2xs">
          {isRiskLocked ? 'LOCKED' : 'NOMINAL'}
        </span>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Configured Daily Loss Limit</span>
          <p className="tabular-nums text-xl font-bold text-neutral-900 mt-1">
            {risk?.dailyLossLimit ? formatCurrency(risk.dailyLossLimit) : 'Unconfigured'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Maximum acceptable daily drawdown
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Realized Loss Today</span>
          <p className="tabular-nums text-xl font-bold text-neutral-900 mt-1">
            {formatCurrency(risk?.realizedLossToday ?? '0.00')}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Cumulative net losses today
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Remaining Daily Loss Cushion</span>
          <p className="tabular-nums text-xl font-bold text-neutral-900 mt-1">
            {risk?.remainingDailyAllowance ? formatCurrency(risk.remainingDailyAllowance) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Tolerance before circuit halt
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">Max Permitted Risk Per Trade</span>
          <p className="tabular-nums text-xl font-bold text-neutral-900 mt-1">
            {risk?.maxRiskPerTrade ? formatCurrency(risk.maxRiskPerTrade) : 'Unconfigured'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Stop-loss risk exposure per order
          </span>
        </div>
      </div>
    </div>
  );
}
