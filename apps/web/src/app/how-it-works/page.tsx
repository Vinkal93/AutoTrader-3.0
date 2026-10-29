import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicHowItWorks } from '@/components/public/PublicHowItWorks';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { KeyRound, Sliders, ShieldCheck, BarChart2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'How It Works — Automated Options Trading & Broker Connectivity',
  description:
    'Understand how NIFTY Auto Trader 3.0 operates: direct-to-broker OAuth authentication, non-custodial execution, pre-flight safety checks, and automated daily loss circuit breakers.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How NIFTY Auto Trader Works — Non-Custodial SaaS',
    description:
      'Step-by-step guide to connecting your broker, configuring rule-based strategies, and managing intraday risk.',
    url: `${baseUrl}/how-it-works`,
    type: 'website',
  },
};

export default function HowItWorksPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'How It Works', item: `${baseUrl}/how-it-works` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Simple, Transparent Workflow</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              How <span className="text-blue-600">AutoTrader 3.0</span> Works
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Experience algorithmic execution without technical complexity.
              Connect your verified broker account, set your quantitative rules, and let the deterministic engine manage orders with zero pooled funds.
            </p>
          </div>
        </section>

        {/* Existing HowItWorks Flow */}
        <div className="py-8">
          <PublicHowItWorks />
        </div>

        {/* Technical Deep Dive Section */}
        <section className="py-16 bg-neutral-50/70 border-t border-b border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Execution Lifecycle & Safety State Machine
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                Every trade passes through a verified 12-stage state machine before, during, and after submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Stage 1</span>
                <h3 className="font-bold text-sm text-neutral-900">Pre-Flight Guard</h3>
                <p className="text-xs text-neutral-500">
                  Verifies lot size multiple, tick alignment, broker session token validity, and daily loss limits.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Stage 2</span>
                <h3 className="font-bold text-sm text-neutral-900">Direct Broker Dispatch</h3>
                <p className="text-xs text-neutral-500">
                  Sends order payload with unique idempotency key directly to your broker’s official API endpoint.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Stage 3</span>
                <h3 className="font-bold text-sm text-neutral-900">Protective Bracket</h3>
                <p className="text-xs text-neutral-500">
                  Instantly recalculates and places protective stop-loss and profit target orders based on actual fill price.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Stage 4</span>
                <h3 className="font-bold text-sm text-neutral-900">Fee Reconciliation</h3>
                <p className="text-xs text-neutral-500">
                  Reconciles exchange execution reports with itemized STT, GST, SEBI, and broker fee audit records.
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                Get Started with Non-Custodial SaaS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
