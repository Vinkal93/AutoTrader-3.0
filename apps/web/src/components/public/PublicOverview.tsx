'use client';

import React from 'react';
import {
  Layers,
  LayoutDashboard,
  Cpu,
  History,
  Receipt,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export const PublicOverview: React.FC = () => {
  const pillars = [
    {
      icon: Layers,
      title: 'Canonical Multi-Broker Connectivity',
      description:
        'Connect leading Indian brokers via a normalized, high-throughput abstraction layer. Monitor live sessions, refresh daily tokens, and maintain distinct tenant-isolated credentials.',
      tag: 'Connectivity',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: LayoutDashboard,
      title: 'Institutional Cockpit & Live Telemetry',
      description:
        'Observe NIFTY 50 options chains, intraday price action, mark-to-market positions, and execution queues with sub-second feed latency and millisecond responsiveness.',
      tag: 'Telemetry',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      icon: Cpu,
      title: 'Rule-Based Strategy Automation',
      description:
        'Deploy systematic index option breakout, mean-reversion, and delta-hedging strategies. Automate strike selection, trailing stops, and multi-leg risk rules safely.',
      tag: 'Automation',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: ShieldCheck,
      title: 'Idempotent Pre-Flight Order Routing',
      description:
        'Prevent accidental duplicate entries with unique client order idempotency keys. Pre-flight checks enforce tick-size conformity, lot sizes, and broker-specific price collars.',
      tag: 'Execution Safety',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      icon: History,
      title: 'Complete Lifecycle Trade Audit',
      description:
        'Retain an immutable audit trail of every execution intent, broker order ID, exchange trade ID, and partial fill event. Built for compliance and post-trade performance review.',
      tag: 'Auditability',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      icon: Receipt,
      title: 'Exact Fee & Regulatory Charge Accounting',
      description:
        'Analyze true net profitability. The platform calculates actual broker commissions alongside statutory Securities Transaction Tax (STT), exchange charges, SEBI fees, and GST.',
      tag: 'Charges Accounting',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  return (
    <section id="overview" className="py-16 md:py-24 bg-neutral-50/60 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Designed for Systematic Index Option Traders
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            From broker connectivity to post-trade tariff reconciliation, every subsystem is engineered for deterministic execution and strict capital preservation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Launch the Trading Terminal to explore the live interface
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
