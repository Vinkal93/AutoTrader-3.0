'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAccountFunds, useBrokerConnection } from '@/hooks/use-queries';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import { BrokerConnectionState } from '@autotrader/api-contracts';
import { Wallet, Scale, Receipt, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function FundsPage() {
  const { data: funds, isLoading, refetch, isFetching } = useAccountFunds();
  const { data: broker } = useBrokerConnection();

  const isBrokerConnected = broker?.state === BrokerConnectionState.CONNECTED;

  const chargesSchedule = [
    { name: 'Brokerage', rate: '₹20.00 / executed order', applicability: 'Both Buy and Sell sides' },
    { name: 'Securities Transaction Tax (STT)', rate: '0.125% (on premium turnover)', applicability: 'Sell transactions only' },
    { name: 'Exchange Turnover Charges', rate: '0.050% (NSE Options)', applicability: 'Turnover value' },
    { name: 'Goods & Services Tax (GST)', rate: '18% on (Brokerage + Txn Charges)', applicability: 'Applicable fees' },
    { name: 'SEBI Turnover Fees', rate: '₹10 / Crore turnover', applicability: 'Exchange turnover' },
    { name: 'Stamp Duty', rate: '0.003% (₹300 / Crore)', applicability: 'Buy transactions only' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funds Allocation & Statutory Charges"
        subtitle="Broker-reported margin balances, collateral values, and transaction fee breakdown"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Funds & Charges' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={!isBrokerConnected}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Balances
          </button>
        }
      />

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Available Trading Margin</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.availableMargin && isBrokerConnected ? formatCurrency(funds.availableMargin) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Liquidity ready for option buying
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Utilized Margin</span>
            <Scale className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.usedMargin && isBrokerConnected ? formatCurrency(funds.usedMargin) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Blocked in open positions & pending orders
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Total Account Collateral</span>
            <Wallet className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.totalCollateral && isBrokerConnected ? formatCurrency(funds.totalCollateral) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Pledged holdings & liquid cash
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Last Broker Sync</span>
            <Receipt className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-sm font-semibold text-neutral-800">
            {funds?.asOf && isBrokerConnected ? formatISTDateTime(funds.asOf) : 'Awaiting Broker'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Freshness: {funds?.freshness ?? 'UNAVAILABLE'}
          </span>
        </div>
      </div>

      {/* Statutory Fee Schedule Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
            Exchange & Statutory Charges Schedule
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tariffs applied to NSE Equity Options trades. The platform tracks both confirmed ledger debits and pending estimates.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Charge Name</th>
                <th className="py-2.5 px-3">Standard Tariff Rate</th>
                <th className="py-2.5 px-3">Transaction Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {chargesSchedule.map((c) => (
                <tr key={c.name} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-3 font-semibold text-neutral-900">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-neutral-700">{c.rate}</td>
                  <td className="py-3 px-3 text-neutral-500">{c.applicability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
