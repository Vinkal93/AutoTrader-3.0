import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200/80', className)}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-8 w-36" />
          <div className="pt-2 border-t border-neutral-100 flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 5,
  className,
}) => {
  return (
    <div className={cn('w-full border border-neutral-200 rounded-xl bg-white overflow-hidden', className)}>
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number; className?: string }> = ({
  height = 300,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full border border-neutral-200 rounded-xl bg-white p-6 space-y-4',
        className
      )}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
      <div
        style={{ height }}
        className="w-full bg-neutral-50 rounded-lg flex items-end justify-between p-6 gap-2"
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const heights = ['35%', '60%', '45%', '80%', '55%', '90%', '70%', '40%', '65%', '85%', '50%', '75%'];
          return (
            <Skeleton
              key={i}
              style={{ height: heights[i % heights.length] }}
              className="w-full rounded-t"
            />
          );
        })}
      </div>
    </div>
  );
};
