'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBrokerConnection, useHealth } from '@/hooks/use-queries';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { formatISTDateTime } from '@/lib/formatters';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { sidebarCollapsed, confirmDialog, closeConfirmDialog } = useUIStore();
  const { data: broker } = useBrokerConnection();
  const { data: health } = useHealth();

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/risk-disclosure') ||
    pathname.startsWith('/refund-policy') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900 antialiased selection:bg-blue-100 selection:text-blue-900">
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
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>

        {/* Footer Status Banner */}
        <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-2.5 text-xs text-neutral-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-400">Broker:</span>
                <StatusIndicator status={brokerState} size="sm" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-400">System:</span>
                <StatusIndicator status={isHealthy ? 'connected' : 'degraded'} size="sm" label={health?.status ?? 'DOWN'} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-neutral-400 tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatISTDateTime(new Date().toISOString(), { timeOnly: true })}</span>
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-[11px] font-medium text-neutral-500">
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
