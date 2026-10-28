'use client';

import React from 'react';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const PublicPreview: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <Activity className="w-3.5 h-3.5" />
            Software Cockpit Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Institutional-Grade Trading Workspace
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            A high-density, low-latency interface engineered for split-second situational awareness and automated risk governance.
          </p>
        </div>

        {/* Realistic Terminal Mockup Card */}
        <div className="relative rounded-3xl border border-neutral-200 bg-neutral-900 shadow-xl overflow-hidden text-neutral-100 font-sans">
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-950/80 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="ml-3 font-semibold text-neutral-300 hidden sm:inline">
                NIFTY Auto Trader 3.0 — Production Terminal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Broker: READY
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-[11px] font-semibold">
                <Lock className="w-3 h-3" />
                Safety Lock: ACTIVE
              </div>
            </div>
          </div>

          {/* Mock Terminal Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
            {/* Top KPI Telemetry Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  NIFTY 50 Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">24,525.80</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center tabular-nums">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +0.62%
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">Live NSE Feed · Tick 0.05</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Available Broker Margin
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">₹4,25,000.00</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block">100% Capital With Broker</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Automated Risk Cutoff
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-rose-400 tabular-nums">-₹3,000.00</span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">Max Daily Drawdown Guard</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Execution State
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg sm:text-xl font-bold text-blue-400">PAPER_TRADING</span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">Real Orders Locked</span>
              </div>
            </div>

            {/* Simulated Live Option Strategy Grid */}
            <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/60 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-700/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Active Strategy: Momentum Breakout 15M</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    NIFTY Weekly
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  Last Evaluated: <span className="text-neutral-200 tabular-nums">09:30:00 IST</span> · Latency: <span className="text-emerald-400 tabular-nums">14ms</span>
                </span>
              </div>

              {/* Mini Option Chain / Positions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-400 border-b border-neutral-700/40 pb-2">
                      <th className="py-2 font-medium">Contract Symbol</th>
                      <th className="py-2 font-medium">Type</th>
                      <th className="py-2 font-medium text-right">LTP (₹)</th>
                      <th className="py-2 font-medium text-right">Target (₹)</th>
                      <th className="py-2 font-medium text-right">Stop-Loss (₹)</th>
                      <th className="py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr className="text-neutral-200">
                      <td className="py-2.5 font-semibold text-white">NIFTY24OCT24500CE</td>
                      <td className="py-2.5 text-blue-400 font-medium">CALL (ATM)</td>
                      <td className="py-2.5 text-right tabular-nums text-white">182.40</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400">225.00</td>
                      <td className="py-2.5 text-right tabular-nums text-rose-400">155.00</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                          MONITORING
                        </span>
                      </td>
                    </tr>
                    <tr className="text-neutral-200">
                      <td className="py-2.5 font-semibold text-white">NIFTY24OCT24450PE</td>
                      <td className="py-2.5 text-rose-400 font-medium">PUT (OTM)</td>
                      <td className="py-2.5 text-right tabular-nums text-white">114.15</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400">148.00</td>
                      <td className="py-2.5 text-right tabular-nums text-rose-400">92.00</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                          STANDBY
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Note */}
        <div className="mt-6 flex items-start gap-2.5 max-w-3xl mx-auto p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600">
          <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p>
            <strong>Preview Disclosure:</strong> The interface preview above demonstrates the layout of the institutional cockpit. In accordance with Rule 12 and Rule 22, live trading balances, quotes, and P&L are displayed strictly after connecting your authorized broker credentials.
          </p>
        </div>
      </div>
    </section>
  );
};
