import type { Metadata } from 'next';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicTrust } from '@/components/public/PublicTrust';
import { PublicOverview } from '@/components/public/PublicOverview';
import { PublicPreview } from '@/components/public/PublicPreview';
import { PublicHowItWorks } from '@/components/public/PublicHowItWorks';
import { PublicBrokers } from '@/components/public/PublicBrokers';
import { PublicFeatures } from '@/components/public/PublicFeatures';
import { PublicPricing } from '@/components/public/PublicPricing';
import { PublicFAQ } from '@/components/public/PublicFAQ';
import { PublicFooter } from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'NIFTY Auto Trader 3.0 — Multi-Broker Algorithmic Options Trading SaaS',
  description:
    'Institutional-grade, non-custodial algorithmic options trading cockpit. Connect Kotak Neo, Zerodha Kite, Upstox, Angel One, and Dhan with automated risk governance and zero pooled funds.',
  keywords: [
    'NIFTY options trading',
    'algorithmic trading India',
    'multi-broker trading platform',
    'Kotak Neo API',
    'Zerodha Kite Connect',
    'Upstox API',
    'automated trading software',
    'SEBI compliant algo trading',
  ],
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 — One Platform. Your Broker. Your Control.',
    description:
      'Direct-to-broker algorithmic options trading SaaS. Complete account monitoring, systematic execution, and automated loss circuit breakers.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Sticky Public Header Navigation */}
      <PublicHeader />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <PublicHero />

        {/* 3. Trust & Transparency */}
        <PublicTrust />

        {/* 4. Product Overview */}
        <PublicOverview />

        {/* 5. Software Cockpit Preview */}
        <PublicPreview />

        {/* 6. How It Works */}
        <PublicHowItWorks />

        {/* 7. Canonical Supported Brokers */}
        <PublicBrokers />

        {/* 8. Comprehensive Features */}
        <PublicFeatures />

        {/* 9. Database-Backed Pricing */}
        <PublicPricing />

        {/* 10. Frequently Asked Questions */}
        <PublicFAQ />
      </main>

      {/* 11. Public Footer */}
      <PublicFooter />
    </div>
  );
}
