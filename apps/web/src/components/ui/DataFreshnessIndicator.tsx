import React from 'react';
import { cn } from '@/lib/utils';
import { DataFreshness } from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';

export interface DataFreshnessIndicatorProps {
  freshness?: DataFreshness | 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
  asOf?: string | null;
  showTimestamp?: boolean;
  className?: string;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  freshness = 'UNAVAILABLE',
  asOf,
  showTimestamp = true,
  className,
}) => {
  const config = {
    [DataFreshness.LIVE]: {
      label: 'Live',
      dotColor: 'bg-emerald-500',
      pulse: true,
      textColor: 'text-emerald-700',
    },
    [DataFreshness.RECENT]: {
      label: 'Recent',
      dotColor: 'bg-emerald-600',
      pulse: false,
      textColor: 'text-emerald-700',
    },
    [DataFreshness.STALE]: {
      label: 'Stale',
      dotColor: 'bg-amber-500',
      pulse: false,
      textColor: 'text-amber-700',
    },
    [DataFreshness.UNAVAILABLE]: {
      label: 'Unavailable',
      dotColor: 'bg-neutral-400',
      pulse: false,
      textColor: 'text-neutral-500',
    },
  }[freshness] || {
    label: 'Unavailable',
    dotColor: 'bg-neutral-400',
    pulse: false,
    textColor: 'text-neutral-500',
  };

  const formattedTime = asOf ? formatISTDateTime(asOf, { timeOnly: true }) : null;

  return (
    <div
      role="status"
      aria-label={`Data freshness: ${config.label}${formattedTime ? ` at ${formattedTime}` : ''}`}
      className={cn('inline-flex items-center gap-1.5 text-xs text-neutral-500', className)}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.dotColor
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.dotColor)} />
      </span>
      <span className={cn('font-medium', config.textColor)}>{config.label}</span>
      {showTimestamp && formattedTime && (
        <span className="text-neutral-400 tabular-nums">({formattedTime})</span>
      )}
    </div>
  );
};
