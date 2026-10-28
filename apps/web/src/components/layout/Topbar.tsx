'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  useSystemStatus,
  useBrokerConnection,
  useNiftyQuote,
  useSystemEvents,
  useSetTradingMode,
} from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TradingMode, EngineState, BrokerConnectionState } from '@autotrader/api-contracts';
import {
  Lock,
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency, formatISTTime } from '@/lib/formatters';

export const Topbar: React.FC = () => {
  const { data: systemStatus } = useSystemStatus();
  const { data: broker } = useBrokerConnection();
  const { data: quote } = useNiftyQuote();
  const { data: events } = useSystemEvents(50);
  const { setMobileSidebarOpen, theme, toggleTheme, openConfirmDialog } = useUIStore();
  const setTradingMode = useSetTradingMode();

  const currentMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const marketStatus = systemStatus?.marketStatus ?? 'UNKNOWN';
  const brokerState = broker?.state ?? BrokerConnectionState.NOT_CONFIGURED;

  const warningCount = events?.filter(
    (e) => e.severity === 'WARNING' || e.severity === 'ERROR' || e.severity === 'CRITICAL'
  ).length ?? 0;

  const handleModeChange = (targetMode: TradingMode) => {
    if (targetMode === TradingMode.LIVE) {
      openConfirmDialog({
        title: 'Phase Safety Lock Active',
        description:
          'Live broker order submission is locked in Phase 1 & 2. Automated real-money order routing will be unlocked in Phase 3 following broker and risk gate sign-off.',
        confirmText: 'Acknowledge Lock',
        variant: 'warning',
      });
      return;
    }

    setTradingMode.mutate(targetMode);
  };

  const marketBadge = {
    OPEN: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    PRE_OPEN: 'text-blue-700 bg-blue-50 border-blue-200',
    CLOSED: 'text-neutral-600 bg-neutral-100 border-neutral-200',
    HOLIDAY: 'text-amber-700 bg-amber-50 border-amber-200',
    UNKNOWN: 'text-neutral-500 bg-neutral-100 border-neutral-200',
  }[marketStatus] || 'text-neutral-500 bg-neutral-100 border-neutral-200';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
      {/* Left Area: Mobile Drawer Toggle & NIFTY Spot Telemetry */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* NIFTY 50 Spot Quote Pill */}
        <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 tracking-tight">NIFTY 50</span>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">SPOT</span>
            </div>
            {quote ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold font-mono">
                <span className="text-neutral-900">{formatCurrency(quote.lastPrice)}</span>
                <span
                  className={cn(
                    'flex items-center text-[11px]',
                    quote.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {quote.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 inline" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 inline" />
                  )}
                  {quote.change >= 0 ? '+' : ''}
                  {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-400 font-mono">— Unavailable</span>
            )}
          </div>
        </div>

        {/* Broker State Indicator */}
        <div className="hidden xl:flex items-center gap-2 text-xs border-l border-neutral-200 pl-4">
          <Cpu className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-500 font-medium">Kotak Neo:</span>
          <StatusIndicator status={brokerState} size="sm" showLabel />
        </div>
      </div>

      {/* Right Area: Engine State, Market Hours, Mode, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Worker Engine State */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-medium text-neutral-400 uppercase tracking-wider text-[11px]">
            Engine:
          </span>
          <StatusIndicator status={engineState} size="sm" showLabel />
        </div>

        {/* Market Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className={cn(
              'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tracking-wide uppercase',
              marketBadge
            )}
          >
            {marketStatus}
          </span>
        </div>

        {/* Trading Mode Switcher */}
        <div
          role="group"
          aria-label="Trading Mode"
          className="flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold"
        >
          {/* OFF */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.OFF)}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-all',
              currentMode === TradingMode.OFF
                ? 'bg-neutral-900 text-white shadow-xs'
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
              'px-2.5 py-1 rounded-lg transition-all',
              currentMode === TradingMode.PAPER
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            PAPER
          </button>

          {/* LIVE (Safely locked) */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.LIVE)}
            title="Live Trading is locked in Phase 1 & 2"
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all opacity-60 cursor-not-allowed',
              currentMode === TradingMode.LIVE
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Lock className="w-3 h-3" />
            LIVE
          </button>
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {warningCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle visual theme"
          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Authenticated User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
            TR
          </div>
          <div className="hidden 2xl:flex flex-col">
            <span className="text-xs font-semibold text-neutral-900 leading-none">Trader</span>
            <span className="text-[10px] text-neutral-400 font-mono">Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
};
