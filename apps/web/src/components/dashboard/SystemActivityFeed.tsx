'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystemEvents } from '@/hooks/use-queries';
import { formatISTDateTime } from '@/lib/formatters';
import {
  Terminal,
  AlertTriangle,
  Info,
  AlertOctagon,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import type { SystemEventSeverity } from '@autotrader/api-contracts';

export const SystemActivityFeed: React.FC<{ className?: string }> = ({ className }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const { data: events, isLoading } = useSystemEvents(50);

  const filteredEvents = (events ?? []).filter((e) => {
    if (severityFilter === 'ALL') return true;
    return e.severity === severityFilter;
  });

  const getSeverityIcon = (sev: SystemEventSeverity | string) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col', className)}>
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">System Activity</h3>
            <p className="text-xs text-neutral-500">Real-time audit log of engine & broker events</p>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
          {['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-all text-[11px]',
                severityFilter === sev
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 mt-3 space-y-2 overflow-y-auto max-h-[320px] pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading audit stream...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No system events matching the selected filter.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-200/60 hover:bg-neutral-50 transition-colors"
            >
              {getSeverityIcon(evt.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-neutral-800 tracking-tight">
                    {evt.category}
                  </span>
                  <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
                    {formatISTDateTime(evt.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug break-words">
                  {evt.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
