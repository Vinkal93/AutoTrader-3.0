'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useValidateOrder, useSubmitOrder, useBrokerConnections, useAccountFunds } from '@/hooks/use-queries';
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
  Building2,
  Wallet,
  Scale,
} from 'lucide-react';
import { SelectedOptionContract } from './OptionChainTable';
import { useUIStore } from '@/store/ui-store';

interface TradeTicketProps {
  selectedContract: SelectedOptionContract | null;
  className?: string;
}

export const TradeTicket: React.FC<TradeTicketProps> = ({ selectedContract, className }) => {
  const { activeBrokerConnectionId } = useUIStore();
  const { data: brokerConnections } = useBrokerConnections();
  const { data: fundsData } = useAccountFunds(activeBrokerConnectionId);

  // Active broker connection & capabilities
  const connections = brokerConnections ?? [];
  const activeConnection =
    connections.find((c) => c.id === activeBrokerConnectionId) ??
    connections[0] ??
    null;

  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);
  const [lotCount, setLotCount] = useState<number>(1);
  const [intendedPrice, setIntendedPrice] = useState<string>('42.50');
  const [triggerPrice, setTriggerPrice] = useState<string>('39.50');
  const [targetMove, setTargetMove] = useState<string>('1.00');
  const [stopLossMove, setStopLossMove] = useState<string>('3.00');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [simulatedOrderSuccess, setSimulatedOrderSuccess] = useState(false);

  const validateOrder = useValidateOrder();
  const submitOrder = useSubmitOrder();

  // Sync price when new contract selected
  useEffect(() => {
    if (selectedContract) {
      const ask = selectedContract.askPrice > 0 ? selectedContract.askPrice : selectedContract.ltp;
      setIntendedPrice(ask.toFixed(2));
      setTriggerPrice(Math.max(0.05, ask - 3.0).toFixed(2));
    }
  }, [selectedContract]);

  const lotSize = selectedContract?.lotSize ?? 25;
  const quantity = lotCount * lotSize;

  const priceNum = parseFloat(intendedPrice) || 0;
  const targetMoveNum = parseFloat(targetMove) || 1.0;
  const slMoveNum = parseFloat(stopLossMove) || 3.0;

  // Tick-aligned target and SL (0.05 step)
  const targetPrice = (Math.round((priceNum + targetMoveNum) / 0.05) * 0.05).toFixed(2);
  const stopLossPrice = (Math.max(0.05, Math.round((priceNum - slMoveNum) / 0.05) * 0.05)).toFixed(2);

  // Trigger validation mutation whenever inputs change
  useEffect(() => {
    if (selectedContract && priceNum > 0) {
      validateOrder.mutate({
        instrumentToken: selectedContract.instrumentToken,
        tradingSymbol: selectedContract.tradingSymbol,
        optionType: selectedContract.optionType,
        side,
        quantity,
        price: intendedPrice,
        targetPrice,
        stopLossPrice,
        orderType,
        connectionId: activeConnection?.id,
      });
    }
  }, [
    selectedContract,
    side,
    orderType,
    lotCount,
    intendedPrice,
    targetPrice,
    stopLossPrice,
    priceNum,
    quantity,
    activeConnection?.id,
    validateOrder,
  ]);

  const validation = validateOrder.data;

  // Available margin from broker
  const availableMarginStr = fundsData?.availableCash ?? validation?.availableMargin ?? '150000.00';
  const availableMarginNum = parseFloat(availableMarginStr) || 0;
  const requiredMarginNum = parseFloat(validation?.requiredMargin ?? String(quantity * priceNum)) || 0;
  const hasSufficientMargin = availableMarginNum >= requiredMarginNum;

  const handleSimulatedSubmit = () => {
    if (!selectedContract) return;
    submitOrder.mutate(
      {
        tradingSymbol: selectedContract.tradingSymbol,
        exchange: 'NFO' as any,
        side,
        orderType,
        quantity,
        price: intendedPrice,
        triggerPrice: orderType === OrderType.SL ? triggerPrice : undefined,
        tradingMode: TradingMode.PAPER,
        connectionId: activeConnection?.id,
        brokerId: activeConnection?.providerId,
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
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Trade Ticket</h3>
        </div>

        <div className="my-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-sm text-neutral-800">No Contract Selected</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Select an option from the Smart Premium Scanner or NIFTY Option Chain to inspect the trade ticket, margin preview, and fee calculations.
          </p>
        </div>

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 text-center font-medium">
          Ready for contract selection
        </div>
      </div>
    );
  }

  const isCE = selectedContract.optionType === OptionType.CE;

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col justify-between space-y-4', className)}>
      {/* Ticket Header & Side Selector (Task 1) */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-500" />
            <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Trade Ticket</h3>
          </div>

          {/* Active Broker Capsule */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-700">{activeConnection?.alias || 'Broker'}</span>
          </div>
        </div>

        {/* Buy / Sell Side Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setSide(OrderSide.BUY)}
            className={cn(
              'py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1',
              side === OrderSide.BUY
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            )}
          >
            BUY {selectedContract.optionType}
          </button>
          <button
            type="button"
            onClick={() => setSide(OrderSide.SELL)}
            className={cn(
              'py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1',
              side === OrderSide.SELL
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            )}
          >
            SELL (Exit)
          </button>
        </div>

        {/* Selected Instrument Pill */}
        <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-neutral-900">
              {selectedContract.tradingSymbol}
            </span>
            <span className="text-[11px] font-semibold text-neutral-500 tabular-nums">
              Expiry: {selectedContract.expiryDate}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-600 tabular-nums">
            <span>Bid: ₹{selectedContract.bidPrice.toFixed(2)} ({selectedContract.bidQuantity})</span>
            <span>•</span>
            <span>Ask: <strong className="text-neutral-900">₹{selectedContract.askPrice.toFixed(2)}</strong> ({selectedContract.askQuantity})</span>
          </div>
        </div>
      </div>

      {/* Order Type Selector (Task 1 & 2: Broker Capabilities) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-neutral-600 block">Order Type</label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setOrderType(OrderType.LIMIT)}
            className={cn(
              'py-1.5 rounded-lg font-bold border transition-all text-center',
              orderType === OrderType.LIMIT
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            )}
          >
            LIMIT
          </button>
          <button
            type="button"
            onClick={() => setOrderType(OrderType.SL)}
            className={cn(
              'py-1.5 rounded-lg font-bold border transition-all text-center',
              orderType === OrderType.SL
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            )}
          >
            SL-L
          </button>
          <button
            type="button"
            disabled
            title="Disabled by broker/exchange policy: Market orders on index options are prohibited to protect against extreme slippage."
            className="py-1.5 rounded-lg font-bold border border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60 text-center flex items-center justify-center gap-1"
          >
            <Lock className="w-3 h-3" /> MARKET
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 italic">
          Market orders on options are disabled across all brokers by exchange policy.
        </p>
      </div>

      {/* Order Sizing & Parameters */}
      <div className="space-y-3 text-xs font-sans">
        {/* Lot Sizing Stepper */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-neutral-700 font-semibold block">Position Lots</span>
            <span className="text-[10px] text-neutral-400">1 Lot = {lotSize} units</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs tabular-nums">
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
                onClick={() => setLotCount(Math.min(10, lotCount + 1))}
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
            <span className="text-neutral-700 font-semibold block">Limit Price</span>
            <span className="text-[10px] text-neutral-400">Tick size: ₹0.05</span>
          </div>
          <div className="flex items-center gap-1 tabular-nums">
            <span className="text-neutral-500 font-bold">₹</span>
            <input
              type="text"
              value={intendedPrice}
              onChange={(e) => setIntendedPrice(e.target.value)}
              className="w-24 p-1.5 text-right bg-neutral-50 border border-neutral-200 rounded-lg font-bold text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500 tabular-nums"
            />
          </div>
        </div>

        {/* Trigger Price if SL-L */}
        {orderType === OrderType.SL && (
          <div className="flex items-center justify-between bg-amber-50/60 p-2 rounded-xl border border-amber-200">
            <div>
              <span className="text-amber-900 font-semibold block text-xs">SL Trigger Price</span>
              <span className="text-[10px] text-amber-700">Broker stop activation price</span>
            </div>
            <div className="flex items-center gap-1 tabular-nums">
              <span className="text-amber-700 font-bold">₹</span>
              <input
                type="text"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-24 p-1.5 text-right bg-white border border-amber-300 rounded-lg font-bold text-amber-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 tabular-nums"
              />
            </div>
          </div>
        )}

        {/* Funds & Margin Preview (Task 1 & Task 4) */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-neutral-400" /> Available Broker Margin:
            </span>
            <span className="font-bold text-neutral-800">
              {formatCurrency(availableMarginStr, { fractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-neutral-400" /> Margin Required:
            </span>
            <span className="font-extrabold text-neutral-900">
              {validation ? formatCurrency(validation.requiredMargin, { fractionDigits: 2 }) : '—'}
            </span>
          </div>
          <div className="pt-1 border-t border-neutral-200/70 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">Margin Status:</span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                hasSufficientMargin
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              )}
            >
              {hasSufficientMargin ? 'Sufficient Margin' : 'Insufficient Margin'}
            </span>
          </div>
        </div>

        {/* Target Movement & Calculated Price */}
        <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1 tabular-nums">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-semibold text-xs font-sans">Target Move (+₹{targetMove})</span>
            <span className="font-bold text-xs">Target: ₹{targetPrice}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-700">
            <span>Gross Gain: +₹{validation?.estimatedGrossProfit ?? '25.00'}</span>
            <span>Net Gain: <strong className="font-bold">{validation?.estimatedNetProfit ? `₹${validation.estimatedNetProfit}` : '—'}</strong></span>
          </div>
        </div>

        {/* Stop Loss Movement & Calculated Price */}
        <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1 tabular-nums">
          <div className="flex items-center justify-between text-rose-800">
            <span className="font-semibold text-xs font-sans">Stop Loss (-₹{stopLossMove})</span>
            <span className="font-bold text-xs">SL Trigger: ₹{stopLossPrice}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-rose-700">
            <span>Gross Loss: -₹{validation?.estimatedGrossLoss ?? '75.00'}</span>
            <span>Net Max Loss: <strong className="font-bold">{validation?.estimatedNetLoss ? `₹${validation.estimatedNetLoss}` : '—'}</strong></span>
          </div>
        </div>

        {/* Net Risk-to-Reward Ratio (Task 4) */}
        {validation?.netRiskRewardRatio && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 font-semibold tabular-nums">
            <span>Net Risk:Reward Ratio:</span>
            <span className="font-bold text-blue-700">{validation.netRiskRewardRatio}</span>
          </div>
        )}

        {/* Itemized Statutory Fee Estimates (Task 4) */}
        {validation && (
          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] space-y-1.5 tabular-nums text-neutral-600">
            <div className="flex items-center justify-between font-bold text-neutral-800">
              <span className="font-sans flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-neutral-500" /> Estimated Statutory Deductions:
              </span>
              <span>-₹{validation.estimatedCharges.totalCharges}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-neutral-500 pt-0.5">
              <span>Brokerage: ₹{validation.estimatedCharges.brokerage}</span>
              <span>STT: ₹{validation.estimatedCharges.stt}</span>
              <span>Exchange: ₹{validation.estimatedCharges.exchangeTxnCharge}</span>
              <span>GST: ₹{validation.estimatedCharges.gst}</span>
              <span>SEBI: ₹{validation.estimatedCharges.sebiCharges}</span>
              <span>Stamp: ₹{validation.estimatedCharges.stampDuty}</span>
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

      {/* Action Controls & Safety Gate (Task 5) */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs tabular-nums pb-1">
          <span className="text-neutral-500 font-sans">Trade Value:</span>
          <span className="font-extrabold text-sm text-neutral-900">
            {formatCurrency(String(quantity * priceNum), { fractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setConfirmModalOpen(true)}
          disabled={!validation?.isValid}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4" /> Place Paper {side} Order
        </button>

        <p className="text-[10px] text-neutral-400 text-center italic">
          Live real-money order execution remains safety-locked until broker partner gates are satisfied.
        </p>
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
                <p className="text-xs text-neutral-500">Live Trading Terminal Pre-Flight Safety Gate</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs tabular-nums space-y-1">
              <div>Broker Account: <strong>{activeConnection?.alias} ({activeConnection?.providerId})</strong></div>
              <div>Contract: <strong>{selectedContract.tradingSymbol}</strong></div>
              <div>Side / Type: <strong>{side} {orderType}</strong></div>
              <div>Quantity: <strong>{quantity} ({lotCount} Lot)</strong></div>
              <div>Limit Price: <strong>₹{intendedPrice}</strong></div>
              {orderType === OrderType.SL && <div>Trigger Price: <strong>₹{triggerPrice}</strong></div>}
              <div>Target Price: <strong>₹{targetPrice}</strong> (+₹{targetMove})</div>
              <div>Stop Loss: <strong>₹{stopLossPrice}</strong> (-₹{stopLossMove})</div>
              <div>Est. Statutory Charges: <strong>-₹{validation?.estimatedCharges.totalCharges}</strong></div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed font-sans">
              <strong>Master Safety Lock:</strong> Live real-money order routing is safety-locked. This order will be dispatched to the deterministic virtual matching engine with idempotency key enforcement.
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
