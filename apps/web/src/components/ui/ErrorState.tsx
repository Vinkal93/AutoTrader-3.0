import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  details?: Record<string, unknown> | string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  details,
  onRetry,
  isRetrying = false,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formattedDetails = details
    ? typeof details === 'string'
      ? details
      : JSON.stringify(details, null, 2)
    : null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50/60 p-5 text-rose-900',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-800">{title}</h4>
          <p className="text-sm text-rose-700 mt-0.5 leading-relaxed">{message}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isRetrying && 'animate-spin')} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}

            {formattedDetails && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900 underline underline-offset-2"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Hide error details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Show technical details
                  </>
                )}
              </button>
            )}
          </div>

          {showDetails && formattedDetails && (
            <pre className="mt-3 p-3 bg-white/80 border border-rose-200 rounded-md text-xs font-mono text-neutral-800 overflow-x-auto max-h-48">
              {formattedDetails}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
