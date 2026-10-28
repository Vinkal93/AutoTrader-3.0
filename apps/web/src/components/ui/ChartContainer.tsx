import React from 'react';
import { cn } from '@/lib/utils';
import { ChartSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { BarChart3 } from 'lucide-react';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  intervals?: string[];
  selectedInterval?: string;
  onIntervalChange?: (interval: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  height?: number;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  intervals = ['1m', '5m', '15m', '1h', '1D'],
  selectedInterval,
  onIntervalChange,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'No chart data available',
  emptyDescription = 'Market data feed is inactive or no historical ticks recorded for this timeframe.',
  height = 320,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {intervals && intervals.length > 0 && onIntervalChange && (
            <div className="flex items-center rounded-lg bg-neutral-100 p-0.5 text-xs font-medium">
              {intervals.map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => onIntervalChange(interval)}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-all',
                    selectedInterval === interval
                      ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  )}
                >
                  {interval}
                </button>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>

      <div style={{ minHeight: height }} className="relative flex items-center justify-center">
        {isLoading ? (
          <ChartSkeleton height={height} className="border-0 p-0 shadow-none" />
        ) : isEmpty || !children ? (
          <EmptyState
            icon={<BarChart3 className="w-8 h-8" />}
            title={emptyTitle}
            description={emptyDescription}
            className="w-full h-full py-12"
          />
        ) : (
          <div className="w-full" style={{ height }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
