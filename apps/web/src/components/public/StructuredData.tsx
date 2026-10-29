import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const OrganizationSchema: React.FC<{ url?: string }> = ({
  url = 'https://autotrader.trade',
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NIFTY Auto Trader 3.0',
    url,
    logo: `${url}/logo.png`,
    description:
      'Multi-tenant, multi-broker algorithmic trading SaaS platform for Indian index options.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@autotrader.trade',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  return <JsonLd data={schema} />;
};

export const WebSiteSchema: React.FC<{ url?: string }> = ({
  url = 'https://autotrader.trade',
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NIFTY Auto Trader 3.0',
    url,
    description:
      'Direct-to-broker algorithmic options trading SaaS with automated risk limits and zero pooled funds.',
    publisher: {
      '@type': 'Organization',
      name: 'NIFTY Auto Trader 3.0',
    },
  };

  return <JsonLd data={schema} />;
};

export const SoftwareApplicationSchema: React.FC<{ url?: string }> = ({
  url = 'https://autotrader.trade',
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NIFTY Auto Trader 3.0',
    operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: '0',
      highPrice: '2999',
      offerCount: '3',
    },
    featureList: [
      'Multi-broker connectivity (Kotak Neo, Dhan, Upstox, FYERS, Zerodha, Angel One)',
      'Non-custodial direct-to-broker execution with zero pooled funds',
      'Automated daily loss limits and pre-flight risk checks',
      'Deterministic option chain depth and trend analytics',
      'Client order idempotency and automated reconciliation',
    ],
  };

  return <JsonLd data={schema} />;
};

export const BreadcrumbSchema: React.FC<{
  items: { name: string; item: string }[];
}> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return <JsonLd data={schema} />;
};

export const FAQSchema: React.FC<{
  faqs: { question: string; answer: string }[];
}> = ({ faqs }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={schema} />;
};
