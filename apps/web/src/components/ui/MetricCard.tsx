import React from 'react';
import { cn } from '@/lib/utils';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { DataFreshness } from '@autotrader/api-contracts';

export interface MetricCardProps {
  title: string;
  value: string | number | null | undefined;
  formattedValue?: string;
  change?: number | string | null;
  changePercent?: number | string | null;
  changeDirection?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  freshness?: DataFreshness | 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
  asOf?: string | null;
  icon?: React.ReactNode;
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'highlight' | 'danger' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  formattedValue,
  change,
  changePercent,
  changeDirection,
  timeframe,
  freshness,
  asOf,
  icon,
  tooltip,
  isLoading = false,
  className,
  variant = 'default',
}) => {
  // Compute display value
  const displayVal = formattedValue ?? (value !== null && value !== undefined && value !== '' ? String(value) : '—');
  const isNoData = displayVal === '—' || displayVal === 'No Data';

  // Determine direction if not explicitly supplied
  let computedDirection: 'up' | 'down' | 'neutral' = changeDirection ?? 'neutral';
  if (!changeDirection && change !== undefined && change !== null) {
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (!Number.isNaN(numChange)) {
      if (numChange > 0) computedDirection = 'up';
      else if (numChange < 0) computedDirection = 'down';
    }
  }

  const changeColor = {
    up: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    down: 'text-rose-600 bg-rose-50 border-rose-200',
    neutral: 'text-neutral-500 bg-neutral-100 border-neutral-200',
  }[computedDirection];

  const ChangeIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[computedDirection];

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden',
        variant === 'highlight' && 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-white',
        variant === 'danger' && 'border-rose-200 bg-rose-50/20',
        variant === 'success' && 'border-emerald-200 bg-emerald-50/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-sm font-medium text-neutral-500 mb-2">
        <div className="flex items-center gap-1.5">
          <span>{title}</span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-neutral-400 hover:text-neutral-600">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {icon && <div className="text-neutral-400">{icon}</div>}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 my-1">
        {isLoading ? (
          <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded" />
        ) : (
          <span
            className={cn(
              'text-2xl font-bold tracking-tight tabular-nums',
              isNoData ? 'text-neutral-400' : 'text-neutral-900'
            )}
          >
            {displayVal}
          </span>
        )}
      </div>

      {/* Footer / Change / Freshness */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-100">
        {(change !== undefined && change !== null) || (changePercent !== undefined && changePercent !== null) ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border',
              changeColor
            )}
          >
            <ChangeIcon className="w-3 h-3" />
            {changePercent !== undefined && changePercent !== null ? (
              <span>{String(changePercent)}</span>
            ) : (
              <span>{String(change)}</span>
            )}
            {timeframe && <span className="font-normal opacity-75">{timeframe}</span>}
          </div>
        ) : (
          <div />
        )}

        {freshness && (
          <DataFreshnessIndicator freshness={freshness} asOf={asOf} />
        )}
      </div>
    </div>
  );
};
