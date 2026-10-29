'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePositions, useOrders } from '@/hooks/use-queries';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency } from '@/lib/formatters';
import { ShieldAlert, Crosshair, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from 'lucide-react';

export const OpenPositionsTable: React.FC<{ className?: string }> = ({ className }) => {
  const { activeBrokerConnectionId } = useUIStore();
  const { data: positions = [], isLoading: posLoading } = usePositions(activeBrokerConnectionId);
  const { data: orders = [], isLoading: ordersLoading } = useOrders(activeBrokerConnectionId);

  const openPositions = positions.filter((p) => p.quantity !== 0);

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col', className)}>
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Active Positions & Orders</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 tabular-nums">
                {openPositions.length} Open
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Live broker-verified contracts for currently active trading session
            </p>
          </div>
        </div>
      </div>

      {posLoading ? (
        <div className="py-8 text-center text-xs text-neutral-400 animate-pulse">
          Loading broker positions...
        </div>
      ) : openPositions.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 space-y-1">
          <p className="font-medium">No open positions for selected account</p>
          <p className="text-[11px] text-neutral-400">All contracts are squared off or no execution has occurred today.</p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-semibold text-neutral-400 bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">Last Price</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 tabular-nums">
              {openPositions.map((p) => {
                const pnlNum = parseFloat(p.pnl || '0');
                const isProfit = pnlNum >= 0;
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-bold text-neutral-900 font-sans">
                      {p.tradingSymbol}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                        {p.product}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-neutral-800">
                      {p.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-700">
                      ₹{parseFloat(p.averagePrice || '0').toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-800 font-semibold">
                      ₹{parseFloat(p.lastPrice || '0').toFixed(2)}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(p.pnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
