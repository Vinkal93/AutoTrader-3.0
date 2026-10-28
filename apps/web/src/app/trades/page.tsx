'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable';
import { useTrades, useTradeCycles } from '@/hooks/use-queries';
import { History, Download, RefreshCw } from 'lucide-react';

export default function TradesPage() {
  const { refetch: refetchCycles, isFetching } = useTradeCycles(1, 50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trade Execution History & Fills"
        subtitle="Canonical ledger of confirmed orders, partial fills, and reconciled trade cycles"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Trade History' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetchCycles()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
              Refresh Trades
            </button>
          </div>
        }
      />

      <RecentTradesTable />
    </div>
  );
}
