/**
 * Financial and Date/Time formatters for NIFTY Auto Trader 3.0
 * Adheres strictly to Honest Data Representation:
 * Never fabricated, returns fallback '—' when data is null, undefined, or empty.
 */

export interface FormatCurrencyOptions {
  fallback?: string;
  showSign?: boolean;
  fractionDigits?: number;
}

export function formatCurrency(
  value: string | number | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const { fallback = '—', showSign = false, fractionDigits = 2 } = options;

  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return fallback;
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return fallback;
  }

  const sign = showSign && num > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);

  return sign ? `${sign}${formatted}` : formatted;
}

export function formatNumber(
  value: string | number | null | undefined,
  options: { fallback?: string; fractionDigits?: number; showSign?: boolean } = {}
): string {
  const { fallback = '—', fractionDigits = 2, showSign = false } = options;

  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return fallback;
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return fallback;
  }

  const sign = showSign && num > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);

  return `${sign}${formatted}`;
}

export function formatPercentage(
  value: string | number | null | undefined,
  options: { fallback?: string; fractionDigits?: number; showSign?: boolean } = {}
): string {
  const { fallback = '—', fractionDigits = 2, showSign = true } = options;

  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return fallback;
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return fallback;
  }

  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(fractionDigits)}%`;
}

export function formatISTDateTime(
  isoDate: string | null | undefined,
  options: { fallback?: string; timeOnly?: boolean; dateOnly?: boolean } = {}
): string {
  const { fallback = '—', timeOnly = false, dateOnly = false } = options;

  if (!isoDate) {
    return fallback;
  }

  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }

    if (timeOnly) {
      return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    if (dateOnly) {
      return date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' IST';
  } catch {
    return fallback;
  }
}
