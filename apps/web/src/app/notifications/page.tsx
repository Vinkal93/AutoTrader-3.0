'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SystemActivityFeed } from '@/components/dashboard/SystemActivityFeed';
import { useSystemEvents } from '@/hooks/use-queries';
import { Bell, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const { refetch, isFetching } = useSystemEvents(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Notifications & Alerts"
        subtitle="Chronological feed of strategy milestones, broker heartbeats, and safety alerts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Notifications' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Alerts
          </button>
        }
      />

      <SystemActivityFeed />
    </div>
  );
}
