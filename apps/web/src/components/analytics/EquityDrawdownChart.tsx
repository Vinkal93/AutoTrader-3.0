'use client';

import React, { useState } from 'react';
import type { ComprehensiveAnalytics } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface EquityDrawdownChartProps {
  data?: ComprehensiveAnalytics;
  isLoading?: boolean;
}

export const EquityDrawdownChart: React.FC<EquityDrawdownChartProps> = ({
  data,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'EQUITY' | 'DAILY'>('EQUITY');

  const equityPoints = data?.equityCurve ?? [];
  const dailySeries = data?.dailyPnlSeries ?? [];
  const hasData = (data?.closedTrades ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[320px] flex items-center justify-center">
        <span className="text-xs text-neutral-400">Loading progression charts...</span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs h-[320px] flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-neutral-300 mb-2" />
        <h4 className="text-sm font-bold text-neutral-700">No Trading Realization Data</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm">
          Equity curves and daily P&L distributions will generate automatically once the first trade cycle completes.
        </p>
      </div>
    );
  }

  // --- Calculations for Equity View SVG ---
  const equities = equityPoints.map((p) => p.equity);
  const minEquity = Math.min(0, ...equities);
  const maxEquity = Math.max(100, ...equities);
  const equityRange = maxEquity - minEquity || 100;

  const svgWidth = 800;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (equityPoints.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (equityPoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minEquity) / equityRange;
    return padding.top + (1 - norm) * chartHeight;
  };

  const zeroY = getY(0);

  // Build SVG Path
  const equityPath = equityPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(p.equity).toFixed(1)}`)
    .join(' ');

  const areaPath = equityPoints.length > 0
    ? `${equityPath} L ${getX(equityPoints.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${getX(0).toFixed(1)} ${zeroY.toFixed(1)} Z`
    : '';

  // Peak High Water Mark
  let runningPeak = 0;
  const peakPoints: Array<{ x: number; y: number }> = [];
  equityPoints.forEach((p, idx) => {
    if (p.equity > runningPeak) runningPeak = p.equity;
    peakPoints.push({ x: getX(idx), y: getY(runningPeak) });
  });

  const peakPath = peakPoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  // --- Calculations for Daily PnL Bar Chart ---
  const maxAbsDaily = Math.max(
    ...dailySeries.map((d) => Math.max(Math.abs(d.netPnl), Math.abs(d.grossPnl))),
    100
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
              {viewMode === 'EQUITY' ? 'Cumulative Equity Progression' : 'Daily Realized P&L Distribution'}
            </h3>
            <span className="text-[10px] tabular-nums font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {equityPoints.length} updates
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {viewMode === 'EQUITY'
              ? 'Real-time equity progression & high-water mark overlay'
              : 'Daily gross vs net trading realizations'}
          </p>
        </div>

        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('EQUITY')}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === 'EQUITY'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Equity Curve
          </button>
          <button
            type="button"
            onClick={() => setViewMode('DAILY')}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === 'DAILY'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Daily P&L Bars
          </button>
        </div>
      </div>

      {viewMode === 'EQUITY' ? (
        <div className="relative w-full h-[260px] mt-4 select-none">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Zero line */}
            <line
              x1={padding.left}
              y1={zeroY}
              x2={svgWidth - padding.right}
              y2={zeroY}
              stroke="#e5e5e5"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Peak High Water Mark */}
            <path
              d={peakPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#equityGrad)" />}

            {/* Equity Line */}
            {equityPath && (
              <path
                d={equityPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Y-Axis Labels */}
            <text x={padding.left - 8} y={getY(maxEquity) + 4} textAnchor="end" className="text-[10px] fill-neutral-500 tabular-nums">
              {formatCurrency(maxEquity)}
            </text>
            <text x={padding.left - 8} y={zeroY + 4} textAnchor="end" className="text-[10px] fill-neutral-500 tabular-nums">
              ₹0.00
            </text>
            {minEquity < 0 && (
              <text x={padding.left - 8} y={getY(minEquity) + 4} textAnchor="end" className="text-[10px] fill-rose-500 tabular-nums font-semibold">
                {formatCurrency(minEquity)}
              </text>
            )}

            {/* Nodes on equity curve */}
            {equityPoints.map((p, idx) => (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(p.equity)}
                r="3.5"
                className="fill-white stroke-blue-600 stroke-2 hover:r-5 transition-all"
              >
                <title>{`${p.timestamp}: ${formatCurrency(p.equity)}`}</title>
              </circle>
            ))}
          </svg>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 px-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Net Realized Equity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-neutral-400 inline-block border-dashed" /> High-Water Peak
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[260px] mt-4 flex items-end justify-between gap-2 px-2 border-b border-neutral-200">
          {dailySeries.map((d, idx) => {
            const isPos = d.netPnl >= 0;
            const barHeightPct = Math.min(100, Math.max(8, (Math.abs(d.netPnl) / maxAbsDaily) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-neutral-900 text-white rounded-lg px-2.5 py-1 text-[10px] tabular-nums whitespace-nowrap shadow-md">
                    <p className="font-bold">{d.date}</p>
                    <p className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                      Net: {formatCurrency(d.netPnl)} ({d.tradesCount} trades)
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 bg-neutral-900 rotate-45 -mt-1" />
                </div>

                <div
                  style={{ height: `${barHeightPct}%` }}
                  className={`w-full max-w-[48px] rounded-t-md transition-all ${
                    isPos
                      ? 'bg-emerald-500 group-hover:bg-emerald-600'
                      : 'bg-rose-500 group-hover:bg-rose-600'
                  }`}
                />
                <span className="text-[10px] tabular-nums text-neutral-500 mt-2 truncate w-full text-center">
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
