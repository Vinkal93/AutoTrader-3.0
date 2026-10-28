'use client';

import React from 'react';
import { ShieldCheck, Lock, Wallet, AlertOctagon, CheckCircle2, FileText } from 'lucide-react';

export const PublicTrust: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Integrity & Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Your Funds Stay With Your Broker. Always.
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            NIFTY Auto Trader 3.0 is a pure technology execution interface. We do not hold client funds, manage pooled portfolios, or act as a financial intermediary.
          </p>
        </div>

        {/* 4 Architectural Pillars of Trust */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Zero Custody of Capital
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We have zero deposit capabilities or digital wallets. All collateral, ledger balances, and margin allocations remain securely inside your registered broker Demat account.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Secure OAuth Authorization
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Authenticate via your broker&apos;s official interactive login portal. We never request or store your broker trading password, MPIN, or raw two-factor credentials.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Direct Demat Execution
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every order submitted through the platform is tagged with your individual broker client code. There are zero pooled master accounts or cross-tenant risk leakage.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Truthful Telemetry
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Zero synthetic pricing or mock trades in runtime. KPIs, option Greeks, and P&L figures are calculated strictly from genuine broker contract notes and exchange quotes.
            </p>
          </div>
        </div>

        {/* Honest Disclosure Banner */}
        <div className="mt-10 p-5 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-xs text-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-neutral-500 shrink-0" />
            <span>
              <strong>Regulatory Integrity:</strong> We do not publish fabricated user testimonials, synthetic volume counters, or unverified partner claims. All platform capabilities conform to the SEBI Algorithmic Trading Framework.
            </span>
          </div>
          <a
            href="#faq"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 hover:underline"
          >
            Read FAQs & Safety FAQ →
          </a>
        </div>
      </div>
    </section>
  );
};
