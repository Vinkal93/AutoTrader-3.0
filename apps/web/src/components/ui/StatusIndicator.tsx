import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'loading'
  | 'degraded'
  | 'warning'
  | 'ready'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'risk_locked';

export interface StatusIndicatorProps {
  status: StatusType | string;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColorMap: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  connected: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  running: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  ready: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  loading: {
    dot: 'bg-blue-500 animate-spin',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  degraded: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  paused: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  disconnected: {
    dot: 'bg-neutral-400',
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
  },
  stopped: {
    dot: 'bg-neutral-400',
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
  },
  error: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  risk_locked: {
    dot: 'bg-rose-600',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse,
  size = 'md',
  className,
}) => {
  const normalizedStatus = status.toLowerCase();
  const theme = statusColorMap[normalizedStatus] || statusColorMap.disconnected;
  const isPulseActive = pulse ?? (normalizedStatus === 'running' || normalizedStatus === 'connected');

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  const badgeSize = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5',
  }[size];

  const displayText = label ?? (status.replace(/_/g, ' ').toUpperCase());

  return (
    <span
      role="status"
      aria-label={`Status: ${displayText}`}
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        theme.bg,
        theme.text,
        theme.border,
        badgeSize,
        className
      )}
    >
      <span className="relative flex items-center justify-center">
        {isPulseActive && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              theme.dot
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', theme.dot, dotSize)} />
      </span>
      <span>{displayText}</span>
    </span>
  );
};
