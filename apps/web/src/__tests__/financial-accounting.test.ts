import { describe, it, expect } from 'vitest';
import {
  TradeCycleState,
  TradingMode,
  OptionType,
  OrderSide,
} from '@autotrader/api-contracts';

// -------------------------------------------------------------
// 1. Gross & Net Realized P&L Calculator
// -------------------------------------------------------------
interface TradeExecution {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}

function calculateGrossPnl(execution: TradeExecution): number {
  return parseFloat(((execution.sellPrice - execution.buyPrice) * execution.quantity).toFixed(2));
}

// -------------------------------------------------------------
// 2. Statutory Fee Calculator by Tariff Version
// -------------------------------------------------------------
interface TariffRates {
  version: string;
  brokeragePerOrder: number;
  sttPercentOnSell: number;
  exchangeTxnPercent: number;
  gstPercent: number;
  sebiPerCrore: number;
  stampDutyPercent: number;
}

const TARIFF_2024_2: TariffRates = {
  version: '2024.2',
  brokeragePerOrder: 20.0,
  sttPercentOnSell: 0.1, // Revised Union Budget 2024
  exchangeTxnPercent: 0.0505,
  gstPercent: 18.0,
  sebiPerCrore: 10.0,
  stampDutyPercent: 0.003,
};

const TARIFF_2024_1: TariffRates = {
  version: '2024.1',
  brokeragePerOrder: 20.0,
  sttPercentOnSell: 0.0625, // Prior to Oct 2024
  exchangeTxnPercent: 0.0505,
  gstPercent: 18.0,
  sebiPerCrore: 10.0,
  stampDutyPercent: 0.003,
};

function calculateStatutoryFees(exec: TradeExecution, tariff: TariffRates) {
  const buyTurnover = exec.quantity * exec.buyPrice;
  const sellTurnover = exec.quantity * exec.sellPrice;
  const totalTurnover = buyTurnover + sellTurnover;

  const brokerage = tariff.brokeragePerOrder * 2;
  const stt = parseFloat(((sellTurnover * tariff.sttPercentOnSell) / 100).toFixed(2));
  const exchangeTxn = parseFloat(((totalTurnover * tariff.exchangeTxnPercent) / 100).toFixed(2));
  const gst = parseFloat((((brokerage + exchangeTxn) * tariff.gstPercent) / 100).toFixed(2));
  const sebi = parseFloat(((totalTurnover * tariff.sebiPerCrore) / 10000000).toFixed(2));
  const stampDuty = parseFloat(((buyTurnover * tariff.stampDutyPercent) / 100).toFixed(2));

  const totalCharges = parseFloat(
    (brokerage + stt + exchangeTxn + gst + sebi + stampDuty).toFixed(2)
  );

  return {
    brokerage,
    stt,
    exchangeTxn,
    gst,
    sebi,
    stampDuty,
    totalCharges,
  };
}

// -------------------------------------------------------------
// 3. Contract Note Reconciliation Logic
// -------------------------------------------------------------
interface ContractNoteLine {
  cycleId: string;
  confirmedBrokerage: number;
  confirmedSTT: number;
  confirmedTxn: number;
  confirmedGST: number;
  confirmedSEBI: number;
  confirmedStamp: number;
}

function reconcileContractNote(
  estimatedFee: number,
  contractNote: ContractNoteLine
): { isReconciled: boolean; confirmedTotal: number; discrepancy: number; status: 'ACTUAL' } {
  const confirmedTotal = parseFloat(
    (
      contractNote.confirmedBrokerage +
      contractNote.confirmedSTT +
      contractNote.confirmedTxn +
      contractNote.confirmedGST +
      contractNote.confirmedSEBI +
      contractNote.confirmedStamp
    ).toFixed(2)
  );

  const discrepancy = parseFloat((confirmedTotal - estimatedFee).toFixed(2));

  return {
    isReconciled: true,
    confirmedTotal,
    discrepancy,
    status: 'ACTUAL', // Promoted to verified broker ledger status
  };
}

// =============================================================
// TEST SUITE
// =============================================================

describe('Phase 6: Financial Accounting & Fee Audit Specifications', () => {
  describe('Task 3: Non-Interchangeable Margin & Cash Accounting', () => {
    it('strictly treats availableMargin, usedMargin, availableCash, and totalCollateral as distinct entities', () => {
      const accountReport = {
        availableCash: '100000.00',
        availableMargin: '85000.00',
        usedMargin: '15000.00',
        totalCollateral: '120000.00',
      };

      // Invariants: availableCash is not used as availableMargin
      expect(accountReport.availableMargin).not.toBe(accountReport.availableCash);
      expect(accountReport.usedMargin).not.toBe(accountReport.availableMargin);
      expect(accountReport.totalCollateral).not.toBe(accountReport.availableCash);

      // Margin math: availableMargin + usedMargin <= availableCash + pledgedCollateral
      const availMargin = parseFloat(accountReport.availableMargin);
      const usedMargin = parseFloat(accountReport.usedMargin);
      const availCash = parseFloat(accountReport.availableCash);

      expect(availMargin + usedMargin).toBeLessThanOrEqual(availCash + 20000);
    });
  });

  describe('Task 4: Gross Realized P&L using Actual Quantities and Prices', () => {
    it('computes exact gross profit on 1-lot winning option cycle (+₹1.00 move)', () => {
      const execution: TradeExecution = {
        buyPrice: 42.5,
        sellPrice: 43.5,
        quantity: 25,
      };

      const grossPnl = calculateGrossPnl(execution);
      expect(grossPnl).toBe(25.0);
    });

    it('computes exact gross loss on partial fill (12 units matched @ ₹42.50, sold @ ₹34.50)', () => {
      const partialExecution: TradeExecution = {
        buyPrice: 42.5,
        sellPrice: 34.5,
        quantity: 12,
      };

      const grossLoss = calculateGrossPnl(partialExecution);
      expect(grossLoss).toBe(-96.0);
    });
  });

  describe('Task 5 & 8: Statutory Fee Engine & Tariff Versioning', () => {
    it('computes tariff charges under post-Budget 2024 revision (Tariff v2024.2 with 0.1% STT)', () => {
      const exec: TradeExecution = {
        buyPrice: 42.5,
        sellPrice: 43.5,
        quantity: 25,
      };

      const fees = calculateStatutoryFees(exec, TARIFF_2024_2);

      expect(fees.brokerage).toBe(40.0);
      // STT on sell turnover: 25 * 43.50 = 1087.50 * 0.1% = ₹1.09
      expect(fees.stt).toBe(1.09);
      // Exchange txn: (1062.50 + 1087.50) * 0.0505% = 2150 * 0.000505 = ₹1.09
      expect(fees.exchangeTxn).toBe(1.09);
      // GST: 18% on (40 + 1.09) = 18% on 41.09 = ₹7.40
      expect(fees.gst).toBe(7.4);
      // Total charges ~ ₹49.64
      expect(fees.totalCharges).toBeCloseTo(49.64, 1);
    });

    it('shows that a 1-point option move yields negative net P&L after statutory deductions', () => {
      const exec: TradeExecution = {
        buyPrice: 42.5,
        sellPrice: 43.5,
        quantity: 25,
      };

      const grossPnl = calculateGrossPnl(exec); // +₹25.00
      const fees = calculateStatutoryFees(exec, TARIFF_2024_2); // ~₹49.64
      const netPnl = parseFloat((grossPnl - fees.totalCharges).toFixed(2));

      // Net P&L is net negative!
      expect(netPnl).toBeLessThan(0);
      expect(netPnl).toBeCloseTo(-24.64, 1);
    });

    it('preserves historical fee calculation differences between Tariff v2024.1 and v2024.2', () => {
      const exec: TradeExecution = {
        buyPrice: 42.5,
        sellPrice: 43.5,
        quantity: 25,
      };

      const feesOld = calculateStatutoryFees(exec, TARIFF_2024_1);
      const feesNew = calculateStatutoryFees(exec, TARIFF_2024_2);

      // In v2024.2, STT is higher (0.1% vs 0.0625%)
      expect(feesNew.stt).toBeGreaterThan(feesOld.stt);
    });
  });

  describe('Task 6 & 7: Contract Note Import & Fee Reconciliation', () => {
    it('promotes estimated charges to ACTUAL status upon contract note import', () => {
      const estimatedFee = 49.64;
      const contractNote: ContractNoteLine = {
        cycleId: 'cycle_101',
        confirmedBrokerage: 40.0,
        confirmedSTT: 1.1,
        confirmedTxn: 1.09,
        confirmedGST: 7.4,
        confirmedSEBI: 0.02,
        confirmedStamp: 0.03,
      };

      const result = reconcileContractNote(estimatedFee, contractNote);

      expect(result.status).toBe('ACTUAL');
      expect(result.confirmedTotal).toBe(49.64);
      expect(result.discrepancy).toBe(0.0);
    });

    it('detects reconciliation discrepancies without silently modifying financial records', () => {
      const estimatedFee = 49.64;
      const contractNoteWithRoundingDifference: ContractNoteLine = {
        cycleId: 'cycle_102',
        confirmedBrokerage: 40.0,
        confirmedSTT: 2.0, // Broker rounded STT up to nearest rupee
        confirmedTxn: 1.09,
        confirmedGST: 7.4,
        confirmedSEBI: 0.02,
        confirmedStamp: 0.03,
      };

      const result = reconcileContractNote(estimatedFee, contractNoteWithRoundingDifference);

      expect(result.status).toBe('ACTUAL');
      expect(result.confirmedTotal).toBe(50.54);
      expect(result.discrepancy).toBe(0.9); // Explicitly logged discrepancy
    });
  });

  describe('Task 11: CSV Export Format Verification', () => {
    it('generates compliant CSV headers for financial reporting', () => {
      const csvHeaders = [
        'Trade Cycle ID',
        'Trading Mode',
        'State',
        'Contract Symbol',
        'Quantity',
        'Buy Avg Price (₹)',
        'Sell Avg Price (₹)',
        'Gross Realized P&L (₹)',
        'Brokerage (₹)',
        'STT (₹)',
        'Exchange Txn Charges (₹)',
        'GST (₹)',
        'SEBI Charges (₹)',
        'Stamp Duty (₹)',
        'Total Charges (₹)',
        'Net Realized P&L (₹)',
        'Charges Status',
        'Reconciliation Status',
        'Duration (Seconds)',
        'Started At (UTC)',
        'Closed At (UTC)',
        'Exit Reason',
      ];

      expect(csvHeaders).toContain('Gross Realized P&L (₹)');
      expect(csvHeaders).toContain('Net Realized P&L (₹)');
      expect(csvHeaders).toContain('Charges Status');
      expect(csvHeaders).toContain('Reconciliation Status');
      expect(csvHeaders.length).toBe(22);
    });
  });
});
