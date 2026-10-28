'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTradeCycles, useOrders } from '@/hooks/use-queries';
import { TradeCycleDetail, TradeCycleState, TradingMode, OptionType } from '@autotrader/api-contracts';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TradesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [symbolFilter, setSymbolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [optTypeFilter, setOptTypeFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expandable row state
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);

  const filtersPayload = useMemo(() => {
    return {
      symbol: symbolFilter.trim() || undefined,
      status: statusFilter !== 'ALL' ? (statusFilter as TradeCycleState) : undefined,
      mode: modeFilter !== 'ALL' ? (modeFilter as TradingMode) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }, [symbolFilter, statusFilter, modeFilter, startDate, endDate]);

  const { data: cycles, isLoading, isFetching, refetch } = useTradeCycles(page, pageSize, filtersPayload);
  const { data: allOrders } = useOrders();

  // Filter CE/PE in memory if specified
  const filteredCycles = useMemo(() => {
    if (!cycles) return [];
    if (optTypeFilter === 'ALL') return cycles;
    return cycles.filter((c) => {
      if (optTypeFilter === 'CE') return c.tradingSymbol?.includes('CE') || c.optionType === 'CE';
      if (optTypeFilter === 'PE') return c.tradingSymbol?.includes('PE') || c.optionType === 'PE';
      return true;
    });
  }, [cycles, optTypeFilter]);

  const handleExportCSV = () => {
    const qp = new URLSearchParams();
    if (filtersPayload.symbol) qp.set('symbol', filtersPayload.symbol);
    if (filtersPayload.status) qp.set('state', filtersPayload.status);
    if (filtersPayload.mode) qp.set('mode', filtersPayload.mode);
    if (filtersPayload.startDate) qp.set('startDate', filtersPayload.startDate);
    if (filtersPayload.endDate) qp.set('endDate', filtersPayload.endDate);

    const url = `/api/v1/trade-cycles/export?${qp.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1920px] mx-auto">
      <PageHeader
        title="Trade Execution History & Fills"
        subtitle="Canonical ledger of confirmed orders, partial fills, itemized statutory fees, and reconciled trade cycles"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Trade History' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin text-blue-600')} />
              Refresh Fills
            </button>
          </div>
        }
      />

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 pb-2 border-b border-neutral-100">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Trade History</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Symbol Search */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">Contract / Symbol</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="e.g. NIFTY, 24500CE"
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Option Type Filter */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">Option Type</label>
            <select
              value={optTypeFilter}
              onChange={(e) => setOptTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All (CE & PE)</option>
              <option value="CE">Call (CE)</option>
              <option value="PE">Put (PE)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">Cycle State</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All States</option>
              <option value="CLOSED">Closed (Completed)</option>
              <option value="IN_POSITION">In Position (Active)</option>
              <option value="PENDING_ENTRY">Pending Entry</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Trading Mode Filter */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">Execution Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Modes</option>
              <option value="PAPER">Paper Mode</option>
              <option value="LIVE">Live Mode</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-neutral-500 font-semibold block mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Main Trade History Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Reconciled Trade Cycles</h3>
            <p className="text-xs text-neutral-500">
              Showing {filteredCycles.length} verified trade cycle executions with itemized deductions
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Page {page}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Buy Avg</th>
                <th className="py-2.5 px-3 text-right">Sell Avg</th>
                <th className="py-2.5 px-3 text-right">Gross P&L</th>
                <th className="py-2.5 px-3 text-right">Total Charges</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
                <th className="py-2.5 px-3">Fee Status</th>
                <th className="py-2.5 px-3">Cycle State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-neutral-400 font-sans text-xs">
                    Loading verified trade executions...
                  </td>
                </tr>
              ) : filteredCycles.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-neutral-400 font-sans space-y-2">
                    <FileSpreadsheet className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-sm font-semibold text-neutral-600">No trade cycles found matching filters</p>
                    <p className="text-xs text-neutral-400">
                      Completed executions and fills will appear here automatically upon trade cycle completion.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCycles.map((c) => {
                  const isExpanded = expandedCycleId === c.id;
                  const grossNum = parseFloat(c.grossPnl);
                  const netNum = parseFloat(c.netPnl);
                  const chargesNum = parseFloat(c.charges.totalCharges);

                  return (
                    <React.Fragment key={c.id}>
                      <tr
                        onClick={() => setExpandedCycleId(isExpanded ? null : c.id)}
                        className={cn(
                          'hover:bg-neutral-50/80 cursor-pointer transition-colors',
                          isExpanded && 'bg-blue-50/30'
                        )}
                      >
                        <td className="py-3 px-3 text-neutral-400">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 text-[11px]">
                          {formatISTDateTime(c.startedAt)}
                        </td>
                        <td className="py-3 px-3 font-bold text-neutral-900">
                          <div className="flex items-center gap-1.5">
                            <span>{c.tradingSymbol}</span>
                            {c.optionType && (
                              <span
                                className={cn(
                                  'text-[9px] px-1 py-0.2 rounded font-bold uppercase',
                                  c.optionType === 'CE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                )}
                              >
                                {c.optionType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase',
                              c.tradingMode === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                            )}
                          >
                            {c.tradingMode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold">{c.buyQuantity}</td>
                        <td className="py-3 px-3 text-right">₹{c.buyAveragePrice}</td>
                        <td className="py-3 px-3 text-right">
                          {c.state === 'CLOSED' ? `₹${c.sellAveragePrice}` : '—'}
                        </td>
                        <td
                          className={cn(
                            'py-3 px-3 text-right font-bold',
                            grossNum > 0 ? 'text-emerald-600' : grossNum < 0 ? 'text-rose-600' : 'text-neutral-600'
                          )}
                        >
                          {grossNum > 0 ? '+' : ''}₹{c.grossPnl}
                        </td>
                        <td className="py-3 px-3 text-right text-neutral-500">
                          -₹{chargesNum.toFixed(2)}
                        </td>
                        <td
                          className={cn(
                            'py-3 px-3 text-right font-extrabold',
                            netNum > 0 ? 'text-emerald-600' : netNum < 0 ? 'text-rose-600' : 'text-neutral-600'
                          )}
                        >
                          {netNum > 0 ? '+' : ''}₹{c.netPnl}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border',
                              c.chargesStatus === 'ACTUAL'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : c.chargesStatus === 'ESTIMATED'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            )}
                          >
                            {c.chargesStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                              c.state === 'CLOSED'
                                ? 'bg-neutral-100 text-neutral-800'
                                : c.state === 'IN_POSITION'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-100 text-neutral-600'
                            )}
                          >
                            {c.state}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable Order Timeline & Itemized Fee Breakdown Drawer */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/70 border-b border-neutral-200">
                          <td colSpan={12} className="p-4 font-sans text-xs space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Execution Timeline & Orders */}
                              <div className="bg-white rounded-xl border border-neutral-200 p-3 space-y-2">
                                <h4 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  Execution Timeline & Orders
                                </h4>
                                <div className="space-y-1.5 font-mono text-[11px]">
                                  <div className="flex justify-between py-1 border-b border-neutral-100">
                                    <span className="text-neutral-500">Trade Cycle ID:</span>
                                    <span className="font-bold text-neutral-800">{c.id}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-neutral-100">
                                    <span className="text-neutral-500">Entry Order ID:</span>
                                    <span className="text-neutral-800">{c.entryOrderId ?? 'None'}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-neutral-100">
                                    <span className="text-neutral-500">Exit Order ID:</span>
                                    <span className="text-neutral-800">{c.exitOrderId ?? 'None'}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-neutral-100">
                                    <span className="text-neutral-500">Duration:</span>
                                    <span className="text-neutral-800">
                                      {c.durationSeconds !== null ? `${c.durationSeconds}s` : 'Active'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="text-neutral-500">Exit Reason:</span>
                                    <span className="font-semibold text-neutral-800">{c.exitReason ?? 'In Flight'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Itemized Statutory Charges Ledger */}
                              <div className="bg-white rounded-xl border border-neutral-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                                    Itemized Statutory Tariff Deductions
                                  </h4>
                                  <span
                                    className={cn(
                                      'text-[10px] font-bold px-2 py-0.5 rounded',
                                      c.chargesStatus === 'ACTUAL'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'bg-amber-50 text-amber-800'
                                    )}
                                  >
                                    {c.chargesStatus === 'ACTUAL' ? 'Confirmed Contract Note' : 'Calculated Tariff Estimate'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">Brokerage:</span>
                                    <span className="font-bold">₹{c.charges.brokerage}</span>
                                  </div>
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">STT (Options Sell):</span>
                                    <span className="font-bold">₹{c.charges.stt}</span>
                                  </div>
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">Exchange Txn:</span>
                                    <span className="font-bold">₹{c.charges.exchangeTxnCharge}</span>
                                  </div>
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">GST (18%):</span>
                                    <span className="font-bold">₹{c.charges.gst}</span>
                                  </div>
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">SEBI Turnover:</span>
                                    <span className="font-bold">₹{c.charges.sebiCharges}</span>
                                  </div>
                                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                                    <span className="text-neutral-500">Stamp Duty:</span>
                                    <span className="font-bold">₹{c.charges.stampDuty}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center p-2 bg-neutral-100 rounded-lg font-mono font-bold text-xs pt-1 mt-1">
                                  <span>Total Statutory Charges:</span>
                                  <span className="text-rose-600">-₹{c.charges.totalCharges}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
