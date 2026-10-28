'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCandles, useNiftyQuote, useMarketTrend } from '@/hooks/use-queries';
import { formatCurrency, formatISTTime } from '@/lib/formatters';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Clock,
  Eye,
  EyeOff,
  BarChart2,
} from 'lucide-react';

export const TerminalChart: React.FC<{ className?: string }> = ({ className }) => {
  const [interval, setInterval] = useState<'1m' | '5m' | '15m'>('5m');
  const [showEma9, setShowEma9] = useState(true);
  const [showEma21, setShowEma21] = useState(true);

  const { data: quote } = useNiftyQuote();
  const { data: candlesData, isLoading } = useCandles('NIFTY', interval);
  const { data: trend } = useMarketTrend('NIFTY', interval);

  const candles = useMemo(() => candlesData?.candles ?? [], [candlesData]);

  // Compute EMA series
  const { ema9Series, ema21Series, minPrice, maxPrice } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { ema9Series: [], ema21Series: [], minPrice: 0, maxPrice: 0 };
    }

    const prices = candles.map((c) => c.close);
    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));

    // Pad 5%
    const pad = (max - min) * 0.05 || 10;
    min -= pad;
    max += pad;

    const calcEma = (period: number) => {
      if (prices.length < period) return new Array(prices.length).fill(null);
      const k = 2 / (period + 1);
      const result: (number | null)[] = new Array(period - 1).fill(null);
      let prev = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(prev);

      for (let i = period; i < prices.length; i++) {
        prev = prices[i] * k + prev * (1 - k);
        result.push(prev);
      }
      return result;
    };

    return {
      ema9Series: calcEma(9),
      ema21Series: calcEma(21),
      minPrice: min,
      maxPrice: max,
    };
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;
  const getY = (val: number) => {
    return 240 - ((val - minPrice) / priceRange) * 200 - 20;
  };

  const trendState = trend?.state ?? 'INSUFFICIENT_DATA';
  const trendDir = trend?.trendDirection ?? 'NEUTRAL';
  const isBullish = trendDir === 'BULLISH';
  const isBearish = trendDir === 'BEARISH';

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col', className)}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-neutral-500" />
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">NIFTY 50 Candlestick Chart</h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Interval Selector */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['1m', '5m', '15m'] as const).map((int) => (
              <button
                key={int}
                type="button"
                onClick={() => setInterval(int)}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-all',
                  interval === int ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {int}
              </button>
            ))}
          </div>

          {/* Indicator Visibility Toggles */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setShowEma9(!showEma9)}
              className={cn(
                'px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold transition-colors flex items-center gap-1',
                showEma9 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'
              )}
            >
              {showEma9 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              EMA 9
            </button>
            <button
              type="button"
              onClick={() => setShowEma21(!showEma21)}
              className={cn(
                'px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold transition-colors flex items-center gap-1',
                showEma21 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'
              )}
            >
              {showEma21 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              EMA 21
            </button>
          </div>
        </div>
      </div>

      {/* Canonical Trend Analysis Banner (Task 5) */}
      <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border tracking-wider',
              isBullish
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isBearish
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
            )}
          >
            {trendState}
          </span>
          <span className="font-semibold text-neutral-700">
            Trend: <strong className={isBullish ? 'text-emerald-600' : isBearish ? 'text-rose-600' : 'text-neutral-800'}>{trendDir}</strong>
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-500 font-mono text-[11px]">
            Strength: <strong>{trend?.trendStrength ?? 'NONE'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-blue-600 font-semibold">
            EMA 9: {trend?.ema9 ? `₹${trend.ema9}` : '—'}
          </span>
          <span className="text-amber-600 font-semibold">
            EMA 21: {trend?.ema21 ? `₹${trend.ema21}` : '—'}
          </span>
          <span className="text-neutral-500">
            Spread: {trend?.emaSpread ? `${trend.emaSpread > 0 ? '+' : ''}₹${trend.emaSpread}` : '—'}
          </span>
          {trend?.candleConfirmation && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold">
              Candle Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Candlestick & EMA SVG Canvas */}
      <div className="relative w-full h-[260px] mt-3 select-none">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/50 rounded-xl">
            <span className="text-xs text-neutral-400">Loading market candles...</span>
          </div>
        ) : candles.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/40 rounded-xl border border-dashed border-neutral-200 text-center p-6">
            <Activity className="w-8 h-8 text-neutral-300 mb-2" />
            <h4 className="text-sm font-semibold text-neutral-700">Market Feed Offline</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Connecting to live broker quote stream. Real candles will populate upon active exchange session.
            </p>
          </div>
        ) : (
          <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeDasharray="2 2" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeDasharray="2 2" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeDasharray="2 2" />

            {/* Candlesticks */}
            {candles.map((c, i) => {
              const x = (i / Math.max(1, candles.length - 1)) * 560 + 20;
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const isGreen = c.close >= c.open;
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));
              const topY = Math.min(openY, closeY);

              return (
                <g key={c.timestamp}>
                  {/* High/Low Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isGreen ? '#10b981' : '#ef4444'}
                    strokeWidth="1.5"
                  />
                  {/* Open/Close Body */}
                  <rect
                    x={x - 4}
                    y={topY}
                    width={8}
                    height={bodyHeight}
                    fill={isGreen ? '#10b981' : '#ef4444'}
                    rx={1}
                  />
                </g>
              );
            })}

            {/* EMA 9 Polyline */}
            {showEma9 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={ema9Series
                  .map((val, i) => {
                    if (val === null) return null;
                    const x = (i / Math.max(1, candles.length - 1)) * 560 + 20;
                    return `${x},${getY(val)}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            )}

            {/* EMA 21 Polyline */}
            {showEma21 && (
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={ema21Series
                  .map((val, i) => {
                    if (val === null) return null;
                    const x = (i / Math.max(1, candles.length - 1)) * 560 + 20;
                    return `${x},${getY(val)}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            )}

            {/* 12:20 PM Scheduled Trigger Marker */}
            {candles.map((c, i) => {
              const istTime = formatISTTime(c.timestamp);
              if (istTime.startsWith('12:20')) {
                const x = (i / Math.max(1, candles.length - 1)) * 560 + 20;
                return (
                  <g key={`marker-${c.timestamp}`}>
                    <line x1={x} y1="0" x2={x} y2="240" stroke="#8b5cf6" strokeDasharray="3 3" strokeWidth="1.5" />
                    <text x={x + 3} y="15" fill="#8b5cf6" fontSize="9" fontWeight="bold">
                      12:20 PM Trigger
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
