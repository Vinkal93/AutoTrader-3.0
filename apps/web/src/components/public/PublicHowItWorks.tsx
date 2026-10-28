'use client';

import React from 'react';
import { UserPlus, Link2, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const PublicHowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Your Account',
      description:
        'Register your trader profile in seconds. Select your default trading preferences, risk appetite classification, and notification channels.',
      icon: UserPlus,
      highlight: 'Instant registration',
    },
    {
      step: '02',
      title: 'Connect an Eligible Broker',
      description:
        'Authorize your Kotak Neo, Zerodha Kite, Upstox, Angel One, or Dhan account via official broker OAuth. Your credentials remain encrypted with AES-256-GCM.',
      icon: Link2,
      highlight: 'Direct broker OAuth',
    },
    {
      step: '03',
      title: 'Review Account Telemetry',
      description:
        'Verify your live available margin, Demat positions, and streaming NIFTY options chain directly from the exchange without synthetic delays.',
      icon: Eye,
      highlight: 'Real-time telemetry',
    },
    {
      step: '04',
      title: 'Configure Permitted Controls',
      description:
        'Set hard risk limits: maximum daily drawdown, per-order lot size ceilings, and trailing stop-loss triggers before initiating automated strategy runs.',
      icon: ShieldCheck,
      highlight: 'Strict risk safeguards',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simple & Transparent
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Get up and running in 4 straightforward steps. Retain full authority over your broker account, funds, and execution rules.
          </p>
        </div>

        {/* 4 Progressive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-neutral-300 group-hover:text-blue-600 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                    {item.highlight}
                  </span>
                  <span className="text-xs text-neutral-400">Step {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Onboarding Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Your Setup Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
