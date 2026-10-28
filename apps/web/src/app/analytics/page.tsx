'use client';

import React, { useState } from 'react';
import type { AnalyticsTimeframe } from '@autotrader/api-contracts';
import { PageHeader } from '@/components/layout/PageHeader';
import { useComprehensiveAnalytics } from '@/hooks/use-queries';
import { AnalyticsMetricsGrid } from '@/components/analytics/AnalyticsMetricsGrid';
import { EquityDrawdownChart } from '@/components/analytics/EquityDrawdownChart';
import { TradingCalendarHeatmap } from '@/components/analytics/TradingCalendarHeatmap';
import { OptionTypeSplitCard } from '@/components/analytics/OptionTypeSplitCard';
import { StrategyVersionTable } from '@/components/analytics/StrategyVersionTable';
import { SlippageAnalysisCard } from '@/components/analytics/SlippageAnalysisCard';
import { TradeDrilldownTable } from '@/components/analytics/TradeDrilldownTable';
import {
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info,
  Layers,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: analytics,
    isLoading,
    refetch,
    isRefetching,
  } = useComprehensiveAnalytics({
    timeframe,
    startDate: timeframe === 'CUSTOM' ? customStart : undefined,
    endDate: timeframe === 'CUSTOM' ? customEnd : undefined,
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.append('timeframe', timeframe);
      params.append('format', format);
      if (timeframe === 'CUSTOM') {
        if (customStart) params.append('start_date', customStart);
        if (customEnd) params.append('end_date', customEnd);
      }

      // Download file directly
      const downloadUrl = `/api/v1/analytics/export?${params.toString()}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Export request failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autotrader_analytics_${timeframe}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Performance Analytics & Equity Progression"
        subtitle="Authoritative mathematical evaluation of trade outcomes, expectancy, drawdown, and execution slippage"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Performance & Analytics' },
        ]}
      />

      {/* Control Bar: Timeframe Filters & Export Actions */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Timeframe:
          </span>
          {(
            [
              { label: 'Today', value: 'TODAY' },
              { label: '7 Days', value: '7D' },
              { label: '30 Days', value: '30D' },
              { label: 'This Month', value: 'MONTH' },
              { label: 'All Time', value: 'ALL' },
              { label: 'Custom Range', value: 'CUSTOM' },
            ] as const
          ).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTimeframe(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Refresh & Export Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all text-xs font-semibold flex items-center gap-1"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if CUSTOM timeframe selected */}
      {timeframe === 'CUSTOM' && (
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center gap-4 text-xs tabular-nums animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold">Start Date:</span>
            <input
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-blue-500 text-xs tabular-nums"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold">End Date:</span>
            <input
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-blue-500 text-xs tabular-nums"
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Sample Size Warning Banner (Statistical integrity) */}
      {analytics?.sampleSizeWarning && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-800">Sample Size Notice</span>
            <p className="mt-0.5 text-amber-700 leading-relaxed">{analytics.sampleSizeWarning}</p>
          </div>
        </div>
      )}

      {/* 12 Key Performance Metrics Grid */}
      <AnalyticsMetricsGrid data={analytics} isLoading={isLoading} />

      {/* Equity Progression & Daily PnL Distribution Chart */}
      <EquityDrawdownChart data={analytics} isLoading={isLoading} />

      {/* Trading Calendar Heatmap */}
      <TradingCalendarHeatmap entries={analytics?.calendarHeatmap} isLoading={isLoading} />

      {/* Comparative Splits: CE vs PE & Slippage Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OptionTypeSplitCard ce={analytics?.cePerformance} pe={analytics?.pePerformance} isLoading={isLoading} />
        <SlippageAnalysisCard slippage={analytics?.slippage} isLoading={isLoading} />
      </div>

      {/* Strategy Version Comparison */}
      <StrategyVersionTable versions={analytics?.strategyVersions} isLoading={isLoading} />

      {/* Trade-Level Drilldown Table */}
      <TradeDrilldownTable drilldowns={analytics?.drilldowns} isLoading={isLoading} />
    </div>
  );
}
