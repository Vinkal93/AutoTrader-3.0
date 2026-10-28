import { describe, it, expect } from 'vitest';

// Pure logic routines mirroring Phase 8 Monitoring & Recovery rules

function evaluateWorkerHeartbeat(lastHeartbeatSecondsAgo: number, timeoutSeconds = 15) {
  if (lastHeartbeatSecondsAgo <= timeoutSeconds) {
    return { status: 'ACTIVE', isSafe: true };
  }
  return { status: 'TIMEOUT', isSafe: false, reason: `Heartbeat age ${lastHeartbeatSecondsAgo}s exceeded limit of ${timeoutSeconds}s` };
}

function evaluateMarketFeedStaleness(stalenessSeconds: number, timeoutSeconds = 30) {
  if (stalenessSeconds <= timeoutSeconds) {
    return { status: 'LIVE', isSafe: true };
  }
  return { status: 'STALE', isSafe: false, reason: `Market feed stale by ${stalenessSeconds}s` };
}

function checkAlertDeduplication(
  lastTriggeredTimestamp: string,
  currentTimestamp: string,
  dedupWindowSeconds = 300
): { isDuplicate: boolean; action: 'DEDUPLICATED' | 'DELIVER' } {
  const diffSec = (new Date(currentTimestamp).getTime() - new Date(lastTriggeredTimestamp).getTime()) / 1000;
  if (diffSec < dedupWindowSeconds) {
    return { isDuplicate: true, action: 'DEDUPLICATED' };
  }
  return { isDuplicate: false, action: 'DELIVER' };
}

function detectUnprotectedPositions(
  positions: Array<{ symbol: string; qty: number; hasStopLoss: boolean }>
) {
  const unprotected = positions.filter((p) => !p.hasStopLoss && p.qty > 0);
  return {
    isSafe: unprotected.length === 0,
    unprotectedCount: unprotected.length,
    unprotectedPositions: unprotected,
  };
}

function evaluateResumptionSafety({
  workerHeartbeatSafe,
  brokerSessionValid,
  unprotectedPositionsCount,
  activeCriticalIncidentsCount,
}: {
  workerHeartbeatSafe: boolean;
  brokerSessionValid: boolean;
  unprotectedPositionsCount: number;
  activeCriticalIncidentsCount: number;
}) {
  const blockers: string[] = [];
  if (!workerHeartbeatSafe) blockers.push('Worker heartbeat timeout');
  if (!brokerSessionValid) blockers.push('Broker session expired');
  if (unprotectedPositionsCount > 0) blockers.push(`${unprotectedPositionsCount} unprotected positions`);
  if (activeCriticalIncidentsCount > 0) blockers.push(`${activeCriticalIncidentsCount} active critical incidents`);

  return {
    canResume: blockers.length === 0,
    blockers,
  };
}

describe('System Monitoring & Watchdog Invariants (Phase 8)', () => {
  it('detects worker process crashes and heartbeat timeouts (>15s)', () => {
    // 5s old heartbeat -> ACTIVE
    expect(evaluateWorkerHeartbeat(5)).toEqual({ status: 'ACTIVE', isSafe: true });
    // 15s old heartbeat -> ACTIVE (boundary)
    expect(evaluateWorkerHeartbeat(15)).toEqual({ status: 'ACTIVE', isSafe: true });
    // 16s old heartbeat -> TIMEOUT (unsafe)
    const crashed = evaluateWorkerHeartbeat(16);
    expect(crashed.status).toBe('TIMEOUT');
    expect(crashed.isSafe).toBe(false);
  });

  it('detects market-feed staleness during active market hours (>30s)', () => {
    expect(evaluateMarketFeedStaleness(1)).toEqual({ status: 'LIVE', isSafe: true });
    expect(evaluateMarketFeedStaleness(30)).toEqual({ status: 'LIVE', isSafe: true });

    const stale = evaluateMarketFeedStaleness(45);
    expect(stale.status).toBe('STALE');
    expect(stale.isSafe).toBe(false);
  });

  it('deduplicates repeating critical alerts within 5-minute window to prevent alert storms', () => {
    const t0 = '2026-10-28T10:00:00.000Z';
    const t1 = '2026-10-28T10:02:30.000Z'; // 150 seconds later -> duplicate
    const t2 = '2026-10-28T10:06:00.000Z'; // 360 seconds later -> fresh delivery

    expect(checkAlertDeduplication(t0, t1)).toEqual({ isDuplicate: true, action: 'DEDUPLICATED' });
    expect(checkAlertDeduplication(t0, t2)).toEqual({ isDuplicate: false, action: 'DELIVER' });
  });

  it('detects open positions missing protective stop loss and triggers critical escalation', () => {
    const positions = [
      { symbol: 'NIFTY24OCT25500CE', qty: 25, hasStopLoss: true },
      { symbol: 'NIFTY24OCT25500PE', qty: 25, hasStopLoss: false },
    ];
    const res = detectUnprotectedPositions(positions);
    expect(res.isSafe).toBe(false);
    expect(res.unprotectedCount).toBe(1);
    expect(res.unprotectedPositions[0].symbol).toBe('NIFTY24OCT25500PE');
  });

  it('prohibits trading resumption until all safety preconditions and reconciliations pass', () => {
    // Failure condition: heartbeat down
    const blockedRes = evaluateResumptionSafety({
      workerHeartbeatSafe: false,
      brokerSessionValid: true,
      unprotectedPositionsCount: 0,
      activeCriticalIncidentsCount: 0,
    });
    expect(blockedRes.canResume).toBe(false);
    expect(blockedRes.blockers).toContain('Worker heartbeat timeout');

    // Safe condition: all green
    const safeRes = evaluateResumptionSafety({
      workerHeartbeatSafe: true,
      brokerSessionValid: true,
      unprotectedPositionsCount: 0,
      activeCriticalIncidentsCount: 0,
    });
    expect(safeRes.canResume).toBe(true);
    expect(safeRes.blockers).toHaveLength(0);
  });
});
