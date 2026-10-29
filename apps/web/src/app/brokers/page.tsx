import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicBrokers } from '@/components/public/PublicBrokers';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { ShieldCheck, Cpu, Key, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'Supported Broker Integrations & API Capabilities',
  description:
    'Institutional multi-broker architecture for Indian retail traders. Direct API integration with Kotak Neo, Dhan, Upstox, FYERS, Zerodha, and Angel One with zero pooled funds and AES-256-GCM encryption.',
  alternates: {
    canonical: '/brokers',
  },
  openGraph: {
    title: 'Supported Brokers — Kotak Neo, Dhan, Upstox, FYERS, Zerodha, Angel One',
    description:
      'Direct API integrations with automated execution safety, tick-aligned validation, and SEBI compliance.',
    url: `${baseUrl}/brokers`,
    type: 'website',
  },
};

export default function PublicBrokersPage() {
  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Supported Brokers', item: `${baseUrl}/brokers` },
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
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Broker Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Supported Broker <span className="text-blue-600">Integrations</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Execute systematic NIFTY option strategies through your personal broker account.
              Our non-custodial architecture routes orders directly via official broker APIs with bank-grade security.
            </p>
          </div>
        </section>

        {/* Canonical Brokers Filter & Showcase */}
        <div className="py-8">
          <PublicBrokers />
        </div>

        {/* Security & Credentials Protocol Callout */}
        <section className="py-12 bg-neutral-50/70 border-t border-b border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Non-Custodial Architecture & Credential Safety
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                In strict adherence to SEBI retail algorithmic trading guidelines and broker API terms,
                NIFTY Auto Trader 3.0 operates on a zero-custody model. We never pool client funds,
                never ask for your trading account passwords, and never store TOTP seeds or MPINs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-1">
                    <Key className="w-4 h-4 text-blue-600" />
                    Interactive OAuth
                  </div>
                  <p className="text-xs text-neutral-500">
                    Authenticate directly on the broker’s official login page with two-factor verification.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-1">
                    <Lock className="w-4 h-4 text-blue-600" />
                    AES-256 Envelope Keys
                  </div>
                  <p className="text-xs text-neutral-500">
                    Session tokens are isolated per tenant and encrypted at rest with hardware-backed keys.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Direct Order Routing
                  </div>
                  <p className="text-xs text-neutral-500">
                    Execution orders pass directly from your runner process to the exchange via your broker.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
                >
                  Connect Your Broker Account <ArrowRight className="w-4 h-4" />
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
