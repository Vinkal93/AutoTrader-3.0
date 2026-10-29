import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicFAQ } from '@/components/public/PublicFAQ';
import { BreadcrumbSchema, FAQSchema } from '@/components/public/StructuredData';
import { HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs) — Broker APIs, Safety, and Compliance',
  description:
    'Find clear answers to questions on multi-broker API connectivity, non-custodial operations, SEBI compliance, order reconciliation, and algorithmic safety locks.',
  alternates: {
    canonical: '/faqs',
  },
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 FAQs — Transparent Operating Architecture',
    description:
      'Clear, verified answers about broker connections, non-custodial capital protection, and automated trading safety.',
    url: `${baseUrl}/faqs`,
    type: 'website',
  },
};

const canonicalFaqs = [
  {
    question: 'How does broker account connection work?',
    answer:
      'You connect your trading account via official broker-hosted OAuth 2.0 (for Zerodha Kite, Upstox, Dhan, and Fyers) or through encrypted API credentials (for Kotak Neo and Angel One). All tokens are protected using AES-256-GCM envelope encryption. We never request, capture, or store your trading passwords, MPINs, or TOTP seeds in plain text.',
  },
  {
    question: 'Does NIFTY Auto Trader 3.0 hold or manage my trading funds?',
    answer:
      'No, absolutely not. The platform is strictly a software automation tool and has zero custody of capital. 100% of your trading capital, collateral, and securities remain inside your registered Demat and trading account with your SEBI-registered broker.',
  },
  {
    question: 'What happens if my broker connection disconnects during market hours?',
    answer:
      'If the WebSocket market feed lags by more than 30 seconds or the broker gateway session expires, the execution engine immediately transitions to NOT_CONNECTED state. It halts new entry orders, locks active automation runs, and triggers instant alerts. When reconnected, a strict reconciliation cycle runs to audit existing broker positions before any actions can be resumed.',
  },
  {
    question: 'Which features require explicit compliance approval?',
    answer:
      'While paper trading, market telemetry, and analytics are immediately accessible, automated LIVE real-money order routing requires completing the Retail Algo regulatory declaration, acknowledging derivatives risk, and establishing verified loss limits. LIVE execution is currently phase-locked across the platform until full regulatory sign-off.',
  },
  {
    question: 'How do subscriptions and plan entitlements work?',
    answer:
      'Subscriptions are structured into transparent monthly tiers (Free, Starter, Pro, and Enterprise) defined by quota limits: number of simultaneous broker accounts, active strategy assignments, and historical audit retention. Commercial billing will be activated following production compliance approval.',
  },
  {
    question: 'Are trading profits or positive returns guaranteed?',
    answer:
      'No. We make absolutely zero claims of guaranteed profits, assured returns, or fail-safe execution. Trading index options involves significant market volatility and a high risk of total capital loss. The platform provides software tools for systematic execution and automated risk discipline, but market outcomes can never be guaranteed.',
  },
];

export default function FaqsPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Frequently Asked Questions', item: `${baseUrl}/faqs` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={canonicalFaqs} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Transparent Knowledge Base</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Find honest, technical, and regulatory disclosures regarding how NIFTY Auto Trader 3.0 integrates with your broker, safeguards credentials, and enforces risk boundaries.
            </p>
          </div>
        </section>

        {/* Accordion Component */}
        <div className="py-8">
          <PublicFAQ />
        </div>

        {/* Regulatory Disclosure Banner */}
        <section className="py-12 bg-amber-50/60 border-t border-b border-amber-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-700 space-y-1.5 leading-relaxed">
                <span className="font-bold text-neutral-900 block">
                  Mandatory Statutory Regulatory Notice
                </span>
                <p>
                  Derivative trading (F&O) carries significant financial risk. According to a SEBI study, 9 out of 10 individual traders in equity F&O segment incurred net losses. Past backtested or paper performance is no guarantee of future returns. NIFTY Auto Trader 3.0 is a technology software platform and does not provide investment advice or stock tips.
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
