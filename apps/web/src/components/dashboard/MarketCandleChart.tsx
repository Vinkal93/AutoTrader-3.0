'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCandles, useNiftyQuote, useTrades } from '@/hooks/use-queries';
import { type Candle } from '@autotrader/api-contracts';
import { formatCurrency, formatISTTime } from '@/lib/formatters';
import {
  TrendingUp,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Clock,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface MarketCandleChartProps {
  className?: string;
  defaultInterval?: string;
}

// Calculate Exponential Moving Average over array of closing prices
function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  if (candles.length < period) return candles.map(() => null);

  const k = 2 / (period + 1);
  const result: (number | null)[] = [];

  // First EMA is simple average of first `period` items
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
    result.push(null);
  }

  let prevEMA = sum / period;
  result[period - 1] = prevEMA;

  for (let i = period; i < candles.length; i++) {
    const currentEMA = candles[i].close * k + prevEMA * (1 - k);
    result.push(currentEMA);
    prevEMA = currentEMA;
  }

  return result;
}

export const MarketCandleChart: React.FC<MarketCandleChartProps> = ({
  className,
  defaultInterval = '5m',
}) => {
  const [interval, setInterval] = useState<string>(defaultInterval);
  const [showEMA9, setShowEMA9] = useState<boolean>(true);
  const [showEMA21, setShowEMA21] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const { data: candlesData, isLoading, error, refetch, isFetching } = useCandles('NIFTY', interval);
  const { data: quote } = useNiftyQuote();
  const { data: trades } = useTrades();

  const candles = useMemo(() => candlesData?.candles ?? [], [candlesData]);

  const ema9Series = useMemo(() => calculateEMA(candles, 9), [candles]);
  const ema21Series = useMemo(() => calculateEMA(candles, 21), [candles]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const padding = { top: 20, right: 65, bottom: 35, left: 15 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Windowed visible candles based on zoom
  const visibleCandles = useMemo(() => {
    if (candles.length === 0) return [];
    const count = Math.max(10, Math.floor(candles.length / zoomLevel));
    return candles.slice(-count);
  }, [candles, zoomLevel]);

  const startIndex = candles.length - visibleCandles.length;

  const { minPrice, maxPrice } = useMemo(() => {
    if (visibleCandles.length === 0) return { minPrice: 0, maxPrice: 100 };
    let min = Infinity;
    let max = -Infinity;
    for (const c of visibleCandles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    }
    // Add 10% breathing room
    const margin = (max - min) * 0.08 || 10;
    return { minPrice: min - margin, maxPrice: max + margin };
  }, [visibleCandles]);

  const priceToY = (price: number) => {
    if (maxPrice === minPrice) return plotHeight / 2 + padding.top;
    return padding.top + plotHeight - ((price - minPrice) / (maxPrice - minPrice)) * plotHeight;
  };

  const candleWidth = useMemo(() => {
    if (visibleCandles.length <= 1) return 10;
    const slot = plotWidth / visibleCandles.length;
    return Math.max(2, Math.min(slot * 0.75, 14));
  }, [visibleCandles.length, plotWidth]);

  // Active hovered candle or latest
  const activeCandle = hoveredIndex !== null && visibleCandles[hoveredIndex]
    ? visibleCandles[hoveredIndex]
    : visibleCandles[visibleCandles.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    if (x < 0 || x > plotWidth || visibleCandles.length === 0) {
      setHoveredIndex(null);
      return;
    }
    const idx = Math.floor((x / plotWidth) * visibleCandles.length);
    if (idx >= 0 && idx < visibleCandles.length) {
      setHoveredIndex(idx);
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col', className)}>
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm tracking-tight text-neutral-900">NIFTY Candlesticks</h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
              {interval.toUpperCase()}
            </span>
          </div>

          {/* Real-time spot price badge */}
          {quote && (
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-lg">
              <span className="text-neutral-900">{formatCurrency(quote.lastPrice)}</span>
              <span className={quote.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {quote.change >= 0 ? '+' : ''}
                {quote.change.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Tabs */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {['1m', '5m', '15m'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setInterval(tf)}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all',
                  interval === tf ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* EMA Toggles */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 px-2 py-1 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setShowEMA9(!showEMA9)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[11px] font-bold transition-all',
                showEMA9 ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-700'
              )}
            >
              EMA 9
            </button>
            <button
              type="button"
              onClick={() => setShowEMA21(!showEMA21)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[11px] font-bold transition-all',
                showEMA21 ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-neutral-700'
              )}
            >
              EMA 21
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
              title="Zoom In"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
              title="Zoom Out"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh Candles"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin text-blue-600')} />
            </button>
          </div>
        </div>
      </div>

      {/* OHLC Bar Inspector */}
      {activeCandle ? (
        <div className="flex items-center gap-4 text-xs font-mono py-2 text-neutral-600 overflow-x-auto border-b border-neutral-100">
          <span className="text-neutral-400">
            TIME: <strong className="text-neutral-800">{formatISTTime(activeCandle.timestamp)}</strong>
          </span>
          <span>
            O: <strong className="text-neutral-800">{activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-emerald-700">{activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-red-700">{activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C:{' '}
            <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-700' : 'text-red-700'}>
              {activeCandle.close.toFixed(2)}
            </strong>
          </span>
          {showEMA9 && hoveredIndex !== null && ema9Series[startIndex + hoveredIndex] && (
            <span className="text-blue-600">
              EMA9: <strong>{ema9Series[startIndex + hoveredIndex]?.toFixed(2)}</strong>
            </span>
          )}
          {showEMA21 && hoveredIndex !== null && ema21Series[startIndex + hoveredIndex] && (
            <span className="text-amber-600">
              EMA21: <strong>{ema21Series[startIndex + hoveredIndex]?.toFixed(2)}</strong>
            </span>
          )}
        </div>
      ) : (
        <div className="py-2 text-xs text-neutral-400 font-mono">
          Hover over candles to inspect OHLC and indicator levels
        </div>
      )}

      {/* Candlestick Plot Area */}
      <div className="relative flex-1 w-full min-h-[300px] mt-2 select-none overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/50 rounded-xl">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <span className="text-xs font-medium text-neutral-500">Loading NIFTY candle feed...</span>
          </div>
        ) : visibleCandles.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
            <Activity className="w-8 h-8 text-neutral-300 mb-2" />
            <h4 className="text-sm font-semibold text-neutral-700">Market Feed Offline</h4>
            <p className="text-xs text-neutral-500 max-w-sm text-center mt-1">
              Broker disconnected or exchange is closed. Candlestick quotes will render automatically when live broker feed connects.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full cursor-crosshair overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Horizontal Grid lines & Price axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = padding.top + plotHeight * pct;
              const price = maxPrice - (maxPrice - minPrice) * pct;
              return (
                <g key={pct}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + plotWidth}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left + plotWidth + 8}
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {price.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* 12:20 PM IST Strategy Entry Time Guide Line */}
            {visibleCandles.map((c, i) => {
              const isEntryTime = c.timestamp.includes('T12:20') || c.timestamp.includes('12:20:00');
              if (!isEntryTime) return null;
              const x = padding.left + (i + 0.5) * (plotWidth / visibleCandles.length);
              return (
                <g key={`entry-${i}`}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={x - 24}
                    y={padding.top - 14}
                    width="48"
                    height="14"
                    rx="3"
                    fill="#2563eb"
                  />
                  <text
                    x={x}
                    y={padding.top - 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    12:20
                  </text>
                </g>
              );
            })}

            {/* Candlestick Wicks & Bodies */}
            {visibleCandles.map((c, i) => {
              const x = padding.left + (i + 0.5) * (plotWidth / visibleCandles.length);
              const isUp = c.close >= c.open;
              const color = isUp ? '#16a34a' : '#dc2626';

              const yHigh = priceToY(c.high);
              const yLow = priceToY(c.low);
              const yOpen = priceToY(c.open);
              const yClose = priceToY(c.close);

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));

              return (
                <g key={i}>
                  {/* High/Low Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Real Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

            {/* EMA 9 Polyline Overlay */}
            {showEMA9 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.75"
                points={visibleCandles
                  .map((c, i) => {
                    const emaVal = ema9Series[startIndex + i];
                    if (emaVal === null || emaVal === undefined) return null;
                    const x = padding.left + (i + 0.5) * (plotWidth / visibleCandles.length);
                    const y = priceToY(emaVal);
                    return `${x},${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            )}

            {/* EMA 21 Polyline Overlay */}
            {showEMA21 && (
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="1.75"
                points={visibleCandles
                  .map((c, i) => {
                    const emaVal = ema21Series[startIndex + i];
                    if (emaVal === null || emaVal === undefined) return null;
                    const x = padding.left + (i + 0.5) * (plotWidth / visibleCandles.length);
                    const y = priceToY(emaVal);
                    return `${x},${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            )}

            {/* Crosshair on Mouse Hover */}
            {hoveredIndex !== null && (
              <g>
                {/* Vertical Line */}
                <line
                  x1={padding.left + (hoveredIndex + 0.5) * (plotWidth / visibleCandles.length)}
                  y1={padding.top}
                  x2={padding.left + (hoveredIndex + 0.5) * (plotWidth / visibleCandles.length)}
                  y2={padding.top + plotHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Horizontal Line at hovered Close */}
                {visibleCandles[hoveredIndex] && (
                  <>
                    <line
                      x1={padding.left}
                      y1={priceToY(visibleCandles[hoveredIndex].close)}
                      x2={padding.left + plotWidth}
                      y2={priceToY(visibleCandles[hoveredIndex].close)}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <rect
                      x={padding.left + plotWidth + 2}
                      y={priceToY(visibleCandles[hoveredIndex].close) - 9}
                      width="54"
                      height="16"
                      rx="3"
                      fill="#1e293b"
                    />
                    <text
                      x={padding.left + plotWidth + 6}
                      y={priceToY(visibleCandles[hoveredIndex].close) + 3}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {visibleCandles[hoveredIndex].close.toFixed(1)}
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Time Axis Labels along bottom */}
            {visibleCandles.map((c, i) => {
              // Show label every ~6 candles
              const step = Math.max(4, Math.floor(visibleCandles.length / 7));
              if (i % step !== 0 && i !== visibleCandles.length - 1) return null;
              const x = padding.left + (i + 0.5) * (plotWidth / visibleCandles.length);
              return (
                <text
                  key={`time-${i}`}
                  x={x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {formatISTTime(c.timestamp)}
                </text>
              );
            })}
          </svg>
        )}
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-600 rounded-full" />
            EMA 9 Trend Filter
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-600 rounded-full" />
            EMA 21 Baseline
          </span>
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2 h-2 border border-blue-600 border-dashed rounded-xs" />
            12:20 PM Scheduled Entry Window
          </span>
        </div>
        <span className="font-mono text-[10px]">Timezone: Asia/Kolkata (IST)</span>
      </div>
    </div>
  );
};
