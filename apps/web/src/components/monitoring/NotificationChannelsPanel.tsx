'use client';

import React from 'react';
import type { NotificationChannelConfig, AlertDeliveryLog } from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';
import { Bell, Mail, Webhook, Send, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

interface NotificationChannelsPanelProps {
  channels?: NotificationChannelConfig[];
  deliveries?: AlertDeliveryLog[];
  isLoading?: boolean;
}

export const NotificationChannelsPanel: React.FC<NotificationChannelsPanelProps> = ({
  channels = [],
  deliveries = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[240px] animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
            Configurable Alert Channels & Dispatch Log
          </h3>
          <p className="text-xs text-neutral-500">
            Deduplicated notifications across Email, Webhooks, Telegram, and Slack
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Left: Active Channels */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2.5">
            Active Alert Channels ({channels.length})
          </span>

          <div className="space-y-2.5">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-600">
                    {ch.channelType === 'EMAIL' ? (
                      <Mail className="w-3.5 h-3.5" />
                    ) : (
                      <Webhook className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">{ch.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate max-w-[200px] block">
                      {ch.destination}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ch.isEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {ch.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Min: {ch.minSeverity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Delivery Logs & Deduplication Status */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2.5">
            Recent Delivery Audits & Deduplications
          </span>

          {deliveries.length === 0 ? (
            <div className="h-28 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
              No recent alert dispatches recorded.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {deliveries.slice(0, 5).map((log) => {
                const isDelivered = log.status === 'DELIVERED';
                const isDedup = log.status === 'DEDUPLICATED';

                return (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 flex items-center justify-between text-[11px] font-mono"
                  >
                    <div>
                      <span className="font-bold text-neutral-800 block">
                        {log.channelType} ({log.destination})
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {formatISTDateTime(log.deliveredAt)}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDedup
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
