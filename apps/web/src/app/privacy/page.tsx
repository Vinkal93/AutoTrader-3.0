import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Privacy Policy — Data Protection & AES-256 Encryption Standards',
  description:
    'Data protection, zero-custody credential encryption standards, and privacy policy for NIFTY Auto Trader 3.0 users.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — NIFTY Auto Trader 3.0',
    description: 'Committed to zero plain-text credential retention and multi-tenant isolation.',
    url: `${baseUrl}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Privacy Policy', item: `${baseUrl}/privacy` },
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
              <h2 className="text-base font-bold text-neutral-900">3. Non-Custodial Data Flow</h2>
              <p>
                Order executions flow directly from your execution worker to your broker gateway. We never sell, rent, or monetize your order history, position data, or trading strategy parameters.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">4. Data Retention & Deletion</h2>
              <p>
                You may revoke broker connection access or request full account termination at any time. Upon deletion, all associated tenant tokens, settings, and audit records are irreversibly wiped from active databases.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
