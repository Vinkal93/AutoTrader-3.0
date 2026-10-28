'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useSystemStatus, useBrokerConnection } from '@/hooks/use-queries';
import { EngineState, TradingMode, BrokerConnectionState } from '@autotrader/api-contracts';
import {
  Lock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LiveTradingPage() {
  const { data: systemStatus } = useSystemStatus();
  const { data: broker } = useBrokerConnection();

  const isBrokerConnected = broker?.state === BrokerConnectionState.CONNECTED;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Trading Execution Gate"
        subtitle="Operational controls and Phase 2 safety lock status"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Live Trading' },
        ]}
      />

      {/* Safety Gate Alert Banner */}
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-red-900 tracking-tight">
                Live Order Routing Locked (Phase 1 & Phase 2 Safety Invariant)
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-200 text-red-900 uppercase">
                HARD LOCKED
              </span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed max-w-3xl">
              Under Prime Directive 1.8 and Phase 2 Operational Directives, automated broker order submission (<code>place_order</code>, <code>modify_order</code>, <code>cancel_order</code>) is strictly prevented by both backend API validation gates and Trading Worker safety assertions.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Pre-flight Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-sm text-neutral-900">Pre-requisites for Phase 3 Live Activation</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-medium">1. Read-Only Telemetry Foundation (Phase 1)</strong>
                <span className="text-neutral-500 text-[11px]">Completed & verified with 0 errors.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-medium">2. Full Dashboard & Chart Real-Data Integration (Phase 2)</strong>
                <span className="text-neutral-500 text-[11px]">Active in current release.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-medium">3. Explicit Strategy Risk Limits Configuration</strong>
                <span className="text-neutral-500 text-[11px]">
                  Daily max loss, per-trade risk allowance, and liquidity minimums must be configured.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <Lock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-medium">4. Autonomous Order FSM & Execution Worker (Phase 3)</strong>
                <span className="text-neutral-500 text-[11px]">
                  Requires human operator authorization before activating live money.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current State Diagnostic Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Cpu className="w-5 h-5 text-neutral-700" />
              <h4 className="font-bold text-sm text-neutral-900">Current System Telemetry</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-sans block mb-1">Trading Mode</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {systemStatus?.tradingMode ?? 'OFF'}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-sans block mb-1">Engine State</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {systemStatus?.engineState ?? 'STOPPED'}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-sans block mb-1">Broker Connection</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {broker?.state ?? 'NOT_CONFIGURED'}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-sans block mb-1">Market Status</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {systemStatus?.marketStatus ?? 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <Link
              href="/strategies"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Configure Risk Limits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
