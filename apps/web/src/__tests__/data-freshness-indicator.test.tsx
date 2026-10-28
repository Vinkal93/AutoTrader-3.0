import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DataFreshnessIndicator } from '../components/ui/DataFreshnessIndicator';
import { DataFreshness } from '@autotrader/api-contracts';

describe('DataFreshnessIndicator', () => {
  it('renders LIVE freshness with pulse indicator', () => {
    render(<DataFreshnessIndicator freshness={DataFreshness.LIVE} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Data freshness: Live');
  });

  it('renders STALE freshness with warning label', () => {
    render(<DataFreshnessIndicator freshness={DataFreshness.STALE} />);

    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Data freshness: Stale');
  });

  it('renders UNAVAILABLE freshness when offline', () => {
    render(<DataFreshnessIndicator freshness={DataFreshness.UNAVAILABLE} />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('formats and displays timestamp when provided', () => {
    const timestamp = '2026-10-28T09:30:00Z';
    render(
      <DataFreshnessIndicator
        freshness={DataFreshness.RECENT}
        asOf={timestamp}
        showTimestamp={true}
      />
    );

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
