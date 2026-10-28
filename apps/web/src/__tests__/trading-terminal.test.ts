import { describe, it, expect } from 'vitest';
import {
  OptionType,
  OrderLifecycleState,
  OrderSide,
  MarketTrendState,
} from '@autotrader/api-contracts';

// Scanner Candidate Interface
interface MockCandidate {
  instrumentToken: string;
  tradingSymbol: string;
  optionType: OptionType;
  strikePrice: number;
  expiryDate: string;
  askPrice: number;
  bidPrice: number;
  bidAskSpread: number;
  askQuantity: number;
  volume: number;
}

// Deterministic Scanner Logic under test
function evaluateCandidate(
  cand: MockCandidate,
  config: {
    premiumMin: number;
    premiumMax: number;
    preferredPremium: number;
    direction: 'AUTO' | 'CE' | 'PE';
    maxSpread: number;
    minLiquidity: number;
  }
) {
  const reasons: string[] = [];

  // 1. Direction Filter
  if (config.direction !== 'AUTO' && cand.optionType !== config.direction) {
    reasons.push(`Direction mismatch: contract is ${cand.optionType}, requested ${config.direction}`);
  }

  // 2. Executable Ask Range
  if (cand.askPrice < config.premiumMin || cand.askPrice > config.premiumMax) {
    reasons.push(`Ask price ₹${cand.askPrice} outside range [${config.premiumMin}, ${config.premiumMax}]`);
  }

  // 3. Stale / Non-positive Quotes
  if (cand.askPrice <= 0 || cand.bidPrice <= 0) {
    reasons.push('Stale quote: non-positive bid or ask');
  }

  // 4. Spread Check
  const spread = cand.askPrice - cand.bidPrice;
  if (spread > config.maxSpread) {
    reasons.push(`Spread ₹${spread.toFixed(2)} exceeds max allowed ₹${config.maxSpread.toFixed(2)}`);
  }

  // 5. Liquidity Depth Check
  if (cand.askQuantity < config.minLiquidity) {
    reasons.push(`Ask quantity ${cand.askQuantity} below minimum ${config.minLiquidity}`);
  }

  const isEligible = reasons.length === 0;
  const distance = Math.abs(cand.askPrice - config.preferredPremium);
  const rankScore = 100.0 - distance * 15.0 - spread * 10.0 + Math.min(cand.volume, 50000) / 10000.0;

  return {
    isEligible,
    reasons,
    rankScore: Math.round(rankScore * 100) / 100,
  };
}

// Tick Size & Lot Size Alignment Validation
function validateOrderMath(params: {
  quantity: number;
  lotSize: number;
  price: number;
  targetPrice: number;
  stopLossPrice: number;
  tickSize: number;
}) {
  const errors: string[] = [];
  const isLotAligned = params.quantity > 0 && params.quantity % params.lotSize === 0;
  if (!isLotAligned) {
    errors.push(`Quantity must be a multiple of ${params.lotSize}`);
  }

  const isPriceTickAligned = Math.round((params.price / params.tickSize) * 1e6) % 1e6 === 0;
  const isTargetTickAligned = Math.round((params.targetPrice / params.tickSize) * 1e6) % 1e6 === 0;
  const isSlTickAligned = Math.round((params.stopLossPrice / params.tickSize) * 1e6) % 1e6 === 0;

  const grossProfit = (params.targetPrice - params.price) * params.quantity;
  const grossLoss = (params.price - params.stopLossPrice) * params.quantity;

  // Approximate round-trip fee: Brokerage ₹40 + STT/Turnover ~₹10.45
  const statutoryFees = 50.45;
  const netProfit = grossProfit - statutoryFees;
  const netLoss = -(grossLoss + statutoryFees);

  return {
    isLotAligned,
    isPriceTickAligned,
    isTargetTickAligned,
    isSlTickAligned,
    grossProfit,
    grossLoss,
    statutoryFees,
    netProfit,
    netLoss,
    isNetPositive: netProfit > 0,
  };
}

describe('Smart Premium Scanner Logic Tests', () => {
  const baseConfig = {
    premiumMin: 40.0,
    premiumMax: 45.0,
    preferredPremium: 42.5,
    direction: 'AUTO' as const,
    maxSpread: 1.5,
    minLiquidity: 50,
  };

  it('selects and ranks multiple matching options deterministically', () => {
    const candidateA: MockCandidate = {
      instrumentToken: '101',
      tradingSymbol: 'NIFTY26OCT24500CE',
      optionType: OptionType.CE,
      strikePrice: 24500,
      expiryDate: '2026-10-29',
      askPrice: 42.5, // Exactly preferred
      bidPrice: 41.5, // Spread 1.0
      bidAskSpread: 1.0,
      askQuantity: 100,
      volume: 10000,
    };

    const candidateB: MockCandidate = {
      instrumentToken: '102',
      tradingSymbol: 'NIFTY26OCT24550CE',
      optionType: OptionType.CE,
      strikePrice: 24550,
      expiryDate: '2026-10-29',
      askPrice: 44.0, // 1.5 away from preferred
      bidPrice: 42.8, // Spread 1.2
      bidAskSpread: 1.2,
      askQuantity: 75,
      volume: 8000,
    };

    const evalA = evaluateCandidate(candidateA, baseConfig);
    const evalB = evaluateCandidate(candidateB, baseConfig);

    expect(evalA.isEligible).toBe(true);
    expect(evalB.isEligible).toBe(true);
    // Candidate A must rank higher because it is closer to preferred premium (42.5) with tighter spread
    expect(evalA.rankScore).toBeGreaterThan(evalB.rankScore);
  });

  it('rejects candidates exceeding max bid-ask spread', () => {
    const wideSpreadCand: MockCandidate = {
      instrumentToken: '103',
      tradingSymbol: 'NIFTY26OCT24600CE',
      optionType: OptionType.CE,
      strikePrice: 24600,
      expiryDate: '2026-10-29',
      askPrice: 43.0,
      bidPrice: 40.0, // Spread = 3.0 (exceeds max 1.5)
      bidAskSpread: 3.0,
      askQuantity: 100,
      volume: 5000,
    };

    const result = evaluateCandidate(wideSpreadCand, baseConfig);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Spread'))).toBe(true);
  });

  it('rejects stale or zero quotes', () => {
    const staleCand: MockCandidate = {
      instrumentToken: '104',
      tradingSymbol: 'NIFTY26OCT24650PE',
      optionType: OptionType.PE,
      strikePrice: 24650,
      expiryDate: '2026-10-29',
      askPrice: 0.0,
      bidPrice: 0.0,
      bidAskSpread: 0.0,
      askQuantity: 0,
      volume: 0,
    };

    const result = evaluateCandidate(staleCand, baseConfig);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Stale quote') || r.includes('range'))).toBe(true);
  });

  it('rejects candidates with insufficient liquidity depth', () => {
    const illiquidCand: MockCandidate = {
      instrumentToken: '105',
      tradingSymbol: 'NIFTY26OCT24700CE',
      optionType: OptionType.CE,
      strikePrice: 24700,
      expiryDate: '2026-10-29',
      askPrice: 42.0,
      bidPrice: 41.0,
      bidAskSpread: 1.0,
      askQuantity: 10, // Below minimum 50
      volume: 500,
    };

    const result = evaluateCandidate(illiquidCand, baseConfig);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Ask quantity'))).toBe(true);
  });

  it('filters by CE or PE direction mismatch', () => {
    const peCand: MockCandidate = {
      instrumentToken: '106',
      tradingSymbol: 'NIFTY26OCT24500PE',
      optionType: OptionType.PE,
      strikePrice: 24500,
      expiryDate: '2026-10-29',
      askPrice: 42.5,
      bidPrice: 41.5,
      bidAskSpread: 1.0,
      askQuantity: 100,
      volume: 10000,
    };

    // When CE is requested
    const result = evaluateCandidate(peCand, { ...baseConfig, direction: 'CE' });
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Direction mismatch'))).toBe(true);
  });
});

describe('Trade Ticket Order Math & Tick Alignment Tests', () => {
  it('validates 0.05 tick size alignment and lot multiples', () => {
    const validOrder = validateOrderMath({
      quantity: 50, // 2 lots
      lotSize: 25,
      price: 42.5,
      targetPrice: 43.5,
      stopLossPrice: 39.5,
      tickSize: 0.05,
    });

    expect(validOrder.isLotAligned).toBe(true);
    expect(validOrder.isPriceTickAligned).toBe(true);
    expect(validOrder.isTargetTickAligned).toBe(true);
    expect(validOrder.isSlTickAligned).toBe(true);
  });

  it('accurately identifies net negative outcome on 1-point gain for 1-lot position', () => {
    const singleLotOrder = validateOrderMath({
      quantity: 25, // 1 lot
      lotSize: 25,
      price: 42.0,
      targetPrice: 43.0, // +1.00 gross gain = ₹25.00
      stopLossPrice: 39.0,
      tickSize: 0.05,
    });

    expect(singleLotOrder.grossProfit).toBe(25.0);
    expect(singleLotOrder.statutoryFees).toBeGreaterThan(singleLotOrder.grossProfit);
    // Net profit is negative because ₹40 brokerage + charges flip ₹25 gross into net loss
    expect(singleLotOrder.isNetPositive).toBe(false);
    expect(singleLotOrder.netProfit).toBeCloseTo(-25.45, 2);
  });

  it('verifies 13-state Order Lifecycle completeness', () => {
    const states = Object.values(OrderLifecycleState);
    expect(states).toContain('CREATED');
    expect(states).toContain('VALIDATING');
    expect(states).toContain('AWAITING_SUBMISSION');
    expect(states).toContain('SUBMITTING');
    expect(states).toContain('ACKNOWLEDGED');
    expect(states).toContain('OPEN');
    expect(states).toContain('PARTIALLY_FILLED');
    expect(states).toContain('FILLED');
    expect(states).toContain('CANCEL_PENDING');
    expect(states).toContain('CANCELLED');
    expect(states).toContain('REJECTED');
    expect(states).toContain('UNKNOWN');
    expect(states).toContain('RECONCILING');
    expect(states.length).toBe(13);
  });
});
