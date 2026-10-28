import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — NIFTY Auto Trader 3.0',
  description: 'Subscription refund, renewal, and cancellation policy for NIFTY Auto Trader 3.0 SaaS.',
};

export default function RefundPolicyPage() {
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
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Billing & Subscriptions
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Clear rules regarding subscription billing, plan cancellations, and digital service delivery
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Free Tier Evaluation</h2>
              <p>
                All registered users have unrestricted access to the Free Tier to evaluate paper trading, broker telemetry, and order management tools without any payment obligation. We recommend testing all platform features extensively on the Free Tier prior to subscribing to paid tiers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Subscription Cancellation</h2>
              <p>
                You may cancel your monthly recurring subscription at any time directly from the account settings page. Upon cancellation, your access to paid plan entitlements will remain active until the end of your current billing period, after which your account will automatically revert to the Free Tier.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Digital Service Delivery & Refunds</h2>
              <p>
                Due to the immediate provisioning of computing infrastructure and cloud execution leases, subscription fees are non-refundable once a billing cycle commences, except in cases of verified duplicate billing or sustained platform outages lasting longer than 48 continuous market hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
