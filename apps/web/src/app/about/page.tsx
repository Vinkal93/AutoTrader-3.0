import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { TrendingUp, ShieldCheck, Cpu, Code2, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'About Us — Engineering Non-Custodial Trading Technology',
  description:
    'Learn about NIFTY Auto Trader 3.0: our mission to provide systematic, rule-based algorithmic trading infrastructure with 100% non-custodial capital protection and zero pooled funds.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About NIFTY Auto Trader 3.0 — Engineering Non-Custodial SaaS',
    description:
      'Building disciplined algorithmic software for Indian derivatives traders without pooled funds or deceptive profit claims.',
    url: `${baseUrl}/about`,
    type: 'website',
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'About Us', item: `${baseUrl}/about` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Technology Philosophy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Software for <span className="text-blue-600">Disciplined Trading</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              We build institutional-grade software tools for Indian retail options traders who value mathematical discipline, strict loss limits, and complete non-custodial control over their funds.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Our Mission</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Retail options trading in India is predominantly hindered by emotional decisions: revenge trading, averaging losing positions, and holding into expiry without stop-loss execution. Our mission is to provide automated software guardrails that enforce quantitative execution, tick-aligned order submission, and automated loss limits directly through official broker APIs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-neutral-900">Zero Custody</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    We never touch your trading capital. 100% of your funds and securities remain with your SEBI-registered broker Demat account.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-neutral-900">Radical Truth in Reporting</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    We never hide statutory charges or show synthetic simulated gains. P&L is reconciled honestly against broker contract notes.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
                <span className="font-bold text-neutral-900 uppercase tracking-wider block">
                  Regulatory Integrity Statement
                </span>
                <p>
                  NIFTY Auto Trader 3.0 operates strictly as a technology software vendor. We do not operate a proprietary trading desk, do not solicit capital, and do not provide advisory or portfolio management services. All automated routines run within user-configured parameters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
