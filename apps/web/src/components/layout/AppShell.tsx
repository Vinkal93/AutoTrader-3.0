'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBrokerConnection, useHealth } from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
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
        const params = new URLSearchParams(window.location.search);
        const safeRedirect = params.get('redirect');
        if (safeRedirect && safeRedirect.startsWith('/') && !safeRedirect.startsWith('//')) {
          router.push(safeRedirect);
        } else {
          router.push('/dashboard');
        }
      }
      return;
    }

    // 2. If user is authenticated and not onboarded, redirect from private routes to /onboarding
    if (user && !user.isOnboarded && !isPublicRoute && !isOnboardingRoute) {
      router.push('/onboarding');
      return;
    }

    // 3. If user is onboarded and tries to access /onboarding, redirect to /dashboard
    if (user && user.isOnboarded && isOnboardingRoute) {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, pathname, isPublicRoute, isOnboardingRoute, router]);

  if (isPublicRoute || isOnboardingRoute) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900 antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        {children}
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
  }

  const brokerState = broker?.state ?? BrokerConnectionState.NOT_CONFIGURED;
  const isHealthy = health?.status === 'healthy';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Sidebar */}
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
                <span>{formatISTDateTime(new Date().toISOString(), { timeOnly: true })}</span>
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
