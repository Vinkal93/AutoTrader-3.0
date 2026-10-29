import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';
import { OrganizationSchema, WebSiteSchema } from '@/components/public/StructuredData';
import { Analytics } from '@/components/public/Analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  preload: false,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'NIFTY Auto Trader 3.0 — Multi-Broker Algorithmic Options Trading SaaS',
    template: '%s | NIFTY Auto Trader 3.0',
  },
  description:
    'Institutional-grade, non-custodial algorithmic options trading cockpit. Direct-to-broker execution across Kotak Neo, Dhan, Upstox, FYERS, Zerodha, and Angel One with automated risk governance and zero pooled funds.',
  applicationName: 'NIFTY Auto Trader 3.0',
  authors: [{ name: 'NIFTY Auto Trader Engineering' }],
  generator: 'Next.js',
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
    'intraday options strategy',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'NIFTY Auto Trader 3.0',
  publisher: 'NIFTY Auto Trader 3.0',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NIFTY Auto Trader 3.0 — One Platform. Your Broker. Your Control.',
    description:
      'Direct-to-broker algorithmic options trading SaaS. Complete account monitoring, systematic execution, and automated loss circuit breakers.',
    url: baseUrl,
    siteName: 'NIFTY Auto Trader 3.0',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIFTY Auto Trader 3.0 — Multi-Broker Algorithmic SaaS',
    description:
      'Direct-to-broker algorithmic options trading cockpit with automated risk governance and zero pooled funds.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <OrganizationSchema url={baseUrl} />
        <WebSiteSchema url={baseUrl} />
      </head>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900 selection:bg-blue-100 selection:text-blue-900">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
