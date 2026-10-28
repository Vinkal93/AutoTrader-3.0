'use client';

import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  ExternalLink,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';
import Link from 'next/link';

type BrokerCardStatus =
  | 'Supported'
  | 'Connection available'
  | 'Approval pending'
  | 'Coming soon'
  | 'Temporarily unavailable';

interface BrokerInfo {
  id: string;
  name: string;
  apiVersion: string;
  authModel: string;
  status: BrokerCardStatus;
  statusColor: string;
  requiresStaticIp: boolean;
  rateLimit: string;
  orderTypes: string;
  description: string;
}

export const PublicBrokers: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

  const brokers: BrokerInfo[] = [
    {
      id: 'KOTAK_NEO',
      name: 'Kotak Neo',
      apiVersion: 'Trade API v2',
      authModel: 'TOTP + MPIN / Password',
      status: 'Supported',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      requiresStaticIp: true,
      rateLimit: '10 req / sec',
      orderTypes: 'LIMIT, SL-L (Stoploss Limit)',
      description:
        'Fully integrated production adapter with complete Tradebook reconciliation, real-time market ticks, and dedicated static-IP routing.',
    },
    {
      id: 'ZERODHA_KITE',
      name: 'Zerodha Kite',
      apiVersion: 'Kite Connect v3',
      authModel: 'Broker-Hosted OAuth 2.0',
      status: 'Connection available',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      requiresStaticIp: false,
      rateLimit: '10 req / sec',
      orderTypes: 'LIMIT, SL, GTT',
      description:
        'Standard OAuth 2.0 authorization via official Kite login portal. Supports daily 06:00 AM token cycles and multi-tenant webhook postbacks.',
    },
    {
      id: 'UPSTOX',
      name: 'Upstox Pro',
      apiVersion: 'Upstox API v2',
      authModel: 'OAuth 2.0 (PKCE)',
      status: 'Connection available',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      requiresStaticIp: false,
      rateLimit: '25 req / sec',
      orderTypes: 'LIMIT, SL-L',
      description:
        'High-capacity options routing via Protobuf WebSocket streams and official Upstox Pro API v2 authentication.',
    },
    {
      id: 'ANGEL_ONE',
      name: 'Angel One',
      apiVersion: 'SmartAPI v2',
      authModel: 'TOTP + MPIN',
      status: 'Approval pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      requiresStaticIp: true,
      rateLimit: '10 req / sec',
      orderTypes: 'LIMIT, STOPLOSS_LIMIT',
      description:
        'SmartAPI integration currently undergoing static IP whitelisting verification and multi-tenant compliance review.',
    },
    {
      id: 'DHAN',
      name: 'DhanHQ',
      apiVersion: 'DhanHQ API v2',
      authModel: 'Access Token & Secret',
      status: 'Approval pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      requiresStaticIp: true,
      rateLimit: '10 req / sec',
      orderTypes: 'LIMIT, SL',
      description:
        'Direct DhanHQ API v2 connector. Pre-flight static IP whitelist testing and webhook reconciliation review in progress.',
    },
    {
      id: 'FYERS',
      name: 'Fyers',
      apiVersion: 'Fyers API v3',
      authModel: 'OAuth 2.0 Flow',
      status: 'Coming soon',
      statusColor: 'bg-neutral-100 text-neutral-600 border-neutral-200',
      requiresStaticIp: false,
      rateLimit: '10 req / sec',
      orderTypes: 'LIMIT, SL-L',
      description:
        'Scheduled in upcoming architectural milestone. Will support Fyers API v3 OAuth and binary Protobuf data streams.',
    },
  ];

  const filteredBrokers = brokers.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'Supported' || b.status === 'Connection available';
    if (filter === 'PENDING') return b.status === 'Approval pending' || b.status === 'Coming soon';
    return true;
  });

  return (
    <section id="brokers" className="py-16 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200/60">
            <Layers className="w-3.5 h-3.5" />
            Canonical Broker Registry
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Supported Broker Gateways
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            We adhere strictly to Rule 19 & Rule 24. We publish genuine, verified integration states and never misrepresent unapproved connections as supported.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              filter === 'ALL'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            All Brokers ({brokers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Live & Available (3)
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            In Verification / Roadmap (3)
          </button>
        </div>

        {/* Broker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrokers.map((broker) => (
            <div
              key={broker.id}
              className="p-6 rounded-2xl bg-neutral-50/50 border border-neutral-200/80 hover:border-neutral-300 hover:bg-white transition-all duration-200 flex flex-col justify-between shadow-2xs group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {broker.name}
                    </h3>
                    <span className="text-xs text-neutral-500 font-mono">
                      {broker.apiVersion}
                    </span>
                  </div>

                  {/* Genuine State Badge */}
                  <span
                    className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border tracking-wide whitespace-nowrap ${broker.statusColor}`}
                  >
                    {broker.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  {broker.description}
                </p>

                {/* Specs List */}
                <div className="space-y-2 py-3 border-t border-neutral-200/60 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Authentication:</span>
                    <span className="font-medium text-neutral-800 text-right">{broker.authModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Static IP Egress:</span>
                    <span className="font-medium text-neutral-800">
                      {broker.requiresStaticIp ? 'Mandatory (Dedicated)' : 'Standard HTTPS'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Order Rate Limit:</span>
                    <span className="font-medium text-neutral-800 tabular-nums">{broker.rateLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Supported Orders:</span>
                    <span className="font-medium text-neutral-800">{broker.orderTypes}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-2 border-t border-neutral-200/60 flex items-center justify-between">
                <Link
                  href="/broker"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  Configure Connection →
                </Link>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  NSE / NFO Options
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory Note */}
        <div className="mt-10 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 text-center max-w-3xl mx-auto">
          <strong>Static IP Architecture Notice:</strong> For brokers requiring static IP whitelisting (such as Kotak Neo and Dhan), order egress is bound to verified, dedicated network IP addresses adhering to Rule 20.
        </div>
      </div>
    </section>
  );
};
