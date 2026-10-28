'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useHealth, useSystemStatus, useSystemEvents } from '@/hooks/use-queries';
import { formatISTDateTime } from '@/lib/formatters';
import {
  Terminal,
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { SystemEventSeverity, SystemEvent } from '@autotrader/api-contracts';

export default function SystemPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const { data: health, isLoading: isHealthLoading, refetch: refetchHealth } = useHealth();
  const { data: status, isLoading: isStatusLoading, refetch: refetchStatus } = useSystemStatus();
  const { data: events, isLoading: isEventsLoading, refetch: refetchEvents } = useSystemEvents(100);

  const checks = health?.checks ?? {
    database: { status: 'down', lastCheckedAt: new Date().toISOString() },
    broker: { status: 'down', lastCheckedAt: new Date().toISOString() },
    worker: { status: 'down', lastCheckedAt: new Date().toISOString() },
    redis: { status: 'down', lastCheckedAt: new Date().toISOString() },
  };

  const filteredEvents = events?.filter((evt: SystemEvent) => {
    if (selectedSeverity === 'ALL') return true;
    return evt.severity === selectedSeverity;
  }) ?? [];

  const handleRefreshAll = () => {
    refetchHealth();
    refetchStatus();
    refetchEvents();
  };

  const formatUptime = (seconds: number = 0) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Diagnostics & Engine Audit Logs"
        subtitle="Subsystem health telemetry, background worker heartbeat, and immutable event stream"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'System & Logs' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/notifications"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              Watchdog & Alerts
            </a>
            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Refresh Diagnostics
            </button>
          </div>
        }
      />

      {/* Subsystem Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" /> PostgreSQL DB
            </span>
            <StatusIndicator
              status={checks.database.status === 'up' ? 'connected' : 'error'}
              size="sm"
              label={checks.database.status.toUpperCase()}
            />
          </div>
          <div className="text-sm font-semibold text-neutral-800">
            Latency: <span className="tabular-nums font-semibold">{checks.database.latencyMs ?? '—'} ms</span>
          </div>
          <div className="text-[11px] text-neutral-400 tabular-nums">
            Checked: {formatISTDateTime(checks.database.lastCheckedAt, { timeOnly: true })}
          </div>
        </div>

        {/* Broker Gateway */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" /> Broker Gateway
            </span>
            <StatusIndicator
              status={checks.broker.status === 'up' ? 'connected' : 'disconnected'}
              size="sm"
              label={checks.broker.status.toUpperCase()}
            />
          </div>
          <div className="text-sm font-semibold text-neutral-800">
            Latency: <span className="tabular-nums font-semibold">{checks.broker.latencyMs ?? '—'} ms</span>
          </div>
          <div className="text-[11px] text-neutral-400 tabular-nums">
            Checked: {formatISTDateTime(checks.broker.lastCheckedAt, { timeOnly: true })}
          </div>
        </div>

        {/* Trading Worker */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" /> Trading Engine
            </span>
            <StatusIndicator
              status={checks.worker.status === 'up' ? 'running' : 'stopped'}
              size="sm"
              label={checks.worker.status.toUpperCase()}
            />
          </div>
          <div className="text-sm font-semibold text-neutral-800">
            Heartbeat: <span className="tabular-nums font-semibold">{status?.workerHeartbeat ? formatISTDateTime(status.workerHeartbeat, { timeOnly: true }) : '—'}</span>
          </div>
          <div className="text-[11px] text-neutral-400 tabular-nums">
            Checked: {formatISTDateTime(checks.worker.lastCheckedAt, { timeOnly: true })}
          </div>
        </div>

        {/* Redis Cache */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-600" /> Redis Cache
            </span>
            <StatusIndicator
              status={checks.redis?.status === 'up' ? 'connected' : 'disconnected'}
              size="sm"
              label={checks.redis?.status?.toUpperCase() ?? 'N/A'}
            />
          </div>
          <div className="text-sm font-semibold text-neutral-800">
            Uptime: <span className="tabular-nums font-semibold">{formatUptime(health?.uptime)}</span>
          </div>
          <div className="text-[11px] text-neutral-400 tabular-nums">
            Release: v{health?.version ?? '3.0.0'}
          </div>
        </div>
      </div>

      {/* Engine State Transitions */}
      {status?.lastStateChange && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Latest Engine State Transition
              </span>
              <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                Transitioned to <span className="font-mono text-blue-600 font-bold">{status.lastStateChange.state}</span>: {status.lastStateChange.reason}
              </p>
            </div>
          </div>
          <span className="text-xs tabular-nums text-neutral-400 shrink-0">
            {formatISTDateTime(status.lastStateChange.timestamp)}
          </span>
        </div>
      )}

      {/* System Audit Events Stream */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Immutable System & Risk Event Stream
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Chronological log of engine events, order status transitions, and health anomalies.
            </p>
          </div>

          {/* Severity filter */}
          <div className="flex items-center rounded-lg bg-neutral-100 p-1 text-xs font-semibold">
            {['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedSeverity === sev
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-neutral-100 text-xs">
            {filteredEvents.map((evt: SystemEvent) => {
              const sevBadge = {
                CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
                ERROR: 'bg-rose-50 text-rose-700 border-rose-200',
                WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
                INFO: 'bg-blue-50 text-blue-700 border-blue-200',
              }[evt.severity as SystemEventSeverity] || 'bg-neutral-100 text-neutral-700 border-neutral-200';

              return (
                <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-neutral-50/60 transition-colors px-2 rounded-lg">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded border font-semibold text-[10px] shrink-0 uppercase ${sevBadge}`}>
                      {evt.severity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-neutral-900 font-sans text-xs font-medium break-words">
                        {evt.message}
                      </p>
                      <span className="text-[11px] text-neutral-400">
                        [{evt.category}]
                      </span>
                    </div>
                  </div>
                  <span className="text-neutral-400 text-[11px] shrink-0 tabular-nums self-end sm:self-auto">
                    {formatISTDateTime(evt.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-500 text-sm">
            No system events matching the selected filter ({selectedSeverity}).
          </div>
        )}
      </div>
    </div>
  );
}
