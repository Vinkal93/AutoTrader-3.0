'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const PublicFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How does broker account connection work?',
      answer:
        'You connect your trading account via official broker-hosted OAuth 2.0 (for Zerodha Kite, Upstox, Dhan, and Fyers) or through encrypted API credentials (for Kotak Neo and Angel One). All tokens are protected using AES-256-GCM envelope encryption. We never request, capture, or store your trading passwords, MPINs, or TOTP seeds in plain text.',
    },
    {
      question: 'Does NIFTY Auto Trader 3.0 hold or manage my trading funds?',
      answer:
        'No, absolutely not. The platform is strictly a software automation tool and has zero custody of capital. 100% of your trading capital, collateral, and securities remain inside your registered Demat and trading account with your SEBI-registered broker.',
    },
    {
      question: 'What happens if my broker connection disconnects during market hours?',
      answer:
        'If the WebSocket market feed lags by more than 30 seconds or the broker gateway session expires, the execution engine immediately transitions to NOT_CONNECTED state. It halts new entry orders, locks active automation runs, and triggers instant alerts. When reconnected, a strict reconciliation cycle runs to audit existing broker positions before any actions can be resumed.',
    },
    {
      question: 'Which features require explicit compliance approval?',
      answer:
        'While paper trading, market telemetry, and analytics are immediately accessible, automated LIVE real-money order routing requires completing the Retail Algo regulatory declaration, acknowledging derivatives risk, and establishing verified loss limits. LIVE execution is currently phase-locked across the platform until full regulatory sign-off.',
    },
    {
      question: 'How do subscriptions and plan entitlements work?',
      answer:
        'Subscriptions are structured into transparent monthly tiers (Free, Starter, Pro, and Enterprise) defined by quota limits: number of simultaneous broker accounts, active strategy assignments, and historical audit retention. Commercial billing will be activated following production compliance approval.',
    },
    {
      question: 'Are trading profits or positive returns guaranteed?',
      answer:
        'No. We make absolutely zero claims of guaranteed profits, assured returns, or fail-safe execution. Trading index options involves significant market volatility and a high risk of total capital loss. The platform provides software tools for systematic execution and automated risk discipline, but market outcomes can never be guaranteed.',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Clear Answers to Essential Questions
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Honest answers regarding security, broker connectivity, fund safety, and regulatory compliance.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs transition-all duration-200 hover:border-neutral-300"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base font-bold text-neutral-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-5 sm:px-6 pb-6 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 animate-in fade-in duration-150"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
