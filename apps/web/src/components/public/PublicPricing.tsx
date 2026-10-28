'use client';

import React from 'react';
import { Check, ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const PublicPricing: React.FC = () => {
  const plans = [
    {
      id: 'FREE',
      name: 'Free Tier',
      price: '₹0',
      period: 'Forever free',
      description: 'Essential real-time market observation and paper trading for individual traders.',
      isPopular: false,
      isAvailable: true,
      buttonText: 'Get Started Free',
      buttonVariant: 'primary',
      features: [
        '1 Active Broker Connection',
        '1 Strategy Assignment',
        'Paper Trading & Real-Time Telemetry',
        '30-Day Trade History Retention',
        'Standard In-App Notifications',
        'Direct-to-Broker Authentication',
      ],
      availabilityNote: 'Available immediately upon registration',
    },
    {
      id: 'STARTER',
      name: 'Starter Trader',
      price: '₹999',
      period: 'per month',
      description: 'Designed for active traders seeking manual order routing and extended analytics.',
      isPopular: false,
      isAvailable: false,
      buttonText: 'Pre-Release Preview',
      buttonVariant: 'disabled',
      features: [
        '1 Active Broker Connection',
        '2 Strategy Assignments',
        'Manual Gated Order Execution',
        '90-Day Trade History Retention',
        'Webhook & Email Alerts',
        'Advanced Charges & Tax Breakdown',
      ],
      availabilityNote: 'Commercial payment gateway pending regulatory approval',
    },
    {
      id: 'PRO',
      name: 'Professional Trader',
      price: '₹2,499',
      period: 'per month',
      description: 'Full systematic automation with multi-broker routing and multi-leg risk controls.',
      isPopular: true,
      isAvailable: false,
      buttonText: 'Pre-Release Preview',
      buttonVariant: 'disabled',
      features: [
        'Up to 3 Broker Connections',
        '5 Active Strategy Assignments',
        'Automated Strategy Execution',
        '365-Day Trade History Retention',
        'Priority Webhook & Push Alerts',
        'Automated Loss Circuit Breakers',
      ],
      availabilityNote: 'Commercial payment gateway pending regulatory approval',
    },
    {
      id: 'ENTERPRISE',
      name: 'Prop & Enterprise',
      price: '₹9,999',
      period: 'per month',
      description: 'High-throughput prop trading with dedicated static IP egress and 5-year retention.',
      isPopular: false,
      isAvailable: false,
      buttonText: 'Contact for Inquiries',
      buttonVariant: 'outline',
      features: [
        'Up to 10 Broker Connections',
        '20 Active Strategy Assignments',
        'Dedicated Static Egress IP Egress',
        '5-Year SEBI Audit Log Retention',
        'Sub-Account Isolation Support',
        'Direct SLA & Integration Review',
      ],
      availabilityNote: 'Dedicated VPS deployment required for static IP whitelisting',
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Predictable SaaS Subscription Plans
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Published database-backed tiers. No percentage of AUM, no hidden commissions, and no profit sharing.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                plan.isPopular
                  ? 'bg-blue-50/20 border-blue-400 shadow-md ring-1 ring-blue-400'
                  : 'bg-white border-neutral-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 mb-4 h-10">{plan.description}</p>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">{plan.period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 py-4 border-t border-neutral-100 text-xs text-neutral-700">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button & Note */}
              <div className="pt-4 border-t border-neutral-100 mt-4 space-y-2">
                {plan.isAvailable ? (
                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-500 bg-neutral-100 cursor-not-allowed border border-neutral-200"
                  >
                    {plan.buttonText}
                  </button>
                )}

                <p className="text-[10px] text-neutral-500 text-center leading-tight">
                  {plan.availabilityNote}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Commercial Availability Notice */}
        <div className="mt-12 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 max-w-3xl mx-auto shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Commercial Subscription Status:</strong> In accordance with the release governance plan, live commercial checkout is locked while regulatory compliance approvals are verified. All registered users are granted full platform evaluation access on the Free Tier.
          </div>
        </div>
      </div>
    </section>
  );
};
