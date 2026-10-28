import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEBI Risk Disclosure & Derivatives Warning — NIFTY Auto Trader 3.0',
  description: 'Statutory SEBI risk disclosure and derivatives trading risk advisory.',
};

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />

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
              <h2 className="text-base font-bold text-neutral-900">1. High Financial Risk of Index Options</h2>
              <p>
                Trading in NIFTY 50 and index options involves substantial leverage. A small movement in the underlying index can result in disproportionately large profits or losses. Long option positions can expire completely worthless, resulting in 100% loss of the premium paid. Short option positions carry theoretical unlimited risk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Algorithmic Execution and Technology Risks</h2>
              <p>
                Algorithmic trading systems depend heavily on internet connectivity, exchange server latency, broker API availability, and accurate tick streaming. In situations of extreme volatility or communication dropouts, orders may not be executed at expected prices, or stop-loss triggers may experience slippage.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. No Assured Returns or Advisory</h2>
              <p>
                NIFTY Auto Trader 3.0 does not guarantee profitable trading outcomes, positive returns, or protection against loss. The user remains solely and fully liable for all trading decisions, capital allocations, and risk management parameters configured on the platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
