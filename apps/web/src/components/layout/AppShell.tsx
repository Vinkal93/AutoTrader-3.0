'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBrokerConnection, useHealth } from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import { ShieldCheck, Clock } from 'lucide-react';
import { formatISTDateTime } from '@/lib/formatters';
import { useAuth } from '@/lib/auth/auth-context';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { sidebarCollapsed, confirmDialog, closeConfirmDialog } = useUIStore();
  const { data: broker } = useBrokerConnection();
  const { data: health } = useHealth();

  // Clock hydration fix: Real-time ticking client clock without server mismatch
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(formatISTDateTime(new Date().toISOString(), { timeOnly: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/brokers') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/faqs') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/education') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/risk-disclosure') ||
    pathname.startsWith('/refund-policy') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth/callback');

  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isTerminalRoute =
    pathname === '/trading' ||
    pathname === '/live-trading' ||
    pathname.startsWith('/app/trading');

  useEffect(() => {
    if (authLoading) return;

    // 1. If user is authenticated and visits login/signup, redirect to dashboard or safe return URL
    if (user && (pathname === '/login' || pathname === '/signup')) {
      if (!user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // 2. If user is authenticated and has not onboarded, restrict access to private pages
    if (user && !user.isOnboarded && !isOnboardingRoute && !isPublicRoute) {
      router.push('/onboarding');
      return;
    }

    // 3. If user is unauthenticated and visits private app route, redirect to login
    if (!user && !isPublicRoute && !isOnboardingRoute) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, pathname, isPublicRoute, isOnboardingRoute, router]);

  // Public marketing & legal layout (No sidebar or dashboard topbar)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 font-sans">
        {children}
      </div>
    );
  }

  // Onboarding full-screen standalone layout
  if (isOnboardingRoute) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
        {children}
      </div>
    );
  }

  // Broker connection state mapping
  const brokerState =
    {
      [BrokerConnectionState.CONNECTED]: 'connected' as const,
      [BrokerConnectionState.NOT_CONFIGURED]: 'disconnected' as const,
      [BrokerConnectionState.AUTHENTICATION_EXPIRED]: 'stale' as const,
      [BrokerConnectionState.DISCONNECTED]: 'disconnected' as const,
      [BrokerConnectionState.ERROR]: 'error' as const,
      [BrokerConnectionState.RATE_LIMITED]: 'stale' as const,
      [BrokerConnectionState.RECONNECTING]: 'connecting' as const,
    }[broker?.state ?? BrokerConnectionState.NOT_CONFIGURED] || 'disconnected';

  const isHealthy = health?.status === 'HEALTHY';

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0',
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content: Adaptive max-width based on route for efficient screen space utilization */}
        <main
          className={cn(
            'flex-1 w-full mx-auto pb-16 min-w-0',
            isTerminalRoute
              ? 'max-w-[1920px] p-3 sm:p-5 lg:p-6'
              : 'max-w-7xl p-3 sm:p-6 lg:p-8'
          )}
        >
          {children}
        </main>

        {/* Footer Status & Safety Banner (Responsive & Never hidden) */}
        <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 sm:px-6 py-2.5 text-xs text-neutral-500">
          <div
            className={cn(
              'mx-auto flex flex-col sm:flex-row items-center justify-between gap-2',
              isTerminalRoute ? 'max-w-[1920px]' : 'max-w-7xl'
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-400">Broker:</span>
                <StatusIndicator status={brokerState} size="sm" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-400">System:</span>
                <StatusIndicator status={isHealthy ? 'connected' : 'degraded'} size="sm" label={health?.status ?? 'DOWN'} />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
              <div className="flex items-center gap-1 text-neutral-400 tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>
                  {mounted && currentTime ? currentTime : '--:--:--'}
                </span>
              </div>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <span className="text-[11px] font-medium text-neutral-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Phase 1 Execution Lock Active
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          variant={confirmDialog.variant}
          onConfirm={() => {
            confirmDialog.onConfirm?.();
            closeConfirmDialog();
          }}
          onClose={() => {
            confirmDialog.onCancel?.();
            closeConfirmDialog();
          }}
        />
      )}
    </div>
  );
};
