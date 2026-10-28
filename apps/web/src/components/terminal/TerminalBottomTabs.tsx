'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  usePositions,
  useOrders,
  useTrades,
  useSystemEvents,
  useCancelOrder,
  useReconcileOrders,
  useFailureModes,
} from '@/hooks/use-queries';
import { OrderLifecycleState } from '@autotrader/api-contracts';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import {
  ListChecks,
  Clock,
  History,
  Activity,
  Layers,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export const TerminalBottomTabs: React.FC<{ className?: string }> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<
    'POSITIONS' | 'PENDING' | 'HISTORY' | 'EXECUTIONS' | 'LIFECYCLE' | 'ALERTS' | 'FAILURE_MODES'
  >('POSITIONS');

  const { data: positions, isLoading: posLoading } = usePositions();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: trades, isLoading: tradesLoading } = useTrades();
  const { data: events, isLoading: eventsLoading } = useSystemEvents(25);
  const { data: failureModes } = useFailureModes();

  const cancelOrder = useCancelOrder();
  const reconcileOrders = useReconcileOrders();

  const pendingOrders = (orders ?? []).filter((o) => o.status === 'OPEN' || o.status === 'PENDING');
  const pastOrders = (orders ?? []).filter((o) => o.status !== 'OPEN' && o.status !== 'PENDING');

  const lifecycleStates: (keyof typeof OrderLifecycleState)[] = [
    'CREATED',
    'VALIDATING',
    'AWAITING_SUBMISSION',
    'SUBMITTING',
    'ACKNOWLEDGED',
    'OPEN',
    'PARTIALLY_FILLED',
    'FILLED',
    'CANCEL_PENDING',
    'CANCELLED',
    'REJECTED',
    'UNKNOWN',
    'RECONCILING',
  ];

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col', className)}>
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-neutral-200 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('POSITIONS')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'POSITIONS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <ListChecks className="w-3.5 h-3.5" />
          Open Positions ({positions?.length ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'PENDING'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Orders ({pendingOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'HISTORY'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <History className="w-3.5 h-3.5" />
          Order History ({pastOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXECUTIONS')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'EXECUTIONS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          Executions ({trades?.length ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LIFECYCLE')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'LIFECYCLE'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Order Lifecycle
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALERTS')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'ALERTS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          System Alerts
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FAILURE_MODES')}
          className={cn(
            'px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'FAILURE_MODES'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Failure Modes & Runbooks ({failureModes?.length ?? 18})
        </button>

        <div className="ml-auto pr-2">
          <button
            type="button"
            onClick={() => reconcileOrders.mutate()}
            disabled={reconcileOrders.isPending}
            className="px-2.5 py-1 text-[11px] font-sans font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
            title="Reconcile broker orders and positions with local database"
          >
            <RefreshCw className={cn('w-3 h-3', reconcileOrders.isPending && 'animate-spin')} />
            {reconcileOrders.isPending ? 'Reconciling...' : 'Reconcile Broker'}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {/* TAB 1: POSITIONS */}
        {activeTab === 'POSITIONS' && (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Avg Entry</th>
                  <th className="py-2 px-3 text-right">LTP</th>
                  <th className="py-2 px-3 text-right">Unrealized P&L</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {posLoading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      Loading positions...
                    </td>
                  </tr>
                ) : !positions || positions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No open positions reported by broker.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const pnl = parseFloat(pos.pnl);
                    return (
                      <tr key={pos.tradingSymbol} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-bold">{pos.tradingSymbol}</td>
                        <td className="py-2.5 px-3 text-right">{pos.quantity}</td>
                        <td className="py-2.5 px-3 text-right">₹{pos.averagePrice}</td>
                        <td className="py-2.5 px-3 text-right font-bold">₹{pos.lastPrice}</td>
                        <td
                          className={cn(
                            'py-2.5 px-3 text-right font-bold',
                            pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-red-600' : 'text-neutral-700'
                          )}
                        >
                          {pnl >= 0 ? '+' : ''}₹{pos.pnl}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-neutral-500">{pos.product}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            className="text-[11px] font-sans font-bold text-rose-600 hover:text-rose-800"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PENDING ORDERS */}
        {activeTab === 'PENDING' && (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2 px-3">Order ID</th>
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Side</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Filled</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No pending or open orders active.
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 text-neutral-500 text-[11px]">{ord.brokerOrderId ?? ord.id.slice(0, 8)}</td>
                      <td className="py-2.5 px-3 font-bold">{ord.tradingSymbol}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-bold uppercase',
                            ord.side === 'BUY' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          )}
                        >
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">{ord.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{ord.filledQuantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{ord.price}</td>
                      <td className="py-2.5 px-3 font-sans text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Cancel order ${ord.id.slice(0, 8)}?`)) {
                              cancelOrder.mutate({ orderId: ord.id });
                            }
                          }}
                          disabled={cancelOrder.isPending}
                          className="text-[11px] font-sans font-bold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: ORDER HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2 px-3">Placed At</th>
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Side</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Fill Avg</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Message / Rejection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {pastOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No past completed or cancelled orders.
                    </td>
                  </tr>
                ) : (
                  pastOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 text-neutral-500 text-[11px] font-sans">
                        {formatISTDateTime(ord.placedAt)}
                      </td>
                      <td className="py-2 px-3 font-bold">{ord.tradingSymbol}</td>
                      <td className="py-2 px-3">{ord.side}</td>
                      <td className="py-2 px-3 text-right">{ord.quantity}</td>
                      <td className="py-2 px-3 text-right">
                        {ord.averageFilledPrice ? `₹${ord.averageFilledPrice}` : '—'}
                      </td>
                      <td className="py-2 px-3 font-sans text-[11px]">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full font-semibold border',
                            ord.status === 'FILLED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'CANCELLED'
                              ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          )}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-[11px] text-neutral-500 truncate max-w-xs">
                        {ord.statusMessage ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: TRADE EXECUTIONS */}
        {activeTab === 'EXECUTIONS' && (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2 px-3">Execution Time</th>
                  <th className="py-2 px-3">Trade Ref</th>
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Side</th>
                  <th className="py-2 px-3 text-right">Quantity</th>
                  <th className="py-2 px-3 text-right">Fill Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {!trades || trades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No confirmed fill executions today.
                    </td>
                  </tr>
                ) : (
                  trades.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 text-neutral-500 font-sans text-[11px]">
                        {formatISTDateTime(t.tradeTime)}
                      </td>
                      <td className="py-2 px-3 text-neutral-500">{t.brokerTradeId}</td>
                      <td className="py-2 px-3 font-bold">{t.tradingSymbol}</td>
                      <td className="py-2 px-3">{t.side}</td>
                      <td className="py-2 px-3 text-right">{t.quantity}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">₹{t.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: ORDER LIFECYCLE STATE MACHINE (Task 9) */}
        {activeTab === 'LIFECYCLE' && (
          <div className="p-3 space-y-3 font-sans text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-neutral-900">13-State Order Execution Lifecycle</h4>
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Every prospective trade intent executes through this deterministic state machine. Orders with uncertain outcomes enter <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">RECONCILING</code> before retry.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {lifecycleStates.map((st, i) => (
                <div
                  key={st}
                  className="flex items-center gap-1.5 p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs font-semibold text-neutral-800">{st}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM ALERTS */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-2 select-none">
            {!events || events.length === 0 ? (
              <div className="py-6 text-center text-neutral-400 font-sans text-xs">
                No system or risk alerts logged.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-2.5 text-xs font-sans"
                >
                  <div className="mt-0.5">
                    {ev.severity === 'CRITICAL' || ev.severity === 'ERROR' ? (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    ) : ev.severity === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{ev.category}</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {formatISTDateTime(ev.timestamp)}
                      </span>
                    </div>
                    <p className="text-neutral-600 mt-0.5">{ev.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 7: FAILURE MODES & RECOVERY RUNBOOKS */}
        {activeTab === 'FAILURE_MODES' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Phase 5 High-Availability Failure Catalog:</strong> 18 automated safety
                protections, single-authority exit transitions, and manual disaster recovery runbooks.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(failureModes ?? []).map((fm) => (
                <div
                  key={fm.scenarioId}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800">
                      {fm.scenarioId}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {fm.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 leading-snug">{fm.title}</h4>
                  <div className="text-[11px] text-neutral-600">
                    <strong className="text-neutral-700">Trigger:</strong> {fm.triggerCondition}
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
                    <strong>Auto Action:</strong> {fm.automaticAction}
                  </div>
                  <div className="text-[11px] text-neutral-700 bg-neutral-100/70 p-1.5 rounded border border-neutral-200 font-mono">
                    <strong>Runbook:</strong> {fm.recoveryRunbook}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
