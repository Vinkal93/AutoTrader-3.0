import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusIndicator } from '../components/ui/StatusIndicator';

describe('StatusIndicator', () => {
  it('renders connected status correctly with aria-label', () => {
    render(<StatusIndicator status="connected" />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Status: CONNECTED');
    expect(screen.getByText('CONNECTED')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<StatusIndicator status="running" label="EXECUTION ACTIVE" />);

    expect(screen.getByText('EXECUTION ACTIVE')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: EXECUTION ACTIVE');
  });

  it('renders risk locked state with appropriate label', () => {
    render(<StatusIndicator status="risk_locked" />);

    expect(screen.getByText('RISK LOCKED')).toBeInTheDocument();
  });

  it('renders degraded state', () => {
    render(<StatusIndicator status="degraded" />);

    expect(screen.getByText('DEGRADED')).toBeInTheDocument();
  });

  it('renders disconnected state', () => {
    render(<StatusIndicator status="disconnected" />);

    expect(screen.getByText('DISCONNECTED')).toBeInTheDocument();
  });
});
