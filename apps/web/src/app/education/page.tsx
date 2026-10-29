import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { BookOpen, ShieldCheck, Scale, Cpu, Receipt, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Algorithmic Options Trading Education & Risk Management Guide',
  description:
    'Comprehensive guide on multi-broker API connectivity, non-custodial trading architecture, SEBI compliance rules, option slippage, and systematic risk management for Indian traders.',
  alternates: {
    canonical: '/education',
  },
  openGraph: {
    title: 'Algorithmic Options Trading Education — NIFTY Auto Trader 3.0',
    description:
      'Master the engineering principles of automated options execution: tick alignment, broker rate limits, net fee auditing, and risk circuit breakers.',
    url: `${baseUrl}/education`,
    type: 'website',
  },
};

export default function EducationPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Educational Knowledge Base', item: `${baseUrl}/education` },
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
              <BookOpen className="w-3.5 h-3.5" />
              <span>Independent Educational Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Systematic Trading <span className="text-blue-600">Education</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Understand the core mechanics of algorithmic execution: non-custodial broker APIs, option contract tick sizes, latency considerations, and statutory fee calculations.
            </p>
          </div>
        </section>

        {/* Educational Modules Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Module 1 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  1. Non-Custodial Architecture & Fund Safety
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  In a non-custodial model, the trading software never holds, routes, or pools client funds. Your margins, collateral, and securities remain 100% inside your own Demat and trading account with your SEBI-registered broker. Orders are dispatched using OAuth access tokens directly to the broker gateway, eliminating counterparty insolvency risks.
                </p>
              </article>

              {/* Module 2 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  2. Intraday Risk Management & Daily Limits
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The primary advantage of automated software is emotional discipline. By defining maximum daily loss limits, automated trading sessions halt permanently for the day upon crossing the risk threshold. This protects traders from revenge trading, tilt, and catastrophic drawdowns during abnormal volatility spikes.
                </p>
              </article>

              {/* Module 3 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  3. Broker API Rates, Throttling & Latency
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Each broker enforces strict rate limits (e.g., Kotak Neo permits 10 orders/sec, Zerodha Kite limits to 200 orders/minute). High-performance trading engines must implement client-side token bucket rate limiters to avoid HTTP 429 exceptions that could leave positions unprotected during high-volatility events.
                </p>
              </article>

              {/* Module 4 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  4. The True Cost of Trading: Statutory Deductions
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Gross trading profit rarely equals net realized profit. Indian derivatives trades incur Securities Transaction Tax (STT on sell side), Exchange Transaction Charges, GST (18% on brokerage and exchange fees), SEBI turnover fees, and Stamp Duty. Transparent software must audit and display itemized deductions against actual broker contract notes.
                </p>
              </article>

              {/* Module 5 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  5. Client-Side Order Idempotency
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Network packets can drop over the internet. When an API call times out, a naive client might re-send the order, creating duplicate fills. Proper algorithmic infrastructure attaches a unique idempotent client order key (`tenant:order_uuid`), allowing the broker matching engine to reject duplicate requests deterministically.
                </p>
              </article>

              {/* Module 6 */}
              <article className="p-6 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  6. SEBI Retail Algorithmic Regulations
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  SEBI circulars govern how retail algos must operate. Third-party software must not promise assured returns, offer black-box pooling, or route orders through unauthorized shared servers without audit trails. Always ensure your automation provider operates within official broker API partner boundaries.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Regulatory Disclosure Banner */}
        <section className="py-12 bg-amber-50/60 border-t border-b border-amber-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-2">
              <span className="font-bold text-xs text-amber-900 uppercase tracking-wider block">
                Educational Disclaimer
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The information provided on this page is for general educational and technological information purposes only and does not constitute financial, investment, legal, or tax advice. Derivative products are complex instruments and come with a high risk of losing money rapidly due to leverage.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
