import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NIFTY Auto Trader 3.0',
    short_name: 'AutoTrader 3.0',
    description: 'Multi-Tenant, Multi-Broker Algorithmic Options Trading SaaS',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
