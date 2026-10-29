'use client';

import React, { useState } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { BreadcrumbSchema } from '@/components/public/StructuredData';
import { Mail, MessageSquare, Clock, MapPin, CheckCircle2, ShieldCheck, Send } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autotrader.trade';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Broker API Integration Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const breadcrumbs = [
    { name: 'Home', item: baseUrl },
    { name: 'Contact Support', item: `${baseUrl}/contact` },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      <PublicHeader />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <Mail className="w-3.5 h-3.5" />
              <span>Operations & Support Desk</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Contact Technical <span className="text-blue-600">Support</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Have questions regarding broker API integrations, tenant setup, or platform operations?
              Our dedicated engineering and compliance team is available to assist you.
            </p>
          </div>
        </section>

        {/* Contact Content & Form */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
              {/* Left Column: Direct Channels */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                    Direct Contact Channels
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Reach our technical desk directly during exchange trading hours.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Support Desk</span>
                      <a
                        href="mailto:support@autotrader.trade"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        support@autotrader.trade
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Operating Hours</span>
                      <span className="text-xs text-neutral-600">
                        08:30 AM – 06:00 PM IST (Mon – Fri, NSE Trading Days)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Compliance & Legal</span>
                      <a
                        href="mailto:compliance@autotrader.trade"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        compliance@autotrader.trade
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Ticket Submission Form */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs">
                {submitted ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">Message Received</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Thank you for contacting NIFTY Auto Trader support. A technical representative will respond to your registered email address within 1 business day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-neutral-900">Send an Inquiry</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 block mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Rohit Sharma"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Topic / Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Broker API Integration Inquiry">Broker API Integration Inquiry</option>
                        <option value="Platform Setup & Onboarding Assistance">Platform Setup & Onboarding Assistance</option>
                        <option value="Billing & Subscription Question">Billing & Subscription Question</option>
                        <option value="Regulatory & Compliance Question">Regulatory & Compliance Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe your question or technical issue..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
