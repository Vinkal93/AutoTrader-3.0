import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';
  const currentDate = new Date().toISOString();

  // Task 1: Strictly only public, indexable pages. Zero private/tenant endpoints.
  const publicRoutes: {
    url: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
  }[] = [
    { url: '', changeFrequency: 'daily', priority: 1.0 },
    { url: '/features', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/brokers', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/how-it-works', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/pricing', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/education', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/faqs', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/risk-disclosure', changeFrequency: 'monthly', priority: 0.4 },
    { url: '/terms', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/refund-policy', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
