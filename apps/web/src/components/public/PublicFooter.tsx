'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldCheck, ExternalLink, Mail, ShieldAlert } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs font-sans border-t border-neutral-800">
      {/* Top Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white">
                  AutoTrader <span className="text-blue-400 font-semibold">3.0</span>
                </span>
                <span className="text-[10px] text-neutral-400 tracking-wider font-semibold uppercase">
                  Multi-Tenant Options Platform
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Non-custodial algorithmic options trading and account monitoring SaaS. Connect your personal Indian broker, configure strict risk safeguards, and execute rule-based strategies deterministically.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-300 font-medium text-[11px]">
                Platform Status: Normal Telemetry (Phase 1 Execution Gate Active)
              </span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features Overview
                </a>
              </li>
              <li>
                <a href="#brokers" className="hover:text-white transition-colors">
                  Supported Brokers
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Subscription Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Institutional Cockpit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Supported Gateways
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center justify-between">
                <span>Kotak Neo</span>
                <span className="text-[10px] text-emerald-400 font-mono">Supported</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Zerodha Kite</span>
                <span className="text-[10px] text-blue-400 font-mono">Available</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Upstox Pro</span>
                <span className="text-[10px] text-blue-400 font-mono">Available</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Angel One</span>
                <span className="text-[10px] text-amber-400 font-mono">In Review</span>
              </li>
              <li className="flex items-center justify-between">
                <span>DhanHQ</span>
                <span className="text-[10px] text-amber-400 font-mono">In Review</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Fyers API v3</span>
                <span className="text-[10px] text-neutral-500 font-mono">Roadmap</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/risk-disclosure" className="hover:text-white transition-colors">
                  SEBI Risk Disclosure
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@autotrader.local"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Risk Disclosure Banner */}
        <div className="mt-12 pt-8 border-t border-neutral-800 space-y-3 text-[11px] text-neutral-500 leading-relaxed">
          <p>
            <strong className="text-neutral-400">SEBI Statutory Regulatory Disclaimer:</strong> Derivatives (Futures and Options) are complex financial instruments and involve high risk of loss of capital. 9 out of 10 individual traders in equity F&O segment incurred net losses according to SEBI study. NIFTY Auto Trader 3.0 is an independent algorithmic software platform providing deterministic automation tools for personal broker accounts. We are not a SEBI-registered Investment Adviser, Research Analyst, or Portfolio Manager.
          </p>
          <p>
            We do not provide investment advice, trading tips, or guaranteed returns. Past performance does not guarantee future results. Automated order routing is subject to market feed latency, internet connectivity, and broker system availability.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} NIFTY Auto Trader 3.0. All rights reserved. Built with Inter typography & Next.js 14.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-300">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-neutral-300">Privacy</Link>
            <span>·</span>
            <Link href="/risk-disclosure" className="hover:text-neutral-300">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
