'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useSystemStatus,
  useBrokerConnection,
  usePositions,
  useOrders,
  useTransitionEngineState,
} from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { EngineState, TradingMode, BrokerConnectionState } from '@autotrader/api-contracts';
import { formatISTTime } from '@/lib/formatters';
import {
  Activity,
  PauseCircle,
  PlayCircle,
  Cpu,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const AutomationMonitorCard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: systemStatus, isLoading: statusLoading } = useSystemStatus();
  const { data: broker, isLoading: brokerLoading } = useBrokerConnection();
  const { data: positions } = usePositions();
  const { data: orders } = useOrders();
  const transitionMutation = useTransitionEngineState();

  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const tradingMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const isPaused = engineState === EngineState.PAUSED;
  const isRunning = engineState === EngineState.RUNNING || engineState === EngineState.READY;

  const positionCount = positions?.length ?? 0;
  const pendingOrdersCount = orders?.filter((o) => o.status === 'PENDING' || o.status === 'OPEN').length ?? 0;

  const handleTogglePause = () => {
    if (isPaused) {
      transitionMutation.mutate({
        state: EngineState.READY,
        reason: 'Operator resumed automation from dashboard',
      });
    } else {
      transitionMutation.mutate({
        state: EngineState.PAUSED,
        reason: 'Operator paused automation from dashboard',
      });
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col justify-between', className)}>
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
              <Activity className="w-4 h-4 text-neutral-800" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Automation Monitor</h3>
              <p className="text-xs text-neutral-500">Autonomous worker daemon telemetry</p>
            </div>
          </div>

          {/* Pause / Resume secured control */}
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={transitionMutation.isPending || engineState === EngineState.STOPPED}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-2xs disabled:opacity-50',
              isPaused
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
            )}
          >
            {isPaused ? (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                Resume Bot
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-neutral-600" />
                Pause Bot
              </>
            )}
          </button>
        </div>

        {/* Telemetry Status Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Worker State</span>
            <StatusIndicator status={engineState} size="sm" showLabel />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Broker Session</span>
            <StatusIndicator status={broker?.state ?? BrokerConnectionState.NOT_CONFIGURED} size="sm" showLabel />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Open Positions</span>
            <span className="font-semibold text-neutral-800 font-mono text-sm">
              {positionCount} contracts
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Pending Orders</span>
            <span className="font-semibold text-neutral-800 font-mono text-sm">
              {pendingOrdersCount} orders
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Market Feed (WebSocket)</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-700">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  broker?.marketFeedStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-neutral-300'
                )}
              />
              {broker?.marketFeedStatus ?? 'DISCONNECTED'}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-medium">Order Feed (WebSocket)</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-700">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  broker?.orderFeedStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-neutral-300'
                )}
              />
              {broker?.orderFeedStatus ?? 'DISCONNECTED'}
            </div>
          </div>
        </div>
      </div>

      {/* Heartbeat & Sync Diagnostics Footer */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col gap-1.5 text-[11px] text-neutral-500 font-mono">
        <div className="flex justify-between items-center">
          <span className="font-sans text-neutral-400">Worker Heartbeat:</span>
          <span className="text-neutral-700 font-semibold">
            {systemStatus?.workerHeartbeat ? formatISTTime(systemStatus.workerHeartbeat) : 'Awaiting worker'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-sans text-neutral-400">Last Engine Reason:</span>
          <span className="text-neutral-700 truncate max-w-[200px]" title={systemStatus?.lastStateChange.reason}>
            {systemStatus?.lastStateChange.reason ?? 'Bootstrap'}
          </span>
        </div>
      </div>
    </div>
  );
};
