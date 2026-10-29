import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center font-semibold rounded-full border transition-colors select-none tracking-wide uppercase',
  {
    variants: {
      variant: {
        default:
          'bg-blue-50 text-blue-700 border-blue-200',
        secondary:
          'bg-neutral-100 text-neutral-700 border-neutral-200',
        success:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        destructive:
          'bg-rose-50 text-rose-700 border-rose-200',
        warning:
          'bg-amber-50 text-amber-800 border-amber-200',
        outline:
          'text-neutral-700 border-neutral-300 bg-transparent',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-0.5 gap-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-emerald-500',
            variant === 'destructive' && 'bg-rose-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'default' && 'bg-blue-500',
            variant === 'secondary' && 'bg-neutral-400',
            variant === 'outline' && 'bg-neutral-500'
          )}
        />
      )}
      {children}
    </span>
  );
};
