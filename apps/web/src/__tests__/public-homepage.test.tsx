import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PublicHeader } from '../components/public/PublicHeader';
import { PublicHero } from '../components/public/PublicHero';
import { PublicTrust } from '../components/public/PublicTrust';
import { PublicBrokers } from '../components/public/PublicBrokers';
import { PublicFeatures } from '../components/public/PublicFeatures';
import { PublicPricing } from '../components/public/PublicPricing';
import { PublicFAQ } from '../components/public/PublicFAQ';
import { PublicFooter } from '../components/public/PublicFooter';

describe('Public Home Page Components Suite', () => {
  describe('PublicHeader', () => {
    it('renders branding and main navigation links', () => {
      render(<PublicHeader />);

      expect(screen.getByText(/AutoTrader/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /NIFTY Auto Trader 3.0 Home/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Supported Brokers')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('FAQs')).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger button is clicked', () => {
      render(<PublicHeader />);

      const toggleBtn = screen.getByLabelText(/Open navigation menu/i);
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggleBtn);
      expect(screen.getByLabelText(/Close navigation menu/i)).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('navigation', { name: /Mobile navigation/i })).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/Close navigation menu/i));
      expect(screen.queryByRole('navigation', { name: /Mobile navigation/i })).not.toBeInTheDocument();
    });
  });

  describe('PublicHero', () => {
    it('renders primary headline and both functional CTAs', () => {
      render(<PublicHero />);

      expect(
        screen.getByRole('heading', { level: 1, name: /One Platform.*Your Broker.*Your Control/i })
      ).toBeInTheDocument();

      const getStartedBtn = screen.getByRole('link', { name: /Get Started Free/i });
      expect(getStartedBtn).toBeInTheDocument();
      expect(getStartedBtn).toHaveAttribute('href', '/dashboard');

      const exploreFeaturesBtn = screen.getByRole('link', { name: /Explore Features/i });
      expect(exploreFeaturesBtn).toBeInTheDocument();
      expect(exploreFeaturesBtn).toHaveAttribute('href', '#features');
    });

    it('displays non-custodial and encryption guarantees', () => {
      render(<PublicHero />);

      expect(screen.getByText('100% Non-Custodial')).toBeInTheDocument();
      expect(screen.getByText('Encrypted Credentials')).toBeInTheDocument();
      expect(screen.getByText('Rigorous Risk Gates')).toBeInTheDocument();
    });
  });

  describe('PublicTrust', () => {
    it('emphasizes that trader funds remain with broker', () => {
      render(<PublicTrust />);

      expect(
        screen.getByRole('heading', { level: 2, name: /Your Funds Stay With Your Broker/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Zero Custody of Capital')).toBeInTheDocument();
      expect(screen.getByText('Secure OAuth Authorization')).toBeInTheDocument();
      expect(screen.getByText('Direct Demat Execution')).toBeInTheDocument();
      expect(screen.getByText('Truthful Telemetry')).toBeInTheDocument();
    });
  });

  describe('PublicBrokers', () => {
    it('displays canonical broker registry with genuine states', () => {
      render(<PublicBrokers />);

      expect(screen.getByText('Kotak Neo')).toBeInTheDocument();
      expect(screen.getByText('Zerodha Kite')).toBeInTheDocument();
      expect(screen.getByText('Upstox Pro')).toBeInTheDocument();
      expect(screen.getByText('Angel One')).toBeInTheDocument();
      expect(screen.getByText('DhanHQ')).toBeInTheDocument();
      expect(screen.getByText('Fyers')).toBeInTheDocument();

      // Check genuine state pills
      expect(screen.getByText('Supported')).toBeInTheDocument();
      expect(screen.getAllByText('Connection available').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Approval pending').length).toBeGreaterThan(0);
      expect(screen.getByText('Coming soon')).toBeInTheDocument();
    });

    it('filters brokers accurately by status pill', () => {
      render(<PublicBrokers />);

      // Filter by Live & Available
      const activeFilterBtn = screen.getByRole('button', { name: /Live & Available/i });
      fireEvent.click(activeFilterBtn);

      expect(screen.getByText('Kotak Neo')).toBeInTheDocument();
      expect(screen.getByText('Zerodha Kite')).toBeInTheDocument();
      expect(screen.getByText('Upstox Pro')).toBeInTheDocument();
      expect(screen.queryByText('Angel One')).not.toBeInTheDocument();

      // Filter by Pending / Roadmap
      const pendingFilterBtn = screen.getByRole('button', { name: /In Verification/i });
      fireEvent.click(pendingFilterBtn);

      expect(screen.queryByText('Kotak Neo')).not.toBeInTheDocument();
      expect(screen.getByText('Angel One')).toBeInTheDocument();
      expect(screen.getByText('DhanHQ')).toBeInTheDocument();
      expect(screen.getByText('Fyers')).toBeInTheDocument();
    });
  });

  describe('PublicFeatures', () => {
    it('renders all 8 canonical features', () => {
      render(<PublicFeatures />);

      expect(screen.getByText('Personal Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Broker Connections')).toBeInTheDocument();
      expect(screen.getByText('Order Management')).toBeInTheDocument();
      expect(screen.getByText('Strategy Engine')).toBeInTheDocument();
      expect(screen.getByText('Risk Controls')).toBeInTheDocument();
      expect(screen.getByText('Trade History')).toBeInTheDocument();
      expect(screen.getByText('Analytics & Charges')).toBeInTheDocument();
      expect(screen.getByText('Real-Time Notifications')).toBeInTheDocument();
    });
  });

  describe('PublicPricing', () => {
    it('renders database-backed plans and transparent availability states', () => {
      render(<PublicPricing />);

      expect(screen.getByText('Free Tier')).toBeInTheDocument();
      expect(screen.getByText('Starter Trader')).toBeInTheDocument();
      expect(screen.getByText('Professional Trader')).toBeInTheDocument();
      expect(screen.getByText('Prop & Enterprise')).toBeInTheDocument();

      // Free tier is actionable
      expect(screen.getByRole('link', { name: /Get Started Free/i })).toBeInTheDocument();

      // Paid tiers are disabled in preview
      const previewBtns = screen.getAllByRole('button', { name: /Pre-Release Preview/i });
      expect(previewBtns.length).toBe(2);
      expect(previewBtns[0]).toBeDisabled();
    });
  });

  describe('PublicFAQ', () => {
    it('toggles accordion items on user interaction', () => {
      render(<PublicFAQ />);

      // First item is open by default
      expect(
        screen.getByText(/You connect your trading account via official broker-hosted OAuth 2.0/i)
      ).toBeInTheDocument();

      // Second question (fund holding)
      const fundQBtn = screen.getByText(/Does NIFTY Auto Trader 3.0 hold or manage my trading funds\?/i);
      fireEvent.click(fundQBtn);

      expect(
        screen.getByText(/No, absolutely not. The platform is strictly a software automation tool/i)
      ).toBeInTheDocument();

      // Guaranteed profit question
      const profitQBtn = screen.getByText(/Are trading profits or positive returns guaranteed\?/i);
      fireEvent.click(profitQBtn);

      expect(
        screen.getByText(/We make absolutely zero claims of guaranteed profits/i)
      ).toBeInTheDocument();
    });
  });

  describe('PublicFooter', () => {
    it('renders legal links, SEBI disclosure, and platform status', () => {
      render(<PublicFooter />);

      expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: 'SEBI Risk Disclosure' })).toHaveAttribute('href', '/risk-disclosure');
      expect(screen.getByRole('link', { name: 'Refund & Cancellation' })).toHaveAttribute('href', '/refund-policy');

      expect(screen.getByText(/SEBI Statutory Regulatory Disclaimer/i)).toBeInTheDocument();
      expect(screen.getByText(/Phase 1 Execution Gate Active/i)).toBeInTheDocument();
    });
  });
});
