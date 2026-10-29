import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const alertVariants = cva(
  'relative w-full rounded-2xl border p-4 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        info: 'bg-blue-50/80 border-blue-200 text-blue-900 [&>svg]:text-blue-600',
        warning: 'bg-amber-50/80 border-amber-200 text-amber-900 [&>svg]:text-amber-600',
        destructive: 'bg-rose-50/80 border-rose-200 text-rose-900 [&>svg]:text-rose-600',
        success: 'bg-emerald-50/80 border-emerald-200 text-emerald-900 [&>svg]:text-emerald-600',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', icon, children, ...props }, ref) => {
    const defaultIcon = {
      info: <Info className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />,
      destructive: <AlertCircle className="w-4 h-4" />,
      success: <CheckCircle2 className="w-4 h-4" />,
    }[variant || 'info'];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon ?? defaultIcon}
        <div className="space-y-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('font-bold text-xs leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs opacity-90 leading-relaxed [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
