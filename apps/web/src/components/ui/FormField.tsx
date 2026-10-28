import React from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  id?: string;
  label: string;
  error?: string | null;
  helperText?: string;
  tooltip?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  helperText,
  tooltip,
  required = false,
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-neutral-800 flex items-center gap-1.5"
        >
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-neutral-400 hover:text-neutral-600">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </label>
      </div>

      <div>{children}</div>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-600 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-neutral-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
