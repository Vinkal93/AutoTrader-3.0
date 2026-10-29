import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Terms of Use — Software Licensing & Operational Agreement',
  description:
    'Terms of service, non-custodial software licensing conditions, and operational requirements governing the use of NIFTY Auto Trader 3.0 platform.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Use — NIFTY Auto Trader 3.0',
    description: 'Terms of service and software licensing conditions governing platform operations.',
    url: `${baseUrl}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Terms of Use', item: `${baseUrl}/terms` },
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
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Legal Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Terms of Use
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Last updated: October 2026 · Effective across all NIFTY Auto Trader 3.0 services
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or utilizing the NIFTY Auto Trader 3.0 platform (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our accompanying Risk Disclosure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Nature of Software Service</h2>
              <p>
                NIFTY Auto Trader 3.0 is an independent software technology platform that provides algorithmic automation, telemetry monitoring, and risk management tools for personal broker trading accounts. The Platform is NOT a broker-dealer, investment adviser, portfolio manager, or research analyst. All trade executions occur directly within your authorized third-party broker account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Non-Custodial Architecture & Fund Safety</h2>
              <p>
                The Platform has zero custody of trader capital, margin, or securities. All deposits, withdrawals, and margin collaterals remain exclusively with your registered broker. The Platform does not pool funds or execute trades under umbrella master accounts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">4. User Responsibilities & Regulatory Declarations</h2>
              <p>
                You represent that you are legally competent to trade Indian securities and derivatives on recognized stock exchanges (NSE/BSE). You are solely responsible for maintaining valid broker credentials, monitoring open positions, understanding the mechanics of derivative contracts, and setting appropriate capital allocation boundaries.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">5. Limitation of Liability</h2>
              <p>
                Under no circumstances shall NIFTY Auto Trader 3.0, its developers, or affiliates be liable for trading losses, market slippage, exchange outages, broker gateway rejections, feed latency, or network disconnects. All algorithmic tools are used at the trader&apos;s sole risk and discretion.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
