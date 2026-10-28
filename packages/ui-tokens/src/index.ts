// ============================================
// NIFTY Auto Trader 3.0 — UI Design Tokens
// ============================================

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-mono), "JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  fontSize: {
    '2xs': '0.6875rem',
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Semantic tokens for financial data
export const financeTokens = {
  profit: colors.success[600],
  loss: colors.danger[600],
  neutral: colors.neutral[500],
  buy: colors.success[600],
  sell: colors.danger[600],
} as const;

// Status indicator tokens
export const statusTokens = {
  connected: colors.success[500],
  disconnected: colors.neutral[400],
  error: colors.danger[500],
  warning: colors.warning[500],
  loading: colors.primary[400],
} as const;

// Copy / Labels — centralized UI text
export const labels = {
  app: {
    name: 'NIFTY Auto Trader',
    shortName: 'AutoTrader',
    version: '3.0',
  },
  states: {
    notConnected: 'Not Connected',
    notConfigured: 'Not Configured',
    notAvailable: 'Not Available',
    loading: 'Loading...',
    noData: 'No Data',
    stale: 'Stale Data',
    live: 'Live',
    error: 'Error',
  },
  trading: {
    off: 'Trading Off',
    paper: 'Paper Trading',
    live: 'Live Trading',
  },
  currency: {
    symbol: '₹',
    code: 'INR',
  },
} as const;
