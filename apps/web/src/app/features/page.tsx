import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicFeatures } from '@/components/public/PublicFeatures';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { Sliders, ShieldCheck, Zap, Layers, BarChart3, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Platform Features — Algorithmic Options Execution & Risk Cockpit',
  description:
    'Explore institutional trading automation features: multi-broker order execution, live options depth scanning, 9/21 EMA trend filters, automated stop-loss protection, and itemized fee tracking.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 Features — Systematic Options Trading',
    description:
      'Engineered for Indian index options traders. Automated risk controls, live scanner, and direct broker API execution.',
    url: `${baseUrl}/features`,
    type: 'website',
  },
};

export default function FeaturesPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Features', item: `${baseUrl}/features` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="flex-1">
        {/* Features Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <Sliders className="w-3.5 h-3.5" />
              <span>Full-Stack Trading Technology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Engineered for <span className="text-blue-600">Disciplined Execution</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Every component is built for speed, precision, and safety. From automated pre-flight margin checks to deterministic order idempotency, trade options systematically without emotional bias.
            </p>
          </div>
        </section>

        {/* Core Feature Grid */}
        <div className="py-8">
          <PublicFeatures />
        </div>

        {/* Feature Highlight Deep-Dive */}
        <section className="py-16 bg-neutral-50/70 border-t border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Architectural Invariants & Safety Gates
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                How our platform protects trader capital before, during, and after market sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Pre-Flight Risk Validation</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Every order is checked against exchange tick size increments (₹0.05), lot multiples (25 lots for NIFTY), available broker margin, and daily loss allowance before submission.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Automated Order Idempotency</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Cryptographic client order IDs prevent duplicate order placement during network retries or transient broker timeouts, ensuring zero unintended multi-fills.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Market Calendar & Time Exits</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Integrated NSE market holiday calendar and automated 15:15 IST square-off prevents overnight margin risk and mandatory broker auto-square-off call charges.
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                Experience Platform Capabilities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
