'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  useSystemStatus,
  useBrokerConnection,
  useBrokerConnections,
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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Building2,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/lib/auth/auth-context';
import { formatCurrency } from '@/lib/formatters';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: systemStatus } = useSystemStatus();
  const { data: broker } = useBrokerConnection();
  const { data: connections = [] } = useBrokerConnections();
  const { data: quote } = useNiftyQuote();
  const { data: events } = useSystemEvents(50);
  const {
    setMobileSidebarOpen,
    theme,
    toggleTheme,
    openConfirmDialog,
    activeBrokerConnectionId,
    setActiveBrokerConnectionId,
  } = useUIStore();

  React.useEffect(() => {
    if (!activeBrokerConnectionId && connections.length > 0) {
      setActiveBrokerConnectionId(connections[0].id);
    }
  }, [activeBrokerConnectionId, connections, setActiveBrokerConnectionId]);

  const setTradingMode = useSetTradingMode();

  const currentMode = systemStatus?.tradingMode ?? TradingMode.OFF;
  const engineState = systemStatus?.engineState ?? EngineState.STOPPED;
  const marketStatus = systemStatus?.marketStatus ?? 'UNKNOWN';

  const warningCount =
    events?.filter(
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

  const marketBadge =
    {
      OPEN: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      PRE_OPEN: 'text-blue-700 bg-blue-50 border-blue-200',
      CLOSED: 'text-neutral-600 bg-neutral-100 border-neutral-200',
      HOLIDAY: 'text-amber-700 bg-amber-50 border-amber-200',
      UNKNOWN: 'text-neutral-500 bg-neutral-100 border-neutral-200',
    }[marketStatus] || 'text-neutral-500 bg-neutral-100 border-neutral-200';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
      {/* Left Area: Mobile Drawer Toggle, NIFTY Quote, and Mobile-Visible Account Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
        {/* Mobile Navigation Drawer Trigger (Touch target >= 44px) */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* NIFTY 50 Spot Quote Pill */}
        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 px-2.5 py-1.5 rounded-xl shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-neutral-900 tracking-tight">NIFTY</span>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider hidden sm:inline">SPOT</span>
            </div>
            {quote ? (
              <div className="flex items-center gap-1 text-xs font-semibold tabular-nums">
                <span className="text-neutral-900">{formatCurrency(quote.lastPrice)}</span>
                <span
                  className={cn(
                    'hidden xs:flex items-center text-[10px]',
                    quote.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {quote.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 inline" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 inline" />
                  )}
                  {quote.change >= 0 ? '+' : ''}
                  {quote.changePercent.toFixed(1)}%
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-400 font-medium">— Unavailable</span>
            )}
          </div>
        </div>

        {/* Account Context & Multi-Broker Selector (Visible across Mobile, Tablet & Desktop) */}
        <div className="flex items-center gap-1.5 text-xs sm:border-l sm:border-neutral-200 sm:pl-3">
          <span className="hidden xl:inline text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
            Account:
          </span>
          {connections.length > 0 ? (
            <select
              value={activeBrokerConnectionId || connections[0].id}
              onChange={(e) => setActiveBrokerConnectionId(e.target.value)}
              aria-label="Select connected broker account"
              className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg sm:rounded-xl px-2 py-1.5 max-w-[105px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none truncate focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              title="Switch active broker account"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brokerName} ({c.alias})
                </option>
              ))}
            </select>
          ) : (
            <Link
              href="/broker"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs hover:bg-amber-100 transition-colors whitespace-nowrap"
            >
              Connect Broker
            </Link>
          )}
        </div>
      </div>

      {/* Right Area: Engine State, Mode, Theme, User */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Worker Engine State (Hidden on smallest mobile, visible >= md) */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-medium text-neutral-400 uppercase tracking-wider text-[11px]">
            Engine:
          </span>
          <StatusIndicator status={engineState} size="sm" showLabel />
        </div>

        {/* Market Status Pill (Hidden on mobile < 640px) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className={cn(
              'text-[11px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase',
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
          className="flex items-center rounded-xl bg-neutral-100 p-0.5 sm:p-1 border border-neutral-200 text-xs font-semibold"
        >
          {/* OFF */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.OFF)}
            className={cn(
              'px-2 sm:px-2.5 py-1 rounded-lg transition-all min-h-[32px]',
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
              'px-2 sm:px-2.5 py-1 rounded-lg transition-all min-h-[32px]',
              currentMode === TradingMode.PAPER
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            PAPER
          </button>

          {/* LIVE (Locked) */}
          <button
            type="button"
            onClick={() => handleModeChange(TradingMode.LIVE)}
            title="Live Trading is locked pending approval"
            className={cn(
              'flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all opacity-60 cursor-not-allowed min-h-[32px]',
              currentMode === TradingMode.LIVE
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Lock className="w-3 h-3" />
            <span className="hidden xs:inline">LIVE</span>
          </button>
        </div>

        {/* Notifications Icon (Touch target >= 44px) */}
        <Link
          href="/notifications"
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {warningCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Theme Toggle (Touch target >= 44px) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle visual theme"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Authenticated User Profile Pill & Sign Out */}
        <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'TR'}
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-neutral-900 leading-none">
              {user?.fullName || 'Trader'}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {user?.email || 'Owner'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            title="Sign out of workspace"
            aria-label="Sign out"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
