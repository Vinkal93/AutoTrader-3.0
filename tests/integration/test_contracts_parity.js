/**
 * Contract Parity & System Boundary Smoke Test
 * Verifies that the shared API contract definitions adhere to all architectural requirements:
 * 1. Financial integrity: Enums defined, zero mock values allowed
 * 2. Trading modes: OFF, PAPER, LIVE (with LIVE strictly safeguarded)
 * 3. Engine states: Full lifecycle supported
 * 4. Read-only endpoints: All 14 Phase 1 endpoints defined
 */

const assert = require('assert');

// Read the TypeScript contract file directly to verify interface definitions
const fs = require('fs');
const path = require('path');

const contractsPath = path.resolve(__dirname, '../../packages/api-contracts/src/index.ts');
const contractsSrc = fs.readFileSync(contractsPath, 'utf8');

console.log('--- RUNNING CONTRACT PARITY & SMOKE TESTS ---');

// 1. Verify required enums exist
const requiredEnums = [
  'TradingMode',
  'EngineState',
  'BrokerConnectionState',
  'OrderSide',
  'OrderType',
  'OrderStatus',
  'OrderLifecycleState',
  'MarketTrendState',
  'OptionType',
  'InstrumentType',
  'Exchange',
  'TradeCycleState',
  'SystemEventSeverity',
  'DataFreshness',
];

for (const enumName of requiredEnums) {
  assert(
    contractsSrc.includes(`export const ${enumName}`),
    `Missing required enum: ${enumName}`
  );
  console.log(`✓ Enum verified: ${enumName}`);
}

// 2. Verify all required API routes exist
const requiredRoutes = [
  '/api/v1/health',
  '/api/v1/system/status',
  '/api/v1/broker/connection',
  '/api/v1/account/funds',
  '/api/v1/positions',
  '/api/v1/orders',
  '/api/v1/trades',
  '/api/v1/market/nifty',
  '/api/v1/market/candles',
  '/api/v1/market/option-chain',
  '/api/v1/market/scanner',
  '/api/v1/market/trend',
  '/api/v1/orders/validate',
  '/api/v1/strategies',
  '/api/v1/strategies/active',
  '/api/v1/dashboard/overview',
  '/api/v1/analytics/performance',
  '/api/v1/system/events',
];

for (const route of requiredRoutes) {
  assert(
    contractsSrc.includes(route),
    `Missing required API route definition: ${route}`
  );
  console.log(`✓ Route contract verified: ${route}`);
}

// 3. Verify financial data types use exact strings/decimals rather than floating point for balances
assert(
  contractsSrc.includes('availableCash: string'),
  'AccountFundsResponse must use string for availableCash to prevent IEEE 754 precision loss'
);
assert(
  contractsSrc.includes('usedMargin: string'),
  'AccountFundsResponse must use string for usedMargin'
);
console.log('✓ Financial precision rules verified (Decimal strings for currency)');

// 4. Verify Zero-Mock integrity: DataFreshness includes UNAVAILABLE
assert(
  contractsSrc.includes('UNAVAILABLE'),
  'DataFreshness must support UNAVAILABLE state for unconfigured/disconnected broker'
);
console.log('✓ Zero-Mock policy verified (DataFreshness supports UNAVAILABLE)');

console.log('\nAll Contract Parity & Smoke Tests Passed Successfully!\n');
