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
import { SoftwareApplicationSchema, FAQSchema } from '@/components/public/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  title: 'NIFTY Auto Trader 3.0 — Multi-Broker Algorithmic Options Trading SaaS',
  description:
    'Institutional-grade, non-custodial algorithmic options trading cockpit. Connect Kotak Neo, Dhan, Upstox, FYERS, Zerodha, and Angel One with automated risk governance and zero pooled funds.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'NIFTY options trading',
    'algorithmic trading India',
    'multi-broker trading platform',
    'Kotak Neo API',
    'Dhan HQ API',
    'Upstox API',
    'FYERS API',
    'Zerodha Kite Connect',
    'Angel One SmartAPI',
    'automated trading software',
    'SEBI compliant algo trading',
  ],
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 — One Platform. Your Broker. Your Control.',
    description:
      'Direct-to-broker algorithmic options trading SaaS. Complete account monitoring, systematic execution, and automated loss circuit breakers.',
    url: baseUrl,
    type: 'website',
  },
};

const homeFaqs = [
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
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <SoftwareApplicationSchema url={baseUrl} />
      <FAQSchema faqs={homeFaqs} />

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
