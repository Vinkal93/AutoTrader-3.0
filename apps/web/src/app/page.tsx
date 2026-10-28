'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { DataFreshnessIndicator } from '@/components/ui/DataFreshnessIndicator';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  useDashboardOverview,
  useBrokerConnection,
  useHealth,
  usePositions,
  useOrders,
  useReconnectBroker,
} from '@/hooks/use-queries';
import { formatCurrency, formatPercentage, formatISTDateTime } from '@/lib/formatters';
import {
  BrokerConnectionState,
  type Position,
  type Order,
  type SystemEvent,
  OrderStatus,
} from '@autotrader/api-contracts';
import {
  TrendingUp,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowRight,
  ExternalLink,
  Layers,
  Lock,
  Radio,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'events'>('positions');

  const {
    data: overview,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useDashboardOverview();

  const { data: broker, refetch: refetchBroker } = useBrokerConnection();
  const { data: health } = useHealth();
  const { data: positions, isLoading: isPositionsLoading } = usePositions();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();
  const reconnectMutation = useReconnectBroker();

  const isBrokerConfigured = broker?.state !== BrokerConnectionState.NOT_CONFIGURED;

  // Format metric values honestly — NO FABRICATION
  const pnlVal = overview?.todaySummary?.netPnl ?? overview?.accountSummary?.unrealizedPnl ?? null;
  const formattedPnl = pnlVal !== null ? formatCurrency(pnlVal, { showSign: true }) : '—';

  const marginVal = overview?.accountSummary?.availableMargin ?? null;
  const formattedMargin = marginVal !== null ? formatCurrency(marginVal) : '—';

  const niftyPrice = overview?.niftySpot?.lastPrice ?? null;
  const formattedNifty = niftyPrice !== null ? `₹${niftyPrice.toLocaleString('en-IN')}` : '—';
  const niftyChange = overview?.niftySpot?.changePercent ?? null;
  const formattedNiftyChange = niftyChange !== null ? formatPercentage(niftyChange) : null;

  // Table Columns for Positions
  const positionColumns: Column<Position>[] = [
    {
      key: 'tradingSymbol',
      header: 'Instrument',
      accessor: (p) => (
        <div>
          <span className="font-semibold text-neutral-900">{p.tradingSymbol}</span>
          <span className="ml-2 text-xs text-neutral-400 uppercase font-mono">{p.exchange}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'side',
      header: 'Side',
      accessor: (p) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            p.side === 'BUY'
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              : 'text-rose-700 bg-rose-50 border border-rose-200'
          }`}
        >
          {p.side}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      sortable: true,
      accessor: (p) => <span className="font-mono">{p.quantity}</span>,
    },
    {
      key: 'averagePrice',
      header: 'Avg Price',
      align: 'right',
      accessor: (p) => <span className="font-mono">{formatCurrency(p.averagePrice)}</span>,
    },
    {
      key: 'lastPrice',
      header: 'LTP',
      align: 'right',
      accessor: (p) => <span className="font-mono">{formatCurrency(p.lastPrice)}</span>,
    },
    {
      key: 'pnl',
      header: 'P&L',
      align: 'right',
      sortable: true,
      accessor: (p) => {
        const numPnl = parseFloat(p.pnl);
        const isProfit = numPnl > 0;
        const isLoss = numPnl < 0;
        return (
          <span
            className={`font-semibold font-mono ${
              isProfit ? 'text-emerald-600' : isLoss ? 'text-rose-600' : 'text-neutral-600'
            }`}
          >
            {formatCurrency(p.pnl, { showSign: true })}
          </span>
        );
      },
    },
  ];

  // Table Columns for Orders
  const orderColumns: Column<Order>[] = [
    {
      key: 'tradingSymbol',
      header: 'Symbol',
      accessor: (o) => (
        <div>
          <span className="font-semibold text-neutral-900">{o.tradingSymbol}</span>
          <span className="ml-2 text-xs text-neutral-400 uppercase font-mono">{o.orderType}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'side',
      header: 'Side',
      accessor: (o) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            o.side === 'BUY'
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              : 'text-rose-700 bg-rose-50 border border-rose-200'
          }`}
        >
          {o.side}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      accessor: (o) => (
        <span className="font-mono">
          {o.filledQuantity} / {o.quantity}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      accessor: (o) => <span className="font-mono">{formatCurrency(o.price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (o) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            o.status === OrderStatus.FILLED
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : o.status === OrderStatus.REJECTED || o.status === OrderStatus.ERROR
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-neutral-100 text-neutral-700 border-neutral-200'
          }`}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: 'placedAt',
      header: 'Placed At',
      align: 'right',
      accessor: (o) => (
        <span className="text-xs text-neutral-500 font-mono">
          {formatISTDateTime(o.placedAt, { timeOnly: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Trading Operations Dashboard"
        subtitle="Automated NIFTY 50 Options execution engine and real-time risk monitor"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/broker"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Broker Settings
            </Link>
            <Link
              href="/strategies"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Strategy View
            </Link>
          </div>
        }
      />

      {/* Phase 1 Read-Only Foundation Banner */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 sm:p-5 text-amber-900 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h2 className="text-sm font-bold tracking-tight text-amber-900">
                Phase 1: Read-Only System Foundation — Trading Execution Locked
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 self-start">
                Safe Mode Active
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              Order submission to Kotak Neo is intentionally disabled until broker credentials, static IP compliance, and risk control parameters are explicitly verified. Metric values reflect verifiable data only — no simulated or fabricated numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Honest State Banner: Broker Not Configured */}
      {!isBrokerConfigured && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Setup Required
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                Kotak Neo Broker API Not Configured
              </h3>
              <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                Live balances, active positions, and order feeds are withheld until your Kotak Neo broker credentials and Static IP are securely configured.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Add API Credentials in .env</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Verify Static IP Whitelist</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Connect & Authorize Session</span>
                </div>
              </div>
            </div>

            <Link
              href="/broker"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 shrink-0 transition-colors"
            >
              <span>Configure Broker Connection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net P&L */}
        <MetricCard
          title="Today's Realized P&L"
          value={pnlVal}
          formattedValue={formattedPnl}
          tooltip="Realized profit & loss for current trading session"
          icon={<TrendingUp className="w-4 h-4" />}
          freshness={overview?.niftySpot?.freshness ?? 'UNAVAILABLE'}
          asOf={overview?.accountSummary ? new Date().toISOString() : null}
          isLoading={isOverviewLoading}
        />

        {/* Available Margin */}
        <MetricCard
          title="Available Margin"
          value={marginVal}
          formattedValue={formattedMargin}
          tooltip="Verified trading capital available with broker"
          icon={<Wallet className="w-4 h-4" />}
          freshness={overview?.accountSummary ? 'RECENT' : 'UNAVAILABLE'}
          isLoading={isOverviewLoading}
        />

        {/* NIFTY 50 Spot */}
        <MetricCard
          title="NIFTY 50 Spot"
          value={niftyPrice}
          formattedValue={formattedNifty}
          changePercent={formattedNiftyChange}
          tooltip="Live underlying index price from exchange feed"
          icon={<Radio className="w-4 h-4" />}
          freshness={overview?.niftySpot?.freshness ?? 'UNAVAILABLE'}
          isLoading={isOverviewLoading}
        />

        {/* Engine State */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-neutral-500">
            <span>Engine State</span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="pt-1">
            <StatusIndicator
              status={overview?.engineState ?? 'STOPPED'}
              size="lg"
            />
          </div>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Mode: {overview?.tradingMode ?? 'OFF'}</span>
            <span className="font-mono text-neutral-400">Phase 1</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Connection Status */}
      <ConnectionStatus
        broker={broker}
        health={health}
        onReconnect={() => reconnectMutation.mutate()}
        isReconnecting={reconnectMutation.isPending}
      />

      {/* Tabs: Positions / Orders / System Events */}
      <div className="space-y-4">
        <div className="flex items-center border-b border-neutral-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'positions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Positions ({positions?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Orders Today ({orders?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            System Audit Events ({overview?.recentEvents?.length ?? 0})
          </button>
        </div>

        {/* Tab 1: Positions */}
        {activeTab === 'positions' && (
          <DataTable
            columns={positionColumns}
            data={positions}
            keyExtractor={(p) => p.id}
            isLoading={isPositionsLoading}
            emptyTitle="No open positions"
            emptyDescription={
              isBrokerConfigured
                ? 'No open NIFTY options positions in the current trading session.'
                : 'Broker is not configured. Connect your broker API to monitor active positions.'
            }
          />
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <DataTable
            columns={orderColumns}
            data={orders}
            keyExtractor={(o) => o.id}
            isLoading={isOrdersLoading}
            emptyTitle="No orders placed today"
            emptyDescription="No automated or manual orders have been dispatched today."
          />
        )}

        {/* Tab 3: System Events */}
        {activeTab === 'events' && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Live Audit & Security Event Stream
            </h3>
            {overview?.recentEvents && overview.recentEvents.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {overview.recentEvents.map((evt: SystemEvent) => (
                  <div key={evt.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mt-0.5 ${
                          evt.severity === 'CRITICAL' || evt.severity === 'ERROR'
                            ? 'bg-rose-100 text-rose-700'
                            : evt.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {evt.severity}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">{evt.message}</p>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {evt.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                      {formatISTDateTime(evt.timestamp, { timeOnly: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent audit events"
                description="System logs and engine transitions will stream here in real time."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
