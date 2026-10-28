import React from 'react';
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import {
  type BrokerConnectionResponse,
  type HealthResponse,
  BrokerConnectionState,
} from '@autotrader/api-contracts';
import { ShieldCheck, ShieldAlert, RefreshCw, Server, Activity, Database, Radio } from 'lucide-react';

export interface ConnectionStatusProps {
  broker?: BrokerConnectionResponse | null;
  health?: HealthResponse | null;
  onReconnect?: () => void;
  isReconnecting?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  broker,
  health,
  onReconnect,
  isReconnecting = false,
  className,
}) => {
  const brokerState = broker?.state ?? BrokerConnectionState.NOT_CONFIGURED;
  const isBrokerConnected = brokerState === BrokerConnectionState.CONNECTED;
  const isNotConfigured = brokerState === BrokerConnectionState.NOT_CONFIGURED;

  const dbStatus = health?.checks?.database?.status ?? 'down';
  const workerStatus = health?.checks?.worker?.status ?? 'down';

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-100 gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Infrastructure & Connection Status
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time feed, broker session, static IP, and backend system health
          </p>
        </div>

        {onReconnect && !isNotConfigured && (
          <button
            type="button"
            onClick={onReconnect}
            disabled={isReconnecting}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isReconnecting && 'animate-spin')} />
            {isReconnecting ? 'Reconnecting...' : 'Reconnect Feeds'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {/* Broker Connection */}
        <div className="p-3 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Server className="w-3.5 h-3.5" /> Broker API
            </span>
          </div>
          <StatusIndicator
            status={brokerState}
            size="sm"
            label={isNotConfigured ? 'Not Configured' : undefined}
          />
        </div>

        {/* Market Data Feed */}
        <div className="p-3 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Radio className="w-3.5 h-3.5" /> Market Feed
            </span>
          </div>
          <StatusIndicator
            status={broker?.marketFeedStatus === 'CONNECTED' ? 'connected' : 'disconnected'}
            size="sm"
            label={broker?.marketFeedStatus ?? 'DISCONNECTED'}
          />
        </div>

        {/* Database Health */}
        <div className="p-3 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Database className="w-3.5 h-3.5" /> Database
            </span>
          </div>
          <StatusIndicator
            status={dbStatus === 'up' ? 'connected' : 'error'}
            size="sm"
            label={dbStatus === 'up' ? 'HEALTHY' : 'DOWN'}
          />
        </div>

        {/* Static IP / Compliance Check */}
        <div className="p-3 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Static IP Check
            </span>
          </div>
          {broker?.staticIpCompliant === true ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Compliant
            </span>
          ) : broker?.staticIpCompliant === false ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> Non-Compliant
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
              Unverified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
