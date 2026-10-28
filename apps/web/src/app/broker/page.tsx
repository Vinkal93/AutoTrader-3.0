'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useBrokerConnection, useReconnectBroker } from '@/hooks/use-queries';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';
import {
  Server,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Key,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function BrokerPage() {
  const { data: broker, isLoading, refetch } = useBrokerConnection();
  const reconnectMutation = useReconnectBroker();

  const state = broker?.state ?? BrokerConnectionState.NOT_CONFIGURED;
  const isConnected = state === BrokerConnectionState.CONNECTED;
  const isNotConfigured = state === BrokerConnectionState.NOT_CONFIGURED;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broker Connection & Infrastructure"
        subtitle="Kotak Neo API session credentials, static IP compliance, and WebSocket feed health"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Broker Connection' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => reconnectMutation.mutate()}
            disabled={reconnectMutation.isPending || isNotConfigured}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
            {reconnectMutation.isPending ? 'Reconnecting Session...' : 'Reconnect Session'}
          </button>
        }
      />

      {/* Connection Overview Banner */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-neutral-900">
                  {broker?.brokerName ?? 'Kotak Neo'} API
                </h3>
                <StatusIndicator status={state} size="md" />
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Automated order routing and real-time tick streaming broker gateway.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
              <span className="text-neutral-500 block">Session Expiry</span>
              <span className="tabular-nums font-semibold text-neutral-800">
                {broker?.sessionExpiresAt ? formatISTDateTime(broker.sessionExpiresAt) : '—'}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
              <span className="text-neutral-500 block">Connected At</span>
              <span className="tabular-nums font-semibold text-neutral-800">
                {broker?.connectedAt ? formatISTDateTime(broker.connectedAt) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Feed & Component Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Market Feed */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-neutral-500" /> Market Feed
              </span>
              <StatusIndicator
                status={broker?.marketFeedStatus === 'CONNECTED' ? 'connected' : 'disconnected'}
                size="sm"
                label={broker?.marketFeedStatus ?? 'DISCONNECTED'}
              />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Live NIFTY 50 spot and option chain websocket tick feed.
            </p>
          </div>

          {/* Order Feed */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-neutral-500" /> Order Feed
              </span>
              <StatusIndicator
                status={broker?.orderFeedStatus === 'CONNECTED' ? 'connected' : 'disconnected'}
                size="sm"
                label={broker?.orderFeedStatus ?? 'DISCONNECTED'}
              />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Order status update stream and execution acknowledgment socket.
            </p>
          </div>

          {/* Static IP Whitelist Status */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-neutral-500" /> Static IP Whitelist
              </span>
              {broker?.staticIpCompliant === true ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compliant
                </span>
              ) : broker?.staticIpCompliant === false ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Failed
                </span>
              ) : (
                <span className="text-xs font-medium text-neutral-500 bg-neutral-200/60 px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              SEBI compliance mandates API order dispatch only from authorized static IP.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration & Setup Guide */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Credentials & Environment Checklist
        </h3>

        <div className="divide-y divide-neutral-100 text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-800">Consumer Key & Secret</span>
              <p className="text-xs text-neutral-500">KOTAK_CONSUMER_KEY, KOTAK_CONSUMER_SECRET</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-700">
              {isNotConfigured ? 'Missing in .env' : 'Configured'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-800">Trading Mobile & MPIN / Password</span>
              <p className="text-xs text-neutral-500">KOTAK_MOBILE_NUMBER, KOTAK_PASSWORD</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-700">
              {isNotConfigured ? 'Missing in .env' : 'Configured'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-800">Time-based OTP (TOTP) Secret</span>
              <p className="text-xs text-neutral-500">KOTAK_TOTP_KEY for automated 2FA login</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-700">
              {isNotConfigured ? 'Missing in .env' : 'Configured'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-800">Dedicated Static Public IP</span>
              <p className="text-xs text-neutral-500">Server outbound IPv4 whitelisted on Kotak Neo developer portal</p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-100 text-neutral-700">
              STATIC_IP_ENABLED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <Lock className="w-4 h-4 text-amber-700" />
            Security & Zero Credential Exposure
          </div>
          <p className="text-amber-800 leading-relaxed">
            API credentials are never entered via browser or stored client-side. All secret keys remain encrypted on the local server in <code>.env</code> and are accessed solely by the backend Python auth daemon.
          </p>
        </div>
      </div>
    </div>
  );
}
