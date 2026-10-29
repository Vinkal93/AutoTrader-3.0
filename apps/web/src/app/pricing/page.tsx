import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicPricing } from '@/components/public/PublicPricing';
import { BreadcrumbSchema, SoftwareApplicationSchema } from '@/components/public/StructuredData';
import { CreditCard, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Transparent Pricing & Subscription Plans',
  description:
    'Flat monthly software subscription plans with zero profit sharing and zero turnover fees. Explore Free Paper Trading, Pro Trader, and Institutional multi-broker tiers.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 Pricing — Zero Profit Sharing',
    description:
      'Flat software subscription for systematic options traders. Connect your broker directly with zero pooled capital.',
    url: `${baseUrl}/pricing`,
    type: 'website',
  },
};

export default function PricingPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Pricing', item: `${baseUrl}/pricing` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />
      <SoftwareApplicationSchema url={baseUrl} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transparent Software Pricing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Simple, Flat Plans. <span className="text-blue-600">Zero Commissions.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              We never take a percentage of your trading turnover or charge profit sharing fees.
              Pay a predictable flat subscription for software tools while your money stays in your broker account.
            </p>
          </div>
        </section>

        {/* Pricing Cards Component */}
        <div className="py-8">
          <PublicPricing />
        </div>

        {/* Ethical Billing Commitment Callout */}
        <section className="py-12 bg-neutral-50/70 border-t border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    Transparent Financial Disclosure
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Our strict policy against hidden costs, commissions, and simulated returns
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                <p>
                  <strong>No Profit Sharing:</strong> We do not participate in your trading profits or losses. You pay only for access to software technology and broker API connectivity.
                </p>
                <p>
                  <strong>No Hidden Broker Surcharges:</strong> Standard statutory charges (STT, Exchange turnover fee, GST, SEBI charges, Stamp Duty) and broker brokerage are billed directly by your broker on their contract notes.
                </p>
                <p>
                  <strong>Cancel Anytime:</strong> Subscriptions can be paused or cancelled at any time from your account settings with zero lock-in contracts.
                </p>
              </div>

              <div className="pt-2 text-center sm:text-left">
                <Link
                  href="/refund-policy"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                >
                  Read our full Refund Policy and Terms of Service →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
