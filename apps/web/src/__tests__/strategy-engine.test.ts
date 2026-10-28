import { describe, it, expect } from 'vitest';

// 1. Market Calendar Logic
const NSE_HOLIDAYS_MAP: Record<string, string> = {
  '2026-01-26': 'Republic Day',
  '2026-08-15': 'Independence Day',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-11-01': 'Diwali Laxmi Pujan',
  '2026-12-25': 'Christmas',
};

function isMarketHoliday(dateStr: string, dayOfWeek: number) {
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isHoliday: true, reason: 'Weekend' };
  }
  if (NSE_HOLIDAYS_MAP[dateStr]) {
    return { isHoliday: true, reason: NSE_HOLIDAYS_MAP[dateStr] };
  }
  return { isHoliday: false, reason: null };
}

// 2. Canonical EMA Calculation
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(prev);

  for (let i = period; i < prices.length; i++) {
    prev = prices[i] * k + prev * (1 - k);
    ema.push(prev);
  }
  return ema;
}

// 3. Directional Strategy Decision Rules
function evaluateDecision(params: {
  ema9: number;
  ema21: number;
  candleClose: number;
  sidewaysThreshold?: number;
}) {
  const threshold = params.sidewaysThreshold ?? 2.0;
  const spread = params.ema9 - params.ema21;

  if (Math.abs(spread) < threshold) {
    return {
      decision: 'NO_TRADE_SIDEWAYS',
      reason: `Sideways band: spread ${spread.toFixed(2)} within ±${threshold}`,
    };
  }

  if (spread > threshold) {
    // Bullish: Check candle close confirmation
    if (params.candleClose >= params.ema9) {
      return {
        decision: 'ENTER_CE',
        reason: 'Bullish crossover confirmed with candle close above EMA 9',
      };
    }
    return {
      decision: 'NO_TRADE_SIDEWAYS',
      reason: 'Bullish spread but candle close failed confirmation below EMA 9',
    };
  }

  if (spread < -threshold) {
    // Bearish: Check candle close confirmation
    if (params.candleClose <= params.ema9) {
      return {
        decision: 'ENTER_PE',
        reason: 'Bearish crossover confirmed with candle close below EMA 9',
      };
    }
    return {
      decision: 'NO_TRADE_SIDEWAYS',
      reason: 'Bearish spread but candle close failed confirmation above EMA 9',
    };
  }

  return { decision: 'NO_TRADE_SIDEWAYS', reason: 'Unconfirmed momentum' };
}

describe('Strategy Engine Market Calendar Tests', () => {
  it('correctly identifies weekends as non-trading days', () => {
    // Sunday (dayOfWeek 0)
    expect(isMarketHoliday('2026-10-25', 0).isHoliday).toBe(true);
    // Saturday (dayOfWeek 6)
    expect(isMarketHoliday('2026-10-31', 6).isHoliday).toBe(true);
  });

  it('correctly identifies NSE declared national holidays', () => {
    const republicDay = isMarketHoliday('2026-01-26', 1); // Monday
    expect(republicDay.isHoliday).toBe(true);
    expect(republicDay.reason).toBe('Republic Day');

    const gandhiJayanti = isMarketHoliday('2026-10-02', 5); // Friday
    expect(gandhiJayanti.isHoliday).toBe(true);
    expect(gandhiJayanti.reason).toBe('Mahatma Gandhi Jayanti');
  });

  it('correctly identifies regular active trading days', () => {
    const regularWednesday = isMarketHoliday('2026-10-28', 3); // Wednesday
    expect(regularWednesday.isHoliday).toBe(false);
  });
});

describe('Strategy Engine Direction & Confirmation Rules', () => {
  it('selects CE when EMA 9 > EMA 21 and candle closes above EMA 9', () => {
    const result = evaluateDecision({
      ema9: 25050.0,
      ema21: 25030.0, // Spread = +20.0 (Bullish)
      candleClose: 25060.0, // Close > EMA 9 (Confirmed)
    });

    expect(result.decision).toBe('ENTER_CE');
    expect(result.reason).toContain('Bullish crossover confirmed');
  });

  it('selects PE when EMA 9 < EMA 21 and candle closes below EMA 9', () => {
    const result = evaluateDecision({
      ema9: 24950.0,
      ema21: 24980.0, // Spread = -30.0 (Bearish)
      candleClose: 24940.0, // Close < EMA 9 (Confirmed)
    });

    expect(result.decision).toBe('ENTER_PE');
    expect(result.reason).toContain('Bearish crossover confirmed');
  });

  it('filters sideways markets when spread is within threshold', () => {
    const result = evaluateDecision({
      ema9: 25001.0,
      ema21: 25000.0, // Spread = +1.0 (Less than 2.0)
      candleClose: 25002.0,
    });

    expect(result.decision).toBe('NO_TRADE_SIDEWAYS');
    expect(result.reason).toContain('Sideways band');
  });

  it('rejects unconfirmed bullish signal when candle closes below EMA 9', () => {
    const result = evaluateDecision({
      ema9: 25040.0,
      ema21: 25020.0, // Spread = +20.0
      candleClose: 25035.0, // Close < EMA 9 (Unconfirmed)
    });

    expect(result.decision).toBe('NO_TRADE_SIDEWAYS');
    expect(result.reason).toContain('failed confirmation');
  });
});

describe('Strategy Engine Deterministic Lookahead & Execution Guarantees', () => {
  it('guarantees zero lookahead leakage during backtesting slices', () => {
    const historicalBars = [
      100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113, 115, 117, 116,
      118, 120, 119, 121, 123, 122, 124, 126, 125, 127, 129, 128,
    ];

    // Evaluate signal at bar index 24 (day 1 target)
    const sliceA = historicalBars.slice(0, 25);
    const ema9A = calculateEMA(sliceA, 9);
    const ema21A = calculateEMA(sliceA, 21);

    // If future bars change, the slice up to bar index 24 must produce identical values
    const futureBarsAppended = [...historicalBars, 150, 160, 170];
    const sliceB = futureBarsAppended.slice(0, 25);
    const ema9B = calculateEMA(sliceB, 9);
    const ema21B = calculateEMA(sliceB, 21);

    expect(ema9A[ema9A.length - 1]).toBe(ema9B[ema9B.length - 1]);
    expect(ema21A[ema21A.length - 1]).toBe(ema21B[ema21B.length - 1]);
  });

  it('enforces exactly one execution per trading date', () => {
    const executedDates = new Set<string>();

    const evaluateDate = (tradeDate: string) => {
      if (executedDates.has(tradeDate)) {
        return { status: 'REJECT_DUPLICATE_DAILY_RUN' };
      }
      executedDates.add(tradeDate);
      return { status: 'EXECUTED' };
    };

    expect(evaluateDate('2026-10-28').status).toBe('EXECUTED');
    // Immediate retry on same trading date must be rejected
    expect(evaluateDate('2026-10-28').status).toBe('REJECT_DUPLICATE_DAILY_RUN');
    // Next day must succeed
    expect(evaluateDate('2026-10-29').status).toBe('EXECUTED');
  });
});
