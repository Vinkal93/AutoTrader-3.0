'use client';

import React, { useState } from 'react';
import type { SystemIncident } from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';

interface IncidentManagementStreamProps {
  incidents?: SystemIncident[];
  isLoading?: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string, notes: string) => void;
}

export const IncidentManagementStream: React.FC<IncidentManagementStreamProps> = ({
  incidents = [],
  isLoading,
  onAcknowledge,
  onResolve,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [search, setSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[300px] animate-pulse" />
    );
  }

  const filtered = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inc.title.toLowerCase().includes(q) && !inc.incidentType.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleConfirmResolve = (id: string) => {
    onResolve(id, resolveNotes || 'Operator verified resolved');
    setResolvingId(null);
    setResolveNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">System Incident Management Stream</h3>
            <span className="text-[10px] tabular-nums font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {filtered.length} incidents
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable audit record of watchdog anomalies, safety escalations, and resolution runbooks
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500 w-40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['ALL', 'CRITICAL', 'WARNING'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  severityFilter === sev
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {filtered.length === 0 ? (
        <div className="h-36 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1.5" />
          <h4 className="text-xs font-bold text-neutral-800">No Incidents Recorded</h4>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            System running within verified safety thresholds with zero unhandled alarms.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 mt-2">
          {filtered.map((inc) => {
            const isCrit = inc.severity === 'CRITICAL';
            const isWarn = inc.severity === 'WARNING';
            const isActive = inc.status === 'ACTIVE';
            const isAck = inc.status === 'ACKNOWLEDGED';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div key={inc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCrit
                        ? 'bg-rose-100 text-rose-700'
                        : isWarn
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCrit ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-neutral-900">{inc.title}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isCrit
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isWarn
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-rose-600 text-white'
                            : isAck
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                      <span>Type: <code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded text-neutral-700">{inc.incidentType}</code></span>
                      <span>•</span>
                      <span className="tabular-nums">Triggered: {formatISTDateTime(inc.triggeredAt)}</span>
                    </div>

                    {inc.details && Object.keys(inc.details).length > 0 && (
                      <pre className="mt-2 text-[10px] bg-neutral-50 border border-neutral-200/80 p-2 rounded-lg text-neutral-700 font-mono overflow-x-auto max-w-xl">
                        {JSON.stringify(inc.details, null, 2)}
                      </pre>
                    )}

                    {inc.resolutionNotes && (
                      <p className="mt-1.5 text-xs text-emerald-700 font-medium">
                        Resolution Note: {inc.resolutionNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Incident Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => onAcknowledge(inc.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!isResolved && (
                    <div>
                      {resolvingId === inc.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Resolution notes..."
                            value={resolveNotes}
                            onChange={(e) => setResolveNotes(e.target.value)}
                            className="px-2 py-0.5 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-blue-500 w-40"
                          />
                          <button
                            type="button"
                            onClick={() => handleConfirmResolve(inc.id)}
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setResolvingId(null)}
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setResolvingId(inc.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
