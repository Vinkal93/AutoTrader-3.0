'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useActiveStrategy, useSystemStatus } from '@/hooks/use-queries';
import {
  Sliders,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const ActiveStrategyCard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: strategy, isLoading } = useActiveStrategy();
  const { data: systemStatus } = useSystemStatus();

  const config = strategy?.config;
  const isMarketOpen = systemStatus?.marketStatus === 'OPEN';

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col justify-between', className)}>
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Active Strategy</h3>
                <span className="text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  v{strategy?.version ?? 1}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate max-w-[220px]">
                {strategy?.name ?? 'NIFTY Options Trend Follower'}
              </p>
            </div>
          </div>

          <Link
            href="/strategies"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            Config <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Strategy Parameters Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Underlying & Type</span>
            <span className="font-semibold text-neutral-800">
              {config?.underlying ?? 'NIFTY'} ({config?.instrumentType ?? 'OPTIONS'})
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Scheduled Entry Window</span>
            <span className="font-semibold text-neutral-800 flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {config?.entryTimeIST ?? '12:20'} IST
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Premium Filter Range</span>
            <span className="font-semibold text-neutral-800 tabular-nums">
              ₹{config?.premiumMin ?? '40.00'} – ₹{config?.premiumMax ?? '45.00'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Target / Stop-Loss</span>
            <span className="font-semibold text-neutral-800 tabular-nums">
              +{config?.targetPremiumMove ? `₹${config.targetPremiumMove}` : '₹1.00'} / -{config?.initialStopLoss ? `₹${config.initialStopLoss}` : '₹3.00'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Indicators & Candle</span>
            <span className="font-semibold text-neutral-800">
              EMA 9 / 21 ({config?.candleInterval ?? '5m'})
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 font-medium">Trades / Lot Allocation</span>
            <span className="font-semibold text-neutral-800">
              {config?.maxTradesPerDay ?? 1} trade/day ({config?.lotCount ?? 1} lot)
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Status & Readiness Banner */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Engine Analysis:</span>
          <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
            {isMarketOpen ? 'MONITORING CANDLES' : 'WAITING FOR ANALYSIS'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Next Eligible Entry:</span>
          <span className="text-neutral-700 font-semibold text-[11px] tabular-nums">
            12:20 PM IST (Next Trading Day)
          </span>
        </div>

        {/* Live Safety Gate Notice */}
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800">
          <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Risk limits unconfigured: live automated orders locked.</span>
        </div>
      </div>
    </div>
  );
};
