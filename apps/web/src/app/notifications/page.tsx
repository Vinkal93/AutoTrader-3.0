'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useWatchdogStatus,
  useSystemIncidents,
  useNotificationChannels,
  useAlertDeliveries,
  useEmergencyRunbook,
  useRecoveryAction,
  useTriggerReconciliation,
} from '@/hooks/use-queries';
import { WatchdogHealthBanner } from '@/components/monitoring/WatchdogHealthBanner';
import { WatchdogDiagnosticCards } from '@/components/monitoring/WatchdogDiagnosticCards';
import { IncidentManagementStream } from '@/components/monitoring/IncidentManagementStream';
import { EmergencyRunbookModal } from '@/components/monitoring/EmergencyRunbookModal';
import { NotificationChannelsPanel } from '@/components/monitoring/NotificationChannelsPanel';
import { RecoveryModePanel } from '@/components/monitoring/RecoveryModePanel';
import { SystemActivityFeed } from '@/components/dashboard/SystemActivityFeed';
import { RefreshCw, BookOpen, Layers } from 'lucide-react';
import type { RecoveryReconciliationResult } from '@autotrader/api-contracts';

export default function NotificationsPage() {
  const [isRunbookOpen, setIsRunbookOpen] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<RecoveryReconciliationResult | null>(null);

  const { data: watchdogStatus, isLoading: isWatchdogLoading, refetch: refetchWatchdog, isFetching } = useWatchdogStatus();
  const { data: incidents, isLoading: isIncidentsLoading, refetch: refetchIncidents } = useSystemIncidents('ALL');
  const { data: channels, isLoading: isChannelsLoading } = useNotificationChannels();
  const { data: deliveries, isLoading: isDeliveriesLoading } = useAlertDeliveries(50);
  const { data: runbookSteps } = useEmergencyRunbook();

  const recoveryActionMutation = useRecoveryAction();
  const reconcileMutation = useTriggerReconciliation();

  const handleRefreshAll = () => {
    refetchWatchdog();
    refetchIncidents();
  };

  const handleAcknowledge = (id: string) => {
    recoveryActionMutation.mutate({
      action: 'ACKNOWLEDGE_INCIDENT',
      incidentId: id,
    });
  };

  const handleResolve = (id: string, notes: string) => {
    recoveryActionMutation.mutate({
      action: 'RESOLVE_INCIDENT',
      incidentId: id,
      resolutionNotes: notes,
    });
  };

  const handleEscalateRiskLock = () => {
    recoveryActionMutation.mutate({
      action: 'ESCALATE_RISK_LOCK',
      operatorNotes: 'Operator initiated risk-lock from Watchdog dashboard',
    });
  };

  const handleResetRecovery = () => {
    recoveryActionMutation.mutate({
      action: 'RESET_RECOVERY',
    });
  };

  const handleRunReconciliation = () => {
    reconcileMutation.mutate(undefined, {
      onSuccess: (res) => {
        setReconciliationResult(res);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Independent System Watchdog & Alerts"
        subtitle="Process heartbeat surveillance, broker session expiration detection, incident history, and recovery controls"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Monitoring & Watchdog' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRunbookOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 shadow-2xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Emergency Runbook
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
              Scan Subsystems
            </button>
          </div>
        }
      />

      {/* Real-time Watchdog Health Banner */}
      <WatchdogHealthBanner
        status={watchdogStatus}
        isLoading={isWatchdogLoading}
        onOpenRunbook={() => setIsRunbookOpen(true)}
        onRunReconciliation={handleRunReconciliation}
        onEscalateRiskLock={handleEscalateRiskLock}
        isReconciling={reconcileMutation.isPending}
      />

      {/* 6 Subsystem Diagnostic Cards */}
      <WatchdogDiagnosticCards status={watchdogStatus} isLoading={isWatchdogLoading} />

      {/* Recovery Mode and Reconciliation Panel */}
      <RecoveryModePanel
        lastResult={reconciliationResult}
        isReconciling={reconcileMutation.isPending}
        onRunReconciliation={handleRunReconciliation}
        onResetRecovery={handleResetRecovery}
        onEscalateRiskLock={handleEscalateRiskLock}
      />

      {/* Incident Management Stream */}
      <IncidentManagementStream
        incidents={incidents}
        isLoading={isIncidentsLoading}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />

      {/* Configurable Alert Channels and Deduplication Deliveries */}
      <NotificationChannelsPanel
        channels={channels}
        deliveries={deliveries}
        isLoading={isChannelsLoading || isDeliveriesLoading}
      />

      {/* Underlying Chronological Activity Stream */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-4">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Audit Event Stream</h3>
            <p className="text-xs text-neutral-500">Chronological telemetry feed across all platform services</p>
          </div>
        </div>
        <SystemActivityFeed />
      </div>

      {/* Emergency Runbook Modal */}
      <EmergencyRunbookModal
        isOpen={isRunbookOpen}
        onClose={() => setIsRunbookOpen(false)}
        steps={runbookSteps}
      />
    </div>
  );
}
