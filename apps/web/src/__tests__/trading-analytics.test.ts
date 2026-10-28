import { describe, it, expect } from 'vitest';

// Pure mathematical definitions mirroring backend AnalyticsService

function calculateWinLossRates(wins: number, losses: number, totalClosed: number) {
  if (totalClosed <= 0) return { winRate: 0.0, lossRate: 0.0 };
  const winRate = Math.round((wins / totalClosed) * 10000) / 100;
  const lossRate = Math.round((losses / totalClosed) * 10000) / 100;
  return { winRate, lossRate };
}

function calculateProfitFactor(grossWins: number, grossLosses: number): number | null {
  const absLoss = Math.abs(grossLosses);
  if (absLoss > 0) {
    return Math.round((grossWins / absLoss) * 100) / 100;
  } else if (grossWins > 0) {
    return 999.0;
  }
  return null;
}

function calculateDrawdown(equitySeries: number[]) {
  if (!equitySeries.length) {
    return { maxDrawdown: 0, maxDrawdownPercent: null, peak: 0, trough: 0 };
  }
  let peak = 0;
  let maxDrawdown = 0;
  let trough = 0;
  let peakAtMaxDd = 0;

  for (const eq of equitySeries) {
    if (eq > peak) peak = eq;
    const dd = peak - eq;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      trough = eq;
      peakAtMaxDd = peak;
    }
  }

  const maxDrawdownPercent =
    peakAtMaxDd > 0 && maxDrawdown > 0
      ? Math.round((maxDrawdown / peakAtMaxDd) * 10000) / 100
      : null;

  return { maxDrawdown, maxDrawdownPercent, peak, trough };
}

function calculateExpectancy(
  winRatePct: number,
  avgWin: number,
  lossRatePct: number,
  avgLoss: number
) {
  const pWin = winRatePct / 100;
  const pLoss = lossRatePct / 100;
  const expectancy = Math.round((pWin * avgWin - pLoss * Math.abs(avgLoss)) * 100) / 100;
  const expectancyRatio =
    Math.abs(avgLoss) > 0 ? Math.round((expectancy / Math.abs(avgLoss)) * 100) / 100 : null;
  return { expectancy, expectancyRatio };
}

function calculateHoldingSeconds(startedAt: string, closedAt: string): number {
  const s = new Date(startedAt).getTime();
  const c = new Date(closedAt).getTime();
  return Math.max(0, Math.round((c - s) / 1000));
}

function calculateSlippagePoints(limitPrice: number, fillPrice: number, isBuy: boolean): number {
  if (isBuy) {
    return Math.round((fillPrice - limitPrice) * 100) / 100;
  }
  return Math.round((limitPrice - fillPrice) * 100) / 100;
}

describe('Trading Analytics Pure Mathematical Routines (Phase 7)', () => {
  it('handles win and loss rates with zero-division safety and precision', () => {
    expect(calculateWinLossRates(0, 0, 0)).toEqual({ winRate: 0.0, lossRate: 0.0 });
    expect(calculateWinLossRates(1, 1, 2)).toEqual({ winRate: 50.0, lossRate: 50.0 });
    expect(calculateWinLossRates(7, 3, 10)).toEqual({ winRate: 70.0, lossRate: 30.0 });
    expect(calculateWinLossRates(2, 1, 3)).toEqual({ winRate: 66.67, lossRate: 33.33 });
  });

  it('correctly calculates profit factor and handles zero loss cases without NaN', () => {
    // Normal case: 1500 wins / 500 losses = 3.0
    expect(calculateProfitFactor(1500, -500)).toBe(3.0);
    // Zero losses: undefined ceiling representation 999.0
    expect(calculateProfitFactor(1000, 0)).toBe(999.0);
    // Zero trades: null
    expect(calculateProfitFactor(0, 0)).toBeNull();
  });

  it('computes peak-to-trough max drawdown and percentage accurately', () => {
    const equityCurve = [100, 250, 180, 150, 300, 280];
    const { maxDrawdown, maxDrawdownPercent, peak, trough } = calculateDrawdown(equityCurve);

    expect(maxDrawdown).toBe(100); // 250 down to 150
    expect(peak).toBe(300);
    expect(trough).toBe(150);
    expect(maxDrawdownPercent).toBe(40.0); // 100 / 250 = 40%
  });

  it('evaluates statistical trade expectancy and expectancy ratio', () => {
    // 60% win rate with ₹100 avg win, 40% loss rate with ₹50 avg loss
    // Expectancy = 0.60 * 100 - 0.40 * 50 = 60 - 20 = ₹40.00
    const { expectancy, expectancyRatio } = calculateExpectancy(60.0, 100, 40.0, 50);
    expect(expectancy).toBe(40.0);
    expect(expectancyRatio).toBe(0.8);
  });

  it('calculates trade holding duration in seconds from timestamps', () => {
    const start = '2026-10-28T09:15:00.000Z';
    const end = '2026-10-28T09:18:45.000Z';
    expect(calculateHoldingSeconds(start, end)).toBe(225); // 3m 45s = 225s
  });

  it('calculates execution slippage correctly for limit BUY and SELL orders', () => {
    // BUY requested at 42.50, filled at 42.55 -> +0.05 adverse slippage
    expect(calculateSlippagePoints(42.5, 42.55, true)).toBe(0.05);
    // BUY requested at 42.50, filled at 42.45 -> -0.05 price improvement
    expect(calculateSlippagePoints(42.5, 42.45, true)).toBe(-0.05);
    // SELL requested at 43.50, filled at 43.45 -> +0.05 adverse slippage
    expect(calculateSlippagePoints(43.5, 43.45, false)).toBe(0.05);
  });
});
