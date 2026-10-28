'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, Sliders, Activity } from 'lucide-react';

export const PublicHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-white via-neutral-50/50 to-white border-b border-neutral-100">
      {/* Background Subtle Grid Accent */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Compliance & Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold mb-6 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Direct-to-Broker Architecture · Non-Custodial SaaS</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.12]">
            One Platform. <br className="hidden sm:inline" />
            <span className="text-blue-600">Your Broker.</span> Your Control.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-neutral-600 leading-relaxed">
            The multi-tenant algorithmic trading cockpit for disciplined Indian index options traders.
            Connect your personal broker account, monitor real-time positions, execute rule-based strategies,
            and enforce automated risk controls with zero pooled funds.
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition-all shadow-2xs hover:border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Explore Features
              <Sliders className="w-4 h-4 text-neutral-500" />
            </a>
          </div>

          {/* Trust Guarantees Row */}
          <div className="mt-12 pt-8 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-neutral-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">100% Non-Custodial</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Your capital, margins, and securities always remain inside your verified broker Demat account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-neutral-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Encrypted Credentials</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Direct OAuth 2.0 and AES-256-GCM envelope encryption. We never store trading passwords or MPINs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-neutral-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Rigorous Risk Gates</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Hard-coded maximum loss limits, circuit-breaker auto-cutoff, and mandatory stop-loss orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
