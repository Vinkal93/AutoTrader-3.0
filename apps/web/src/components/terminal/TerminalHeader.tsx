'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useSystemStatus,
  useBrokerConnection,
  useNiftyQuote,
  useSetTradingMode,
  useTransitionEngineState,
  useEmergencyExit,
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
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency, formatISTTime } from '@/lib/formatters';

export const TerminalHeader: React.FC = () => {
  const { data: systemStatus } = useSystemStatus();
  const { data: broker } = useBrokerConnection();
  const { data: quote } = useNiftyQuote();
  const { theme, toggleTheme } = useUIStore();

  const setTradingMode = useSetTradingMode();
  const transitionState = useTransitionEngineState();
  const emergencyExit = useEmergencyExit();

  const [confirmEmergencyOpen, setConfirmEmergencyOpen] = useState(false);

  const currentMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const marketStatus = systemStatus?.marketStatus ?? 'UNKNOWN';
  const brokerState = broker?.state ?? BrokerConnectionState.NOT_CONFIGURED;

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

  return (
    <div className="bg-white border-b border-neutral-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20 shadow-2xs">
      {/* Left: NIFTY Quote + Market State */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight text-neutral-900">NIFTY 50</span>
          {quote ? (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-base font-bold text-neutral-900">
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
            <span className="text-xs text-neutral-400 font-mono italic">Market Feed Offline</span>
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

        {/* Broker Status */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-200">
          <StatusIndicator status={brokerState} size="sm" />
          <span className="text-[11px] text-neutral-500 font-mono">Kotak Neo</span>
        </div>
      </div>

      {/* Right Controls: Worker State, Mode Switcher, Emergency Exit */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Engine State Indicator */}
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
            title="LIVE mode requires explicit operator consent token, active broker session, VPS static-IP compliance, and approved risk settings."
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
