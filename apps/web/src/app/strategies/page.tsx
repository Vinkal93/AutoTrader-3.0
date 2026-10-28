'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useActiveStrategy } from '@/hooks/use-queries';
import {
  Layers,
  ShieldAlert,
  Clock,
  Sliders,
  AlertTriangle,
  Lock,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function StrategiesPage() {
  const { data: strategy, isLoading } = useActiveStrategy();

  // Default parameters matching NIFTY options 12:20 PM strategy
  const config = strategy?.config ?? {
    underlying: 'NIFTY 50',
    instrumentType: 'OPTIONS',
    entryTimeIST: '12:20',
    premiumMin: '40.00',
    premiumMax: '45.00',
    targetPremiumMove: '10.00',
    initialStopLoss: '5.00',
    candleInterval: '5m',
    trendIndicators: ['Supertrend (10, 3)', 'EMA 9 / 21 Crossover', 'VWAP'],
    maxTradesPerDay: 1,
    lotCount: 1,
    sidewaysAction: 'SKIP',
    // Unconfigured risk limits
    maxRiskPerTrade: null,
    maxDailyLoss: null,
    minTradingFunds: null,
    maxBidAskSpread: null,
    minLiquidity: null,
    entryPriceTolerance: null,
    maxDataAgeSeconds: null,
    maxOrderWaitSeconds: null,
    timeBasedExitIST: '15:15',
    expirySelectionPolicy: 'CURRENT_WEEK',
    marketHolidayBehavior: 'SKIP',
    automatedRecoveryPolicy: 'PAUSE',
  };

  const missingRiskLimits = [
    { field: 'Max Risk Per Trade', key: 'maxRiskPerTrade', status: 'Unconfigured' },
    { field: 'Max Daily Loss Limit', key: 'maxDailyLoss', status: 'Unconfigured' },
    { field: 'Minimum Trading Funds Reserve', key: 'minTradingFunds', status: 'Unconfigured' },
    { field: 'Max Bid-Ask Spread Tolerance', key: 'maxBidAskSpread', status: 'Unconfigured' },
    { field: 'Minimum Strike Liquidity / OI', key: 'minLiquidity', status: 'Unconfigured' },
    { field: 'Order Execution Price Tolerance', key: 'entryPriceTolerance', status: 'Unconfigured' },
    { field: 'Max Allowable Tick Stale Age', key: 'maxDataAgeSeconds', status: 'Unconfigured' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategy Configuration & Risk Rules"
        subtitle="NIFTY 50 Intraday Momentum & Expiry Options Execution Pipeline"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Strategies' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Live Deployment Locked
            </span>
          </div>
        }
      />

      {/* Strategy Summary Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-neutral-900">
                  {strategy?.name ?? 'NIFTY Intraday 12:20 PM Momentum Strategy'}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v{strategy?.version ?? '1.0'} Default
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                Automated CE/PE option selection at 12:20 PM IST in the ₹40–₹45 premium sweet spot, driven by multi-indicator confluence on the 5-minute candle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator status={strategy?.isActive ? 'ready' : 'paused'} label={strategy?.isActive ? 'READY' : 'STANDBY'} />
          </div>
        </div>

        {/* Execution Rules Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" /> Core Execution Parameters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70">
              <span className="text-xs text-neutral-500 block mb-1">Entry Window</span>
              <span className="text-sm font-bold text-neutral-800 font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                {config.entryTimeIST} IST
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70">
              <span className="text-xs text-neutral-500 block mb-1">Option Premium Range</span>
              <span className="text-sm font-bold text-neutral-800 font-mono">
                ₹{config.premiumMin} – ₹{config.premiumMax}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70">
              <span className="text-xs text-neutral-500 block mb-1">Target / Stop Loss Move</span>
              <span className="text-sm font-bold text-neutral-800 font-mono">
                +{config.targetPremiumMove} pts / -{config.initialStopLoss} pts
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70">
              <span className="text-xs text-neutral-500 block mb-1">Candle Interval & Order Size</span>
              <span className="text-sm font-bold text-neutral-800 font-mono">
                {config.candleInterval} | {config.lotCount} Lot (75 Qty)
              </span>
            </div>
          </div>
        </div>

        {/* Trend Indicators & Logic */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Directional Confluence Matrix
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {config.trendIndicators.map((ind) => (
              <div key={ind} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-neutral-800">{ind}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Limits & Validation Status (TASK 9 / 10 Strict) */}
      <div id="risk-rules" className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Mandatory Risk Limits Validation (Live Trading Gate)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              In accordance with risk-first architecture, Live Trading is permanently locked until every limit below is explicitly configured.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
            <Lock className="w-3.5 h-3.5" /> 7 Rules Unconfigured
          </span>
        </div>

        {/* Missing Risk Fields Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase font-semibold text-neutral-600 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3">Risk Control Parameter</th>
                <th className="px-4 py-3">Configuration Key</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {missingRiskLimits.map((item) => (
                <tr key={item.key} className="hover:bg-rose-50/30">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{item.field}</td>
                  <td className="px-4 py-3 font-mono text-neutral-500">{item.key}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
                      <AlertTriangle className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-600">
                    Mandatory for LIVE
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs leading-relaxed">
          <strong className="text-neutral-800">Risk Safety Enforcement:</strong> The trading worker continuously checks these limits before submitting any basket order. If any parameter remains null or unconfigured, the execution engine raises a <code>RISK_LOCKED</code> state transition and declines order creation.
        </div>
      </div>
    </div>
  );
}
