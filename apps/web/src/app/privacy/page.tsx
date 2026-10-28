import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — NIFTY Auto Trader 3.0',
  description: 'Data protection, credential encryption standards, and privacy policy for NIFTY Auto Trader 3.0.',
};

export default function PrivacyPage() {
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
              Privacy & Security
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Last updated: October 2026 · Committed to zero plain-text credential retention
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Information We Collect</h2>
              <p>
                We collect your email address, profile contact details, and platform preferences for authentication and tenant isolation. When you connect a broker, ephemeral access tokens received via OAuth 2.0 are stored in encrypted form. We never ask for, collect, or record your broker trading password or MPIN.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. AES-256-GCM Envelope Encryption</h2>
              <p>
                All API keys, secrets, and session tokens are encrypted at rest using AES-256-GCM envelope encryption. Distinct data encryption keys (DEKs) are assigned per tenant to guarantee complete cross-user data isolation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Telemetry and Order Auditing</h2>
              <p>
                Order identifiers, fill timestamps, and execution reports are retained in your personal tenant ledger to fulfill statutory SEBI algorithmic record-keeping requirements (up to 5 years). We do not sell or monetize personal trading records.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">4. Third-Party Broker Communication</h2>
              <p>
                The Platform communicates strictly with your selected broker API gateway over TLS 1.3 encrypted channels. Market quote feeds and order responses are routed directly between your tenant execution context and the broker gateway.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
