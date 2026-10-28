import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';

describe('MetricCard', () => {
  it('renders "—" honestly when value is null or undefined (TASK 10 strict)', () => {
    render(<MetricCard title="Available Margin" value={null} />);

    expect(screen.getByText('Available Margin')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders "—" when value is empty string', () => {
    render(<MetricCard title="Realized P&L" value="" />);

    expect(screen.getByText('Realized P&L')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders valid formatted financial value when present', () => {
    render(
      <MetricCard
        title="NIFTY 50 Spot"
        value={24850.5}
        formattedValue="₹24,850.50"
      />
    );

    expect(screen.getByText('NIFTY 50 Spot')).toBeInTheDocument();
    expect(screen.getByText('₹24,850.50')).toBeInTheDocument();
  });

  it('renders change percentage with up/down direction', () => {
    render(
      <MetricCard
        title="NIFTY 50 Spot"
        value={24850}
        changePercent="+1.25%"
        changeDirection="up"
      />
    );

    expect(screen.getByText('+1.25%')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <MetricCard title="Loading Metric" value={null} isLoading={true} />
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
