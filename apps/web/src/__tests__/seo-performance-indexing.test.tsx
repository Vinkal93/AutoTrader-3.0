import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import manifest from '@/app/manifest';
import {
  OrganizationSchema,
  WebSiteSchema,
  SoftwareApplicationSchema,
  BreadcrumbSchema,
  FAQSchema,
} from '@/components/public/StructuredData';

// Import private layouts to verify noindex policy
import { metadata as dashboardMeta } from '@/app/dashboard/layout';
import { metadata as liveTradingMeta } from '@/app/live-trading/layout';
import { metadata as tradingMeta } from '@/app/trading/layout';
import { metadata as brokerMeta } from '@/app/broker/layout';
import { metadata as adminMeta } from '@/app/admin/layout';
import { metadata as strategiesMeta } from '@/app/strategies/layout';
import { metadata as tradesMeta } from '@/app/trades/layout';
import { metadata as analyticsMeta } from '@/app/analytics/layout';
import { metadata as fundsMeta } from '@/app/funds/layout';
import { metadata as riskMeta } from '@/app/risk/layout';
import { metadata as loginMeta } from '@/app/login/layout';
import { metadata as signupMeta } from '@/app/signup/layout';
import { metadata as onboardingMeta } from '@/app/onboarding/layout';

// Import public page metadata
import { metadata as rootMeta } from '@/app/layout';
import { metadata as homeMeta } from '@/app/page';
import { metadata as brokersMeta } from '@/app/brokers/page';
import { metadata as featuresMeta } from '@/app/features/page';
import { metadata as pricingMeta } from '@/app/pricing/page';
import { metadata as howItWorksMeta } from '@/app/how-it-works/page';
import { metadata as faqsMeta } from '@/app/faqs/page';
import { metadata as educationMeta } from '@/app/education/page';
import { metadata as aboutMeta } from '@/app/about/page';
import { metadata as termsMeta } from '@/app/terms/page';
import { metadata as privacyMeta } from '@/app/privacy/page';
import { metadata as riskDisclosureMeta } from '@/app/risk-disclosure/page';
import { metadata as refundPolicyMeta } from '@/app/refund-policy/page';

describe('CODEX Phase 10: SEO, Performance & Web Quality Test Suite', () => {
  describe('TASK 1 — Route Indexing Policy (Strict Dual-Layer noindex on Private Routes)', () => {
    it('enforces robots { index: false, follow: false } on every authenticated/private layout', () => {
      const privateMetas = [
        { name: 'Dashboard', meta: dashboardMeta },
        { name: 'Live Trading Terminal', meta: liveTradingMeta },
        { name: 'Trading', meta: tradingMeta },
        { name: 'Broker Cockpit', meta: brokerMeta },
        { name: 'Super Admin Portal', meta: adminMeta },
        { name: 'Strategy Settings', meta: strategiesMeta },
        { name: 'Trade History', meta: tradesMeta },
        { name: 'Performance Analytics', meta: analyticsMeta },
        { name: 'Funds & Charges', meta: fundsMeta },
        { name: 'Risk Governance', meta: riskMeta },
        { name: 'Trader Login', meta: loginMeta },
        { name: 'Trader Signup', meta: signupMeta },
        { name: 'Onboarding Flow', meta: onboardingMeta },
      ];

      for (const p of privateMetas) {
        expect(p.meta.robots, `${p.name} must have robots directive configured`).toBeDefined();
        const robotsObj = p.meta.robots as any;
        expect(robotsObj.index, `${p.name} MUST be noindex`).toBe(false);
        expect(robotsObj.follow, `${p.name} MUST be nofollow`).toBe(false);
      }
    });

    it('enforces robots { index: true, follow: true } on the root public layout', () => {
      expect(rootMeta.robots).toBeDefined();
      const r = rootMeta.robots as any;
      expect(r.index).toBe(true);
      expect(r.follow).toBe(true);
    });
  });

  describe('TASK 2 — SEO Metadata Quality & Uniqueness', () => {
    it('configures distinct titles and non-empty meta descriptions for all public landing pages', () => {
      const publicMetas = [
        { name: 'Home', meta: homeMeta },
        { name: 'Brokers', meta: brokersMeta },
        { name: 'Features', meta: featuresMeta },
        { name: 'Pricing', meta: pricingMeta },
        { name: 'How It Works', meta: howItWorksMeta },
        { name: 'FAQs', meta: faqsMeta },
        { name: 'Education', meta: educationMeta },
        { name: 'About', meta: aboutMeta },
        { name: 'Terms', meta: termsMeta },
        { name: 'Privacy', meta: privacyMeta },
        { name: 'Risk Disclosure', meta: riskDisclosureMeta },
        { name: 'Refund Policy', meta: refundPolicyMeta },
      ];

      const titles = new Set<string>();

      for (const item of publicMetas) {
        expect(item.meta.title, `${item.name} title must exist`).toBeDefined();
        const titleStr = String(item.meta.title);
        expect(titleStr.length, `${item.name} title length`).toBeGreaterThan(10);
        expect(titles.has(titleStr), `Duplicate title found: ${titleStr}`).toBe(false);
        titles.add(titleStr);

        expect(item.meta.description, `${item.name} description must exist`).toBeDefined();
        expect(String(item.meta.description).length).toBeGreaterThan(30);

        // Canonical URL configured
        expect(item.meta.alternates?.canonical, `${item.name} must specify canonical URL`).toBeDefined();
      }
    });

    it('validates OpenGraph and Twitter card inheritance on root metadata', () => {
      expect((rootMeta.openGraph as any)?.type).toBe('website');
      expect((rootMeta.openGraph as any)?.locale).toBe('en_IN');
      expect((rootMeta.twitter as any)?.card).toBe('summary_large_image');
      expect(rootMeta.metadataBase).toBeDefined();
    });
  });

  describe('TASK 3 — Structured Data (JSON-LD Validation)', () => {
    it('renders valid Organization schema without runtime syntax errors', () => {
      const { container } = render(<OrganizationSchema url="https://autotrader.trade" />);
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || '{}');
      expect(json['@type']).toBe('Organization');
      expect(json.name).toBe('NIFTY Auto Trader 3.0');
      expect(json.contactPoint.email).toBe('support@autotrader.trade');
    });

    it('renders valid WebSite schema', () => {
      const { container } = render(<WebSiteSchema url="https://autotrader.trade" />);
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || '{}');
      expect(json['@type']).toBe('WebSite');
      expect(json.name).toBe('NIFTY Auto Trader 3.0');
    });

    it('renders valid SoftwareApplication schema with pricing offers and feature list', () => {
      const { container } = render(<SoftwareApplicationSchema url="https://autotrader.trade" />);
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || '{}');
      expect(json['@type']).toBe('SoftwareApplication');
      expect(json.applicationCategory).toBe('FinanceApplication');
      expect(json.offers['@type']).toBe('AggregateOffer');
      expect(json.offers.priceCurrency).toBe('INR');
      // Rule 25: Never fabricate ratings or reviews
      expect(json.aggregateRating).toBeUndefined();
      expect(json.review).toBeUndefined();
    });

    it('renders valid BreadcrumbList schema', () => {
      const { container } = render(
        <BreadcrumbSchema
          items={[
            { name: 'Home', item: 'https://autotrader.trade' },
            { name: 'Supported Brokers', item: 'https://autotrader.trade/brokers' },
          ]}
        />
      );
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || '{}');
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement).toHaveLength(2);
      expect(json.itemListElement[0].position).toBe(1);
    });

    it('renders valid FAQPage schema matching actual visible answers', () => {
      const faqs = [
        {
          question: 'Does NIFTY Auto Trader 3.0 hold my trading funds?',
          answer: 'No, the platform is strictly non-custodial.',
        },
      ];
      const { container } = render(<FAQSchema faqs={faqs} />);
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || '{}');
      expect(json['@type']).toBe('FAQPage');
      expect(json.mainEntity[0].name).toBe('Does NIFTY Auto Trader 3.0 hold my trading funds?');
      expect(json.mainEntity[0].acceptedAnswer.text).toBe('No, the platform is strictly non-custodial.');
    });
  });

  describe('TASK 4 — Technical Files (robots.txt, sitemap.xml, manifest.json)', () => {
    it('robots() specifies disallow rules for all private app and API endpoints', () => {
      const res = robots();
      expect(res.rules).toBeDefined();
      const rule = Array.isArray(res.rules) ? res.rules[0] : res.rules;

      expect(rule.disallow).toContain('/dashboard');
      expect(rule.disallow).toContain('/live-trading');
      expect(rule.disallow).toContain('/trading');
      expect(rule.disallow).toContain('/admin');
      expect(rule.disallow).toContain('/broker');
      expect(rule.disallow).toContain('/api/');

      // Allows public pages
      expect(rule.allow).toContain('/');
      expect(rule.allow).toContain('/features');
      expect(rule.allow).toContain('/brokers');
      expect(rule.allow).toContain('/pricing');
      expect(rule.allow).toContain('/how-it-works');

      // Points to sitemap
      expect(res.sitemap).toContain('/sitemap.xml');
    });

    it('sitemap() outputs strictly public pages and zero private/authenticated URLs', () => {
      const entries = sitemap();
      expect(entries.length).toBeGreaterThanOrEqual(10);

      const urls = entries.map((e) => e.url);

      // Verify public routes exist in sitemap
      expect(urls.some((u) => u === 'https://autotrader.trade' || u.endsWith('/'))).toBe(true);
      expect(urls.some((u) => u.includes('/brokers'))).toBe(true);
      expect(urls.some((u) => u.includes('/features'))).toBe(true);
      expect(urls.some((u) => u.includes('/pricing'))).toBe(true);
      expect(urls.some((u) => u.includes('/how-it-works'))).toBe(true);
      expect(urls.some((u) => u.includes('/education'))).toBe(true);

      // Verify ZERO private URLs leaked in sitemap
      expect(urls.some((u) => u.includes('/dashboard'))).toBe(false);
      expect(urls.some((u) => u.includes('/live-trading'))).toBe(false);
      expect(urls.some((u) => u.includes('/trading'))).toBe(false);
      expect(urls.some((u) => u.includes('/admin'))).toBe(false);
      expect(urls.some((u) => u.includes('/broker/'))).toBe(false);
      expect(urls.some((u) => u.includes('/api/'))).toBe(false);
      expect(urls.some((u) => u.includes('/onboarding'))).toBe(false);
      expect(urls.some((u) => u.includes('/login'))).toBe(false);
    });

    it('manifest() produces valid web application manifest', () => {
      const m = manifest();
      expect(m.name).toBe('NIFTY Auto Trader 3.0');
      expect(m.short_name).toBe('AutoTrader 3.0');
      expect(m.display).toBe('standalone');
      expect(m.theme_color).toBe('#2563eb');
    });
  });

  describe('TASK 7 — Content Quality, Truthful Reporting & No False Claims', () => {
    it('ensures no misleading claims of guaranteed profits in metadata', () => {
      const allDescriptions = [
        String(rootMeta.description),
        String(homeMeta.description),
        String(pricingMeta.description),
        String(educationMeta.description),
        String(faqsMeta.description),
      ].join(' ').toLowerCase();

      expect(allDescriptions).not.toContain('guaranteed profit');
      expect(allDescriptions).not.toContain('guaranteed return');
      expect(allDescriptions).not.toContain('100% win');
      expect(allDescriptions).not.toContain('risk-free');
    });
  });
});
