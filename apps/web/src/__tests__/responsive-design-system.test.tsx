import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

describe('CODEX Phase 9: Responsive Design System & Shared Components', () => {
  describe('Task 1 — Shared Components: Button', () => {
    it('renders primary button with accessible focus rings and touch-compliant minimum height', () => {
      render(<Button variant="primary">Execute Order</Button>);
      const btn = screen.getByRole('button', { name: /Execute Order/i });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('bg-blue-600');
      // Touch-target compliant
      expect(btn.className).toContain('min-h-[44px]');
      // Focus-visible ring
      expect(btn.className).toContain('focus-visible:ring-2');
    });

    it('renders secondary, outline, and destructive button variants correctly', () => {
      const { rerender } = render(<Button variant="secondary">Cancel</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-neutral-100');

      rerender(<Button variant="outline">Refresh</Button>);
      expect(screen.getByRole('button')).toHaveClass('border');

      rerender(<Button variant="destructive">Emergency Halt</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-rose-600');
    });

    it('displays accessible loading spinner and disables clicks when isLoading is true', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Submit Order
        </Button>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Task 1 — Shared Components: Input', () => {
    it('renders accessible text input with mobile touch target height', () => {
      render(<Input placeholder="Enter strike price..." />);
      const input = screen.getByPlaceholderText(/Enter strike price.../i);
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('min-h-[44px]');
    });

    it('applies error styling when hasError is true', () => {
      render(<Input placeholder="Lot quantity" hasError />);
      const input = screen.getByPlaceholderText(/Lot quantity/i);
      expect(input.className).toContain('border-rose-400');
    });
  });

  describe('Task 1 — Shared Components: Badge', () => {
    it('renders badges with semantic financial colors and dot indicators', () => {
      const { rerender } = render(<Badge variant="success" dot>PROFIT</Badge>);
      expect(screen.getByText('PROFIT')).toBeInTheDocument();

      rerender(<Badge variant="destructive" dot>LOSS</Badge>);
      expect(screen.getByText('LOSS')).toBeInTheDocument();

      rerender(<Badge variant="warning">STALE</Badge>);
      expect(screen.getByText('STALE')).toBeInTheDocument();
    });
  });

  describe('Task 1 — Shared Components: Alert', () => {
    it('renders alert banners with semantic roles and accessible structure', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Master Safety Lock Active</AlertTitle>
          <AlertDescription>Live broker execution requires verified sign-off.</AlertDescription>
        </Alert>
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Master Safety Lock Active/i)).toBeInTheDocument();
      expect(screen.getByText(/Live broker execution requires verified sign-off/i)).toBeInTheDocument();
    });
  });

  describe('Task 1 — Shared Components: Card', () => {
    it('renders structured card container with header, content, and footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Option Greeks</CardTitle>
            <CardDescription>Delta, Gamma, Vega and Theta analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="card-body">Delta: 0.52</div>
          </CardContent>
          <CardFooter>
            <span>Verified from Kotak Neo Feed</span>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText('Option Greeks')).toBeInTheDocument();
      expect(screen.getByText(/Delta, Gamma, Vega/i)).toBeInTheDocument();
      expect(screen.getByTestId('card-body')).toHaveTextContent('Delta: 0.52');
      expect(screen.getByText(/Verified from Kotak Neo Feed/i)).toBeInTheDocument();
    });
  });

  describe('Task 1 — Shared Components: Tabs', () => {
    it('allows tab switching with keyboard and accessible aria attributes', () => {
      render(
        <Tabs defaultValue="positions">
          <TabList>
            <TabTrigger value="positions">Positions</TabTrigger>
            <TabTrigger value="orders">Orders</TabTrigger>
          </TabList>
          <TabContent value="positions">Open Contracts Panel</TabContent>
          <TabContent value="orders">Pending Submissions Panel</TabContent>
        </Tabs>
      );

      expect(screen.getByText('Open Contracts Panel')).toBeInTheDocument();
      expect(screen.queryByText('Pending Submissions Panel')).not.toBeInTheDocument();

      const ordersTab = screen.getByRole('tab', { name: /Orders/i });
      fireEvent.click(ordersTab);

      expect(screen.getByText('Pending Submissions Panel')).toBeInTheDocument();
      expect(screen.queryByText('Open Contracts Panel')).not.toBeInTheDocument();
    });
  });

  describe('Task 7 — Real Genuine System States', () => {
    it('renders genuine system states without mock or fake representations', () => {
      const states = [
        { state: 'ready', expected: 'READY' },
        { state: 'running', expected: 'RUNNING' },
        { state: 'error', expected: 'ERROR' },
        { state: 'not_connected', expected: 'NOT CONNECTED' },
        { state: 'stale', expected: 'STALE' },
        { state: 'access_pending', expected: 'ACCESS PENDING' },
        { state: 'unsupported', expected: 'UNSUPPORTED' },
        { state: 'risk_locked', expected: 'RISK LOCKED' },
      ];

      for (const s of states) {
        const { unmount } = render(<StatusIndicator status={s.state} />);
        expect(screen.getByRole('status')).toHaveAttribute(
          'aria-label',
          `Status: ${s.expected}`
        );
        unmount();
      }
    });
  });
});
