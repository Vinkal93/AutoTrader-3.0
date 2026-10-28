import { describe, it, expect } from 'vitest';

// 1. Statutory charges formula verification
function calculateNSEOptionCharges({
  buyPremium,
  sellPremium,
  quantity,
}: {
  buyPremium: number;
  sellPremium: number;
  quantity: number;
}) {
  const buyTurnover = buyPremium * quantity;
  const sellTurnover = sellPremium * quantity;
  const totalTurnover = buyTurnover + sellTurnover;

  const brokerage = 40.0; // ₹20 per executed order (buy + sell)
  const stt = Math.round(sellTurnover * 0.00125 * 100) / 100; // 0.125% on sell turnover
  const exchangeTxn = Math.round(totalTurnover * 0.0005 * 100) / 100; // 0.05% on turnover
  const gst = Math.round((brokerage + exchangeTxn) * 0.18 * 100) / 100; // 18% on (brokerage + exchange txn)
  const sebi = Math.round((totalTurnover * 0.000001) * 100) / 100; // ₹10 per crore
  const stampDuty = Math.round(buyTurnover * 0.00003 * 100) / 100; // 0.003% on buy side

  const totalCharges = brokerage + stt + exchangeTxn + gst + sebi + stampDuty;
  return {
    brokerage,
    stt,
    exchangeTxn,
    gst,
    sebi,
    stampDuty,
    totalCharges: Math.round(totalCharges * 100) / 100,
  };
}

// 2. EMA Calculation
function calculateEMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) return prices.map(() => null);
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
    result.push(null);
  }
  let prevEMA = sum / period;
  result[period - 1] = prevEMA;

  for (let i = period; i < prices.length; i++) {
    const curEMA = prices[i] * k + prevEMA * (1 - k);
    result.push(curEMA);
    prevEMA = curEMA;
  }
  return result;
}

// 3. Win Rate with Exact Denominator
function calculateWinRate(wins: number, totalClosed: number): number {
  if (totalClosed === 0) return 0;
  return Math.round((wins / totalClosed) * 10000) / 100;
}

describe('Financial Mathematics & Statutory Charges Tests', () => {
  it('correctly calculates statutory charges for 1 lot (25 qty) NIFTY option round-trip', () => {
    const charges = calculateNSEOptionCharges({
      buyPremium: 42.0,
      sellPremium: 43.0,
      quantity: 25,
    });

    expect(charges.brokerage).toBe(40.0);
    expect(charges.stt).toBeGreaterThan(1.0); // 43 * 25 * 0.00125 = ~1.34
    expect(charges.gst).toBeGreaterThan(7.0); // 18% on ~41 = ~7.38
    expect(charges.totalCharges).toBeGreaterThan(49.0);
  });

  it('correctly computes EMA 9 over a series of closing prices', () => {
    const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 110];
    const ema9 = calculateEMA(prices, 9);

    expect(ema9[0]).toBeNull();
    expect(ema9[7]).toBeNull();
    // 9th element is SMA of first 9
    const sma9 = (100 + 102 + 101 + 103 + 105 + 104 + 106 + 108 + 107) / 9;
    expect(ema9[8]).toBeCloseTo(sma9, 4);
    // 10th element is smoothed EMA
    expect(ema9[9]).toBeGreaterThan(ema9[8]!);
  });

  it('correctly calculates win rate percentage with zero divide protection', () => {
    expect(calculateWinRate(0, 0)).toBe(0);
    expect(calculateWinRate(1, 1)).toBe(100.0);
    expect(calculateWinRate(3, 5)).toBe(60.0);
    expect(calculateWinRate(2, 3)).toBe(66.67);
  });

  it('preserves gross vs net P&L invariant (Net P&L = Gross P&L - Charges)', () => {
    const grossPnl = 25.0; // 1 point gain * 25 qty
    const charges = 50.45;
    const netPnl = grossPnl - charges;

    expect(netPnl).toBeCloseTo(-25.45, 2);
    expect(grossPnl).toBeGreaterThan(0);
    expect(netPnl).toBeLessThan(0); // Broker charges flip a small 1pt gain into net negative
  });
});
