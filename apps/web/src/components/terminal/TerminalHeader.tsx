'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  useSystemStatus,
  useBrokerConnections,
  useNiftyQuote,
  useSetTradingMode,
  useTransitionEngineState,
  useEmergencyExit,
  useReconcileOrders,
} from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TradingMode, EngineState, BrokerConnectionState } from '@autotrader/api-contracts';
import {
  Lock,
  Sun,
  Moon,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
  Building2,
  ChevronDown,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency } from '@/lib/formatters';

export const TerminalHeader: React.FC = () => {
  const { data: systemStatus } = useSystemStatus();
  const { data: brokerConnections } = useBrokerConnections();
  const { data: quote } = useNiftyQuote();
  const { theme, toggleTheme, activeBrokerConnectionId, setActiveBrokerConnectionId } = useUIStore();

  const setTradingMode = useSetTradingMode();
  const transitionState = useTransitionEngineState();
  const emergencyExit = useEmergencyExit();
  const reconcileOrders = useReconcileOrders();

  const [confirmEmergencyOpen, setConfirmEmergencyOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [reconcileSuccess, setReconcileSuccess] = useState(false);

  const currentMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const marketStatus = systemStatus?.marketStatus ?? 'UNKNOWN';

  // Active broker connection resolution
  const connections = brokerConnections ?? [];
  const activeConnection =
    connections.find((c) => c.id === activeBrokerConnectionId) ??
    connections[0] ??
    null;

  const brokerState = activeConnection?.state ?? BrokerConnectionState.NOT_CONFIGURED;
  const isBrokerConnected = brokerState === BrokerConnectionState.CONNECTED;
  const isEngineRunning = engineState === EngineState.RUNNING;
  const isPaused = engineState === EngineState.PAUSED;

  const handleTogglePause = () => {
    if (isEngineRunning) {
      transitionState.mutate({ state: EngineState.PAUSED, reason: 'Operator requested pause from Terminal' });
    } else if (isPaused) {
      transitionState.mutate({ state: EngineState.RUNNING, reason: 'Operator requested resume from Terminal' });
    }
  };

  const handleEmergencyExit = () => {
    emergencyExit.mutate();
    setConfirmEmergencyOpen(false);
  };

  const handleReconcile = () => {
    reconcileOrders.mutate(undefined, {
      onSuccess: () => {
        setReconcileSuccess(true);
        setTimeout(() => setReconcileSuccess(false), 3000);
      },
    });
  };

  return (
    <div className="bg-white border-b border-neutral-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20 shadow-2xs">
      {/* Left: NIFTY Quote + Market State + Broker Account Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* NIFTY 50 Quote */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight text-neutral-900">NIFTY 50</span>
          {quote ? (
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-base font-bold text-neutral-900 tracking-tight">
                {formatCurrency(quote.lastPrice, { fractionDigits: 2 })}
              </span>
              <span
                className={cn(
                  'flex items-center text-xs font-semibold px-1.5 py-0.5 rounded',
                  quote.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}
              >
                {quote.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {quote.change >= 0 ? '+' : ''}
                {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}
                {quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 font-medium italic">Market Feed Offline</span>
          )}
        </div>

        {/* Market Status Badge */}
        <span
          className={cn(
            'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border',
            marketStatus === 'OPEN'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
          )}
        >
          {marketStatus}
        </span>

        {/* Broker Account Selector Dropdown (Task 1) */}
        <div className="relative pl-3 border-l border-neutral-200">
          {connections.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 transition-colors"
                title="Switch active broker trading account"
              >
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-bold text-neutral-900">
                  {activeConnection?.alias || activeConnection?.providerId}
                </span>
                {activeConnection?.accountId && (
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-200/60 px-1 py-0.2 rounded">
                    {activeConnection.accountId}
                  </span>
                )}
                <StatusIndicator status={brokerState} size="sm" />
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 z-30 space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                    Connected Broker Accounts
                  </div>
                  {connections.map((c) => {
                    const isSelected = c.id === activeConnection?.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveBrokerConnectionId(c.id);
                          setAccountDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors',
                          isSelected && 'bg-blue-50/60 font-semibold text-blue-900'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <StatusIndicator status={c.state} size="sm" />
                          <div>
                            <div className="font-medium text-neutral-900">{c.alias}</div>
                            <div className="text-[10px] text-neutral-500">
                              {c.providerId} • {c.accountId ?? 'No Client ID'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-neutral-100 pt-1 px-3 pb-1">
                    <Link
                      href="/brokers"
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      Manage broker connections →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/brokers"
              className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Connect Broker Account
            </Link>
          )}
        </div>
      </div>

      {/* Right Controls: Worker State, Mode Switcher, Reconcile, Emergency Exit */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Reconcile Orders Button */}
        <button
          type="button"
          onClick={handleReconcile}
          disabled={reconcileOrders.isPending}
          className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
          title="Reconcile broker orders and positions with database state"
        >
          <RefreshCw className={cn('w-3 h-3 text-neutral-500', reconcileOrders.isPending && 'animate-spin')} />
          <span>{reconcileSuccess ? 'Reconciled' : 'Reconcile'}</span>
        </button>

        {/* Engine State Indicator & Toggle */}
        <div className="flex items-center gap-1.5">
          <StatusIndicator status={engineState} size="sm" />
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={!isBrokerConnected || (engineState !== EngineState.RUNNING && engineState !== EngineState.PAUSED)}
            className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEngineRunning ? (
              <>
                <Pause className="w-3 h-3 text-amber-600" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-600" /> Resume
              </>
            )}
          </button>
        </div>

        {/* Mode Selector (OFF / PAPER / LIVE locked) */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTradingMode.mutate(TradingMode.OFF)}
            className={cn(
              'px-2 py-0.5 rounded-md transition-all',
              currentMode === TradingMode.OFF ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            OFF
          </button>
          <button
            type="button"
            onClick={() => setTradingMode.mutate(TradingMode.PAPER)}
            className={cn(
              'px-2 py-0.5 rounded-md transition-all',
              currentMode === TradingMode.PAPER ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            PAPER
          </button>
          <button
            type="button"
            disabled
            title="LIVE mode is locked pending partner compliance gates and release approval. Paper simulation engine active."
            className="px-2 py-0.5 rounded-md text-neutral-400 opacity-60 cursor-not-allowed flex items-center gap-1"
          >
            <Lock className="w-2.5 h-2.5" /> LIVE
          </button>
        </div>

        {/* Emergency Halt Button */}
        <button
          type="button"
          onClick={() => setConfirmEmergencyOpen(true)}
          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
        >
          <Flame className="w-3.5 h-3.5" /> Emergency Halt
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Emergency Confirmation Modal */}
      {confirmEmergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">Trigger Emergency Halt?</h3>
                <p className="text-xs text-neutral-500">Immediate circuit break for all trading operations</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This action will abort all prospective trade submissions, pause the autonomous trading engine, and record a critical audit log entry.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEmergencyOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyExit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Yes, Emergency Halt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
