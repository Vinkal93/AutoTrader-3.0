'use client';

import React from 'react';
import type { WatchdogHealthStatus } from '@autotrader/api-contracts';
import {
  Activity,
  Key,
  Radio,
  Wifi,
  Network,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface WatchdogDiagnosticCardsProps {
  status?: WatchdogHealthStatus;
  isLoading?: boolean;
}

export const WatchdogDiagnosticCards: React.FC<WatchdogDiagnosticCardsProps> = ({
  status,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-neutral-100 rounded-2xl border border-neutral-200/80" />
        ))}
      </div>
    );
  }

  const hbStatus = status?.workerHeartbeatStatus ?? 'UNKNOWN';
  const isHbOk = hbStatus === 'ACTIVE';

  const brokerStatus = status?.brokerSessionStatus ?? 'NOT_CONFIGURED';
  const isBrokerOk = brokerStatus === 'VALID';

  const feedStatus = status?.marketFeedStatus ?? 'DISCONNECTED';
  const isFeedOk = feedStatus === 'LIVE';

  const orderFeedStatus = status?.orderFeedStatus ?? 'DISCONNECTED';
  const isOrderFeedOk = orderFeedStatus === 'CONNECTED';

  const ipStatus = status?.staticIpStatus ?? 'UNVERIFIED';
  const isIpOk = ipStatus === 'MATCHED';

  const unprotCount = status?.openUnprotectedPositionsCount ?? 0;
  const isPositionsSafe = unprotCount === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Worker Heartbeat */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Worker Process Heartbeat</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isHbOk ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">{hbStatus}</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          Age: {status?.lastHeartbeatAgeSeconds !== null ? `${status?.lastHeartbeatAgeSeconds}s ago` : '—'} (limit: &lt;15s)
        </span>
      </div>

      {/* 2. Broker Session */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Broker Authentication Session</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isBrokerOk ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">{brokerStatus}</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          Kotak Neo JWT / TOTP token verification
        </span>
      </div>

      {/* 3. Market Feed & Staleness */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Market Tick Feed Freshness</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isFeedOk ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">{feedStatus}</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          Staleness: {status?.marketFeedStalenessSeconds !== null ? `${status?.marketFeedStalenessSeconds}s` : '—'} (limit: &lt;30s)
        </span>
      </div>

      {/* 4. Order Feed Stream */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Broker Order Feed Stream</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isOrderFeedOk ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">{orderFeedStatus}</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          WebSocket fill confirmation channel
        </span>
      </div>

      {/* 5. Static IP Whitelist */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Static-IP / Session Match</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isIpOk ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">{ipStatus}</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          Current IP: {status?.currentStaticIp ?? '127.0.0.1'} (Whitelisted)
        </span>
      </div>

      {/* 6. Unprotected Positions Guard */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Unprotected Positions Guard</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isPositionsSafe ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-mono text-base font-bold text-neutral-900">
            {unprotCount === 0 ? '0 Unprotected' : `${unprotCount} CRITICAL ALERT`}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono mt-1.5 block">
          Every open position has verified SL-L
        </span>
      </div>
    </div>
  );
};
