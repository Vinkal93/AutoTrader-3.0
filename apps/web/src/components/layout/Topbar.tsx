'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSystemStatus, useSetTradingMode } from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TradingMode, EngineState } from '@autotrader/api-contracts';
import { Lock, ShieldAlert, User, Menu } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';

export const Topbar: React.FC = () => {
  const { data: systemStatus } = useSystemStatus();
  const { toggleSidebar } = useUIStore();
  const setTradingMode = useSetTradingMode();

  const currentMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const marketStatus = systemStatus?.marketStatus ?? 'UNKNOWN';

  const handleModeChange = (mode: TradingMode) => {
    if (mode === TradingMode.LIVE) {
      // Disallow LIVE in Phase 1
      alert('Phase 1 Protection: LIVE trading execution is locked. Complete broker & risk verification first.');
      return;
    }
    setTradingMode.mutate(mode);
  };

  const marketColor = {
    OPEN: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    PRE_OPEN: 'text-blue-700 bg-blue-50 border-blue-200',
    CLOSED: 'text-neutral-600 bg-neutral-100 border-neutral-200',
    HOLIDAY: 'text-amber-700 bg-amber-50 border-amber-200',
    UNKNOWN: 'text-neutral-500 bg-neutral-100 border-neutral-200',
  }[marketStatus] || 'text-neutral-500 bg-neutral-100 border-neutral-200';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Left items: Mobile toggle + Engine State */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hidden sm:inline">
            Engine State:
          </span>
          <StatusIndicator status={engineState} size="md" />
        </div>
      </div>

      {/* Right items: Market status, Trading mode switch, User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Market Status */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Market:
          </span>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full border',
              marketColor
            )}
          >
            {marketStatus}
          </span>
        </div>

        {/* Trading Mode Selector */}
        <div
          role="group"
          aria-label="Trading Mode Selection"
          className="flex items-center rounded-lg bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold"
        >
          {/* OFF */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.OFF)}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              currentMode === TradingMode.OFF
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            OFF
          </button>

          {/* PAPER */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.PAPER)}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              currentMode === TradingMode.PAPER
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            PAPER
          </button>

          {/* LIVE (Disabled in Phase 1) */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.LIVE)}
            disabled
            title="LIVE Trading locked in Phase 1"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-neutral-400 cursor-not-allowed opacity-60"
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span>LIVE</span>
          </button>
        </div>

        {/* User / Auth Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-neutral-800 leading-tight">Admin</span>
            <span className="text-[10px] text-neutral-400 font-mono">Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
