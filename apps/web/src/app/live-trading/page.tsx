'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { TerminalChart } from '@/components/terminal/TerminalChart';
import { OptionChainTable, SelectedOptionContract } from '@/components/terminal/OptionChainTable';
import { SmartPremiumScannerCard } from '@/components/terminal/SmartPremiumScannerCard';
import { TradeTicket } from '@/components/terminal/TradeTicket';
import { TerminalBottomTabs } from '@/components/terminal/TerminalBottomTabs';

export default function LiveTradingTerminalPage() {
  const [selectedContract, setSelectedContract] = useState<SelectedOptionContract | null>(null);

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto pb-10">
      {/* Page Header */}
      <PageHeader
        title="Live Trading Terminal"
        subtitle="Real-time market depth, smart premium scanner, canonical trend analysis, and safely gated trade controls"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Live Trading Terminal' },
        ]}
      />

      {/* Terminal Top Control Bar */}
      <TerminalHeader />

      {/* Main Terminal Grid: Left (Chart) | Center (Scanner & Option Chain) | Right (Trade Ticket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Candlestick Chart with Canonical Trend */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <TerminalChart />
          <SmartPremiumScannerCard
            onSelectCandidate={(cand) => setSelectedContract(cand)}
          />
        </div>

        {/* Center Column: Option Chain Depth */}
        <div className="lg:col-span-7 xl:col-span-4 space-y-4">
          <OptionChainTable
            selectedToken={selectedContract?.instrumentToken}
            onSelectContract={(contract) => setSelectedContract(contract)}
          />
        </div>

        {/* Right Column: Trade Ticket with Pre-flight Fee Validation */}
        <div className="lg:col-span-5 xl:col-span-3">
          <TradeTicket selectedContract={selectedContract} />
        </div>
      </div>

      {/* Bottom Area: Tabbed Positions, Orders, Tradebook, Lifecycle State Machine, and System Alerts */}
      <TerminalBottomTabs />
    </div>
  );
}
