'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useAccountFunds,
  useBrokerConnection,
  useAccountSnapshots,
  useFeeSchedules,
  useImportContractNote,
} from '@/hooks/use-queries';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import { BrokerConnectionState, ContractNoteImportRequest } from '@autotrader/api-contracts';
import {
  Wallet,
  Scale,
  Receipt,
  AlertCircle,
  Info,
  RefreshCw,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FundsPage() {
  const { data: funds, isLoading: fundsLoading, refetch: refetchFunds, isFetching: fundsFetching } = useAccountFunds();
  const { data: broker } = useBrokerConnection();
  const { data: snapshots, refetch: refetchSnapshots, isFetching: snapshotsFetching } = useAccountSnapshots(25);
  const { data: feeSchedules } = useFeeSchedules();

  const importContractNote = useImportContractNote();

  const isBrokerConnected = broker?.state === BrokerConnectionState.CONNECTED;

  // Contract Note Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [contractNoteNumber, setContractNoteNumber] = useState('CN-20261028-001');
  const [tradeDate, setTradeDate] = useState('2026-10-28');
  const [rawEntrySymbol, setRawEntrySymbol] = useState('NIFTY26OCT24500CE');
  const [rawBrokerage, setRawBrokerage] = useState('40.00');
  const [rawSTT, setRawSTT] = useState('1.36');
  const [rawTxn, setRawTxn] = useState('1.10');
  const [rawGST, setRawGST] = useState('7.40');
  const [rawSEBI, setRawSEBI] = useState('0.02');
  const [rawStamp, setRawStamp] = useState('0.03');

  const [importResult, setImportResult] = useState<any | null>(null);

  const handleImportSubmit = () => {
    const payload: ContractNoteImportRequest = {
      contractNoteNumber,
      tradeDate,
      entries: [
        {
          tradingSymbol: rawEntrySymbol,
          side: 'BUY' as any,
          quantity: 25,
          price: '42.50',
          brokerage: rawBrokerage,
          stt: rawSTT,
          exchangeTurnover: rawTxn,
          gst: rawGST,
          sebiCharges: rawSEBI,
          stampDuty: rawStamp,
        },
      ],
    };

    importContractNote.mutate(payload, {
      onSuccess: (data) => {
        setImportResult(data);
      },
      onError: (err) => {
        alert(`Failed to import contract note: ${err.message}`);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1920px] mx-auto">
      <PageHeader
        title="Funds Allocation & Financial Accounting"
        subtitle="Broker-reported margin balances, statutory deductions, contract-note reconciliation, and historical snapshots"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Funds & Charges' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setImportResult(null);
                setImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Import Contract Note
            </button>
            <button
              type="button"
              onClick={() => {
                refetchFunds();
                refetchSnapshots();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', (fundsFetching || snapshotsFetching) && 'animate-spin text-blue-600')} />
              Refresh Balances
            </button>
          </div>
        }
      />

      {/* Account Balances Grid: Explicit Separation of Non-Interchangeable Cash vs Margins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Trading Margin */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Available Trading Margin</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.availableMargin && isBrokerConnected ? formatCurrency(funds.availableMargin) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Net available buying liquidity
          </span>
        </div>

        {/* Card 2: Utilized Margin */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Utilized Margin</span>
            <Scale className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.usedMargin && isBrokerConnected ? formatCurrency(funds.usedMargin) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Blocked in open positions & orders
          </span>
        </div>

        {/* Card 3: Total Account Collateral */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Total Collateral Value</span>
            <Wallet className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.totalCollateral && isBrokerConnected ? formatCurrency(funds.totalCollateral) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Pledged holdings & liquid cash
          </span>
        </div>

        {/* Card 4: Available Cash */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-neutral-600">Unencumbered Cash</span>
            <Receipt className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {funds?.availableCash && isBrokerConnected ? formatCurrency(funds.availableCash) : '—'}
          </p>
          <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
            Freshness: {funds?.freshness ?? 'UNAVAILABLE'}
          </span>
        </div>
      </div>

      {/* Grid: Tariff Schedule vs Historical Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Statutory Tariff Schedule (Version-controlled) */}
        <div className="lg:col-span-12 xl:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
                  Statutory Tariff Schedule & Effective Versions
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  NSE Equity Options tariffs with effective dates (Union Budget revisions tracked)
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Tariff v{(feeSchedules ?? [])[0]?.version ?? '2024.2'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Statutory Charge</th>
                    <th className="py-2.5 px-3">Standard Tariff Rate</th>
                    <th className="py-2.5 px-3">Scope / Effective</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">Brokerage</td>
                    <td className="py-3 px-3 font-mono text-neutral-700">₹20.00 / executed order</td>
                    <td className="py-3 px-3 text-neutral-500">Both Buy and Sell sides</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">Securities Transaction Tax (STT)</td>
                    <td className="py-3 px-3 font-mono text-neutral-700 font-bold text-blue-700">0.100% (Budget 2024 revision)</td>
                    <td className="py-3 px-3 text-neutral-500">Sell premium turnover (from Oct 1, 2024)</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">Exchange Turnover Charge</td>
                    <td className="py-3 px-3 font-mono text-neutral-700">0.0505% (NSE Options)</td>
                    <td className="py-3 px-3 text-neutral-500">Premium turnover</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">Goods & Services Tax (GST)</td>
                    <td className="py-3 px-3 font-mono text-neutral-700">18.00%</td>
                    <td className="py-3 px-3 text-neutral-500">On (Brokerage + Exchange Txn)</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">SEBI Turnover Charges</td>
                    <td className="py-3 px-3 font-mono text-neutral-700">₹10.00 / Crore turnover</td>
                    <td className="py-3 px-3 text-neutral-500">Premium turnover</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-semibold text-neutral-900">Stamp Duty</td>
                    <td className="py-3 px-3 font-mono text-neutral-700">0.003% (₹300 / Crore)</td>
                    <td className="py-3 px-3 text-neutral-500">Buy premium turnover only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>
                <strong>Accounting Invariant:</strong> The platform tracks both confirmed ledger debits from broker contract notes and pending estimates. Estimated charges are never recorded as confirmed deductions.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Historical Account Snapshots Ledger */}
        <div className="lg:col-span-12 xl:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
                  Historical Account Balance Snapshots
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Point-in-time snapshots of cash, margins, and collateral
                </p>
              </div>
              <History className="w-4 h-4 text-neutral-400" />
            </div>

            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp (IST)</th>
                    <th className="py-2.5 px-3 text-right">Avail. Cash</th>
                    <th className="py-2.5 px-3 text-right">Used Margin</th>
                    <th className="py-2.5 px-3 text-right">Avail. Margin</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {!snapshots || snapshots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400 font-sans text-xs">
                        No historical balance snapshots recorded yet.
                      </td>
                    </tr>
                  ) : (
                    snapshots.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                          {formatISTDateTime(s.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          {formatCurrency(s.availableCash)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">
                          {formatCurrency(s.usedMargin)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-bold">
                          {formatCurrency(s.availableMargin)}
                        </td>
                        <td
                          className={cn(
                            'py-2.5 px-3 text-right font-bold',
                            parseFloat(s.realizedPnl) > 0
                              ? 'text-emerald-600'
                              : parseFloat(s.realizedPnl) < 0
                              ? 'text-rose-600'
                              : 'text-neutral-500'
                          )}
                        >
                          {formatCurrency(s.realizedPnl)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Note Import & Discrepancy Reconciliation Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-neutral-900">Import Contract Note & Reconcile</h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {importResult ? (
              <div className="space-y-3 font-sans">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Contract Note Reconciled:</strong> Imported {importResult.importedCount} entries, reconciled {importResult.reconciledCyclesCount} trade cycles.
                    Confirmed deductions: ₹{importResult.totalConfirmedCharges}.
                  </div>
                </div>

                {importResult.discrepanciesCount > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Reconciliation Discrepancies Detected ({importResult.discrepanciesCount})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {importResult.discrepancies.map((d: any, idx: number) => (
                        <div key={idx} className="p-2 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] font-mono">
                          <div>Contract: <strong>{d.tradingSymbol}</strong></div>
                          <div>Estimated: ₹{d.estimatedFee} | Confirmed: ₹{d.confirmedFee} (Diff: ₹{d.difference})</div>
                          <div className="text-[10px] text-amber-700 font-sans">{d.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setImportResult(null);
                      setImportModalOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-500 font-semibold block mb-1">Contract Note Number</label>
                    <input
                      type="text"
                      value={contractNoteNumber}
                      onChange={(e) => setContractNoteNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 font-semibold block mb-1">Trade Date</label>
                    <input
                      type="date"
                      value={tradeDate}
                      onChange={(e) => setTradeDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-500 font-semibold block mb-1">Trading Contract</label>
                  <input
                    type="text"
                    value={rawEntrySymbol}
                    onChange={(e) => setRawEntrySymbol(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-neutral-700 block">Confirmed Fee Breakdown from Broker Note</span>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Brokerage (₹)</span>
                      <input
                        type="text"
                        value={rawBrokerage}
                        onChange={(e) => setRawBrokerage(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">STT (₹)</span>
                      <input
                        type="text"
                        value={rawSTT}
                        onChange={(e) => setRawSTT(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Exch. Txn (₹)</span>
                      <input
                        type="text"
                        value={rawTxn}
                        onChange={(e) => setRawTxn(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">GST (18%) (₹)</span>
                      <input
                        type="text"
                        value={rawGST}
                        onChange={(e) => setRawGST(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">SEBI (₹)</span>
                      <input
                        type="text"
                        value={rawSEBI}
                        onChange={(e) => setRawSEBI(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Stamp Duty (₹)</span>
                      <input
                        type="text"
                        value={rawStamp}
                        onChange={(e) => setRawStamp(e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={importContractNote.isPending}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
                  >
                    {importContractNote.isPending ? 'Reconciling...' : 'Reconcile Contract Note'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
