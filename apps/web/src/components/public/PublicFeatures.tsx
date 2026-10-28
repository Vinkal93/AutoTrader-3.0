'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  History,
  BarChart3,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export const PublicFeatures: React.FC = () => {
  const features = [
    {
      icon: LayoutDashboard,
      title: 'Personal Dashboard',
      description:
        'Unified single-pane monitoring of your active broker connection, available cash and margin utilization, mark-to-market P&L, and system health status in real time.',
      points: ['Live NIFTY 50 telemetry', 'Margin & collateral monitor', 'Instant broker sync button'],
    },
    {
      icon: Layers,
      title: 'Broker Connections',
      description:
        'Manage individual broker connections with AES-256-GCM envelope-encrypted credentials. Seamless daily session re-authentication with zero stored plain-text passwords.',
      points: ['Multi-broker capability', 'Interactive OAuth 2.0 flow', 'Automatic session health checks'],
    },
    {
      icon: ShoppingBag,
      title: 'Order Management',
      description:
        'Deterministic, idempotent order routing (`tenant_id:client_order_id`) that prevents accidental duplicate orders, with mandatory Stop-Loss Limit (SL-L) protections.',
      points: ['Zero duplicate BUY guarantee', 'Price tick alignment (0.05)', 'Broker order reconciliation'],
    },
    {
      icon: Sliders,
      title: 'Strategy Engine',
      description:
        'Version-controlled options trading strategies. Configure strike distances, profit targets, trailing stop-losses, and execution modes (OFF, PAPER, LIVE) safely.',
      points: ['Immutable version history', 'Deterministic strike selection', 'Strategy parameter audit trail'],
    },
    {
      icon: ShieldAlert,
      title: 'Risk Controls',
      description:
        'Multi-tiered circuit breakers. Enforce hard daily loss limits, lot size caps per order, and automatic execution freeze when abnormal volatility or feed lag is detected.',
      points: ['Max daily drawdown lock', 'Per-trade lot constraints', 'Execution safety gate'],
    },
    {
      icon: History,
      title: 'Trade History',
      description:
        'Exhaustive, audit-ready trade ledger. Trace every trade cycle from strategy intent generation to exchange fill, with precise broker trade IDs and timestamps.',
      points: ['Trade cycle state machine', 'Exchange trade IDs recorded', 'Exportable CSV audit records'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Charges',
      description:
        'Honest performance analytics comparing gross vs. broker-confirmed net P&L. Complete breakdown of STT, GST, SEBI turnover fees, stamp duty, and exchange tariffs.',
      points: ['Gross vs. Net P&L metrics', 'Statutory charges breakdown', 'CE vs. PE performance attribution'],
    },
    {
      icon: Bell,
      title: 'Real-Time Notifications',
      description:
        'Configurable multi-channel alert delivery for trade fills, broker disconnects, risk locks, and margin warnings via Webhooks, Email, and in-app feeds.',
      points: ['Deduplicated alert delivery', 'Critical risk push alerts', 'Persistent incident history'],
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <Sliders className="w-3.5 h-3.5" />
            Comprehensive Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Engineered for Precision & Safety
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Eight canonical pillars covering the entire algorithmic trading lifecycle — from secure authentication to post-market regulatory reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-1.5">
                  {feature.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-[11px] text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
