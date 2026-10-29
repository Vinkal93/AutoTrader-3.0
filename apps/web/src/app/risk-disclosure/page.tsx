import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'SEBI Risk Disclosure & Derivatives Trading Warnings',
  description:
    'Mandatory statutory SEBI risk disclosure regarding retail derivatives trading in India, transaction costs, and algorithmic software execution risks.',
  alternates: {
    canonical: '/risk-disclosure',
  },
  openGraph: {
    title: 'SEBI Risk Disclosure on Derivatives — NIFTY Auto Trader 3.0',
    description: 'Mandatory statutory risk advisory for futures and options trading.',
    url: `${baseUrl}/risk-disclosure`,
    type: 'website',
  },
};

export default function RiskDisclosurePage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Risk Disclosure', item: `${baseUrl}/risk-disclosure` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          <div className="border-b border-neutral-200 pb-6 mb-8">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1">
              Regulatory Disclosure
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Risk Disclosure on Derivatives (F&amp;O)
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Prescribed under SEBI Circulars and Exchange Guidelines for retail algorithmic trading
            </p>
          </div>

          {/* Alert Callout */}
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 mb-8 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Key Statistics on Retail Derivatives Trading (SEBI Study)</span>
            </div>
            <ul className="list-disc list-inside text-xs text-rose-900/90 space-y-1 pt-1 leading-relaxed">
              <li>9 out of 10 individual traders in equity Futures and Options (F&amp;O) segment incurred net losses.</li>
              <li>On an average, loss makers registered net trading losses close to ₹50,000.</li>
              <li>Over and above the net trading losses, loss makers incurred an additional 28% of net trading losses as transaction costs.</li>
              <li>Those making net trading profits incurred between 15% to 50% of such profits as transaction costs.</li>
            </ul>
          </div>

          <div className="prose prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Nature of Derivative Products</h2>
              <p>
                Index options and futures are leveraged derivative instruments with defined expiration dates. A small market movement can cause disproportionate gains or rapid and total loss of your invested capital. Traders must never allocate emergency funds, borrowed money, or vital capital to options trading.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Algorithmic Software Limitations & Execution Risks</h2>
              <p>
                While automated trading eliminates emotional hesitation, it introduces technical dependencies. Network packet loss, broker API rate limits, exchange downtime, sudden market illiquidity, and bid-ask spread widening during economic announcements can lead to slippage beyond configured stop-loss levels.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Non-Advisory Status</h2>
              <p>
                NIFTY Auto Trader 3.0 provides deterministic software tools. We do not provide investment advice, trading tips, or guaranteed profit assurances. Any sample strategy parameters or technical indicator rules must be evaluated by the user independently or in consultation with a certified SEBI-registered Investment Adviser (RIA).
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
