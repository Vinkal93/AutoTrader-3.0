'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useValidateOrder, useSubmitOrder } from '@/hooks/use-queries';
import { OptionType, OrderSide, OrderType, TradingMode } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Receipt,
  XCircle,
} from 'lucide-react';
import { SelectedOptionContract } from './OptionChainTable';

interface TradeTicketProps {
  selectedContract: SelectedOptionContract | null;
  className?: string;
}

export const TradeTicket: React.FC<TradeTicketProps> = ({ selectedContract, className }) => {
  const [lotCount, setLotCount] = useState<number>(1);
  const [intendedPrice, setIntendedPrice] = useState<string>('42.50');
  const [targetMove, setTargetMove] = useState<string>('1.00');
  const [stopLossMove, setStopLossMove] = useState<string>('3.00');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [simulatedOrderSuccess, setSimulatedOrderSuccess] = useState(false);

  const validateOrder = useValidateOrder();
  const submitOrder = useSubmitOrder();

  // Sync price when new contract selected
  useEffect(() => {
    if (selectedContract) {
      setIntendedPrice(selectedContract.askPrice.toFixed(2));
    }
  }, [selectedContract]);

  const lotSize = selectedContract?.lotSize ?? 25;
  const quantity = lotCount * lotSize;

  const priceNum = parseFloat(intendedPrice) || 0;
  const targetMoveNum = parseFloat(targetMove) || 1.0;
  const slMoveNum = parseFloat(stopLossMove) || 3.0;

  // Tick-aligned target and SL
  const targetPrice = (Math.round((priceNum + targetMoveNum) / 0.05) * 0.05).toFixed(2);
  const stopLossPrice = (Math.max(0.05, Math.round((priceNum - slMoveNum) / 0.05) * 0.05)).toFixed(2);

  // Trigger validation mutation whenever inputs change
  useEffect(() => {
    if (selectedContract && priceNum > 0) {
      validateOrder.mutate({
        instrumentToken: selectedContract.instrumentToken,
        tradingSymbol: selectedContract.tradingSymbol,
        optionType: selectedContract.optionType,
        side: OrderSide.BUY,
        quantity,
        price: intendedPrice,
        targetPrice,
        stopLossPrice,
      });
    }
  }, [selectedContract, lotCount, intendedPrice, targetPrice, stopLossPrice, priceNum, quantity, validateOrder]);

  const validation = validateOrder.data;

  const handleSimulatedSubmit = () => {
    if (!selectedContract) return;
    submitOrder.mutate(
      {
        tradingSymbol: selectedContract.tradingSymbol,
        exchange: 'NFO' as any,
        side: OrderSide.BUY,
        orderType: OrderType.LIMIT,
        quantity,
        price: intendedPrice,
        tradingMode: TradingMode.PAPER,
      },
      {
        onSuccess: () => {
          setSimulatedOrderSuccess(true);
          setConfirmModalOpen(false);
          setTimeout(() => setSimulatedOrderSuccess(false), 5000);
        },
        onError: (err) => {
          alert(`Order submission failed: ${err.message}`);
          setConfirmModalOpen(false);
        },
      }
    );
  };

  if (!selectedContract) {
    return (
      <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col justify-between', className)}>
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <FileText className="w-4 h-4 text-neutral-500" />
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Order Ticket</h3>
        </div>

        <div className="my-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-sm text-neutral-800">No Contract Selected</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Select an option from the Smart Premium Scanner or NIFTY Option Chain to inspect the order ticket, margin requirements, and fee calculations.
          </p>
        </div>

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 text-center font-mono">
          Ready for contract selection
        </div>
      </div>
    );
  }

  const isCE = selectedContract.optionType === OptionType.CE;

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between space-y-4', className)}>
      {/* Ticket Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-500" />
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Trade Ticket</h3>
          </div>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border',
              isCE ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            )}
          >
            BUY {selectedContract.optionType}
          </span>
        </div>

        {/* Selected Instrument Pill */}
        <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold font-mono text-sm text-neutral-900">
              {selectedContract.tradingSymbol}
            </span>
            <span className="text-[11px] font-mono font-semibold text-neutral-500">
              Expiry: {selectedContract.expiryDate}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-neutral-600">
            <span>Bid: ₹{selectedContract.bidPrice.toFixed(2)} ({selectedContract.bidQuantity})</span>
            <span>•</span>
            <span>Ask: <strong className="text-neutral-900">₹{selectedContract.askPrice.toFixed(2)}</strong> ({selectedContract.askQuantity})</span>
          </div>
        </div>
      </div>

      {/* Order Sizing & Parameters */}
      <div className="space-y-3 text-xs font-sans">
        {/* Lot Sizing Stepper */}
        <div className="flex items-center justify-between">
          <span className="text-neutral-600 font-medium">Position Size</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 font-mono text-xs">
              <button
                type="button"
                onClick={() => setLotCount(Math.max(1, lotCount - 1))}
                className="w-6 h-6 rounded bg-white hover:bg-neutral-50 text-neutral-700 font-bold transition-all shadow-2xs"
              >
                -
              </button>
              <span className="px-2.5 font-bold text-neutral-900">{lotCount} Lot ({quantity} Qty)</span>
              <button
                type="button"
                onClick={() => setLotCount(lotCount + 1)}
                className="w-6 h-6 rounded bg-white hover:bg-neutral-50 text-neutral-700 font-bold transition-all shadow-2xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Intended Entry Limit Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-neutral-600 font-medium block">Intended Entry Limit</span>
            <span className="text-[10px] text-neutral-400">Executable Ask price</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span>₹</span>
            <input
              type="text"
              value={intendedPrice}
              onChange={(e) => setIntendedPrice(e.target.value)}
              className="w-20 p-1 text-right bg-neutral-50 border border-neutral-200 rounded font-bold text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Target Movement & Calculated Price */}
        <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1 font-mono">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-semibold text-xs font-sans">Target Move (+₹{targetMove})</span>
            <span className="font-bold text-xs">Target: ₹{targetPrice}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-700">
            <span>Gross Gain: +₹{validation?.estimatedGrossProfit ?? '25.00'}</span>
            <span>Net Gain: {validation?.estimatedNetProfit ? `₹${validation.estimatedNetProfit}` : '—'}</span>
          </div>
        </div>

        {/* Stop Loss Movement & Calculated Price */}
        <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1 font-mono">
          <div className="flex items-center justify-between text-rose-800">
            <span className="font-semibold text-xs font-sans">Stop Loss (-₹{stopLossMove})</span>
            <span className="font-bold text-xs">SL Trigger: ₹{stopLossPrice}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-rose-700">
            <span>Gross Loss: -₹{validation?.estimatedGrossLoss ?? '75.00'}</span>
            <span>Net Max Loss: {validation?.estimatedNetLoss ? `₹${validation.estimatedNetLoss}` : '—'}</span>
          </div>
          <p className="text-[10px] text-rose-600/90 font-sans italic pt-0.5">
            Notice: Stop-Loss Limit (SL-L) orders do not guarantee execution or a fixed maximum loss in fast gap-down markets.
          </p>
        </div>

        {/* Itemized Statutory Fee Estimates */}
        {validation && (
          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] space-y-1 font-mono text-neutral-600">
            <div className="flex items-center justify-between font-bold text-neutral-800">
              <span className="font-sans">Estimated Statutory Deductions:</span>
              <span>-₹{validation.estimatedCharges.totalCharges}</span>
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Brokerage: ₹{validation.estimatedCharges.brokerage}</span>
              <span>STT: ₹{validation.estimatedCharges.stt}</span>
              <span>GST: ₹{validation.estimatedCharges.gst}</span>
            </div>
          </div>
        )}

        {/* Fee Warning Alert */}
        {validation?.warnings && validation.warnings.length > 0 && (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
            <span>{validation.warnings[validation.warnings.length - 1]}</span>
          </div>
        )}

        {/* Simulation Success Feedback */}
        {simulatedOrderSuccess && (
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Paper Order Submitted to Virtual Matching Engine</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs font-mono pb-1">
          <span className="text-neutral-500">Capital Required:</span>
          <span className="font-bold text-sm text-neutral-900">
            {validation ? formatCurrency(validation.requiredMargin) : '—'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setConfirmModalOpen(true)}
          disabled={!validation?.isValid}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4" /> Place Paper BUY Order
        </button>
      </div>

      {/* Safety Gate Confirmation Dialog */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">Confirm Order Placement</h3>
                <p className="text-xs text-neutral-500">Live Trading Terminal Safety Gate</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-mono space-y-1">
              <div>Contract: <strong>{selectedContract.tradingSymbol}</strong></div>
              <div>Quantity: <strong>{quantity} ({lotCount} Lot)</strong></div>
              <div>Limit Price: <strong>₹{intendedPrice}</strong></div>
              <div>Target: <strong>₹{targetPrice}</strong> (+₹{targetMove})</div>
              <div>Stop Loss: <strong>₹{stopLossPrice}</strong> (-₹{stopLossMove})</div>
              <div>Est. Charges: <strong>-₹{validation?.estimatedCharges.totalCharges}</strong></div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed font-sans">
              <strong>Notice:</strong> Real-money broker order placement is strictly locked in Phase 3. This order will be processed inside the local paper trading simulation engine.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatedSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
