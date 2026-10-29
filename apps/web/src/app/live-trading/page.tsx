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
        subtitle="Multi-broker execution cockpit: Real-time option depth, canonical trend analysis, margin preview, and gated order routing"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Live Trading Terminal' },
        ]}
      />

      {/* Terminal Top Control Bar: Account Context, NIFTY Quote, Mode Switcher, Emergency Halt */}
      <TerminalHeader />

      {/* Main Terminal Grid: Left (Chart & Scanner) | Center (Option Chain Depth) | Right (Trade Ticket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Candlestick Chart with Canonical Trend & Premium Scanner */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <TerminalChart />
          <SmartPremiumScannerCard
            onSelectCandidate={(cand) => setSelectedContract(cand)}
          />
        </div>

        {/* Center Column: Option Chain Depth with Strike Search & Greeks */}
        <div className="lg:col-span-7 xl:col-span-4 space-y-4">
          <OptionChainTable
            selectedToken={selectedContract?.instrumentToken}
            onSelectContract={(contract) => setSelectedContract(contract)}
          />
        </div>

        {/* Right Column: Multi-Broker Trade Ticket with Margin Preview & Fee Breakdown */}
        <div className="lg:col-span-5 xl:col-span-3">
          <TradeTicket selectedContract={selectedContract} />
        </div>
      </div>

      {/* Bottom Area: Tabbed Positions, Orders, Executions, Order Event Timeline, Lifecycle State Machine */}
      <TerminalBottomTabs />
    </div>
  );
}
