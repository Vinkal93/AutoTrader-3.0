'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import {
  useActiveStrategy,
  useStrategyVersions,
  useStrategyRuns,
  useStrategySchedule,
  useUpdateStrategy,
  useEvaluateStrategy,
  useBacktestStrategy,
} from '@/hooks/use-queries';
import { StrategyConfig, TradingMode } from '@autotrader/api-contracts';
import { formatCurrency, formatISTDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Sliders,
  Calendar,
  Clock,
  History,
  Play,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  BarChart2,
  HelpCircle,
} from 'lucide-react';

export default function StrategyEnginePage() {
  const { data: strategy, isLoading: stratLoading } = useActiveStrategy();
  const strategyId = strategy?.id;

  const { data: schedule } = useStrategySchedule(strategyId);
  const { data: versions } = useStrategyVersions(strategyId);
  const { data: runs } = useStrategyRuns(strategyId);

  const updateStrategy = useUpdateStrategy();
  const evaluateStrategy = useEvaluateStrategy();
  const backtestStrategy = useBacktestStrategy();

  const [activeTab, setActiveTab] = useState<'CONFIG' | 'SCHEDULE' | 'VERSIONS' | 'RUNS' | 'BACKTEST'>('CONFIG');

  // Form states initialized with active config
  const [entryTimeIST, setEntryTimeIST] = useState('12:20');
  const [premiumMin, setPremiumMin] = useState('40.00');
  const [premiumMax, setPremiumMax] = useState('45.00');
  const [targetMove, setTargetMove] = useState('1.00');
  const [initialSL, setInitialSL] = useState('3.00');
  const [lotCount, setLotCount] = useState<number>(1);
  const [maxTradesPerDay, setMaxTradesPerDay] = useState<number>(1);
  const [sidewaysAction, setSidewaysAction] = useState<'SKIP' | 'WAIT' | 'ENTER_CAUTIOUS'>('SKIP');
  const [maxSpread, setMaxSpread] = useState('1.50');
  const [minLiquidity, setMinLiquidity] = useState<number>(50);

  // Risk limits
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState('');
  const [maxDailyLoss, setMaxDailyLoss] = useState('');
  const [minTradingFunds, setMinTradingFunds] = useState('');
  const [timeBasedExitIST, setTimeBasedExitIST] = useState('15:15');

  // Modal / Feedback state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Sync form when strategy data loads
  useEffect(() => {
    if (strategy?.config) {
      const cfg = strategy.config;
      setEntryTimeIST(cfg.entryTimeIST || '12:20');
      setPremiumMin(cfg.premiumMin || '40.00');
      setPremiumMax(cfg.premiumMax || '45.00');
      setTargetMove(cfg.targetPremiumMove || '1.00');
      setInitialSL(cfg.initialStopLoss || '3.00');
      setLotCount(cfg.lotCount || 1);
      setMaxTradesPerDay(cfg.maxTradesPerDay || 1);
      setSidewaysAction(cfg.sidewaysAction || 'SKIP');
      setMaxSpread(cfg.maxBidAskSpread || '1.50');
      setMinLiquidity(cfg.minLiquidity || 50);
      setMaxRiskPerTrade(cfg.maxRiskPerTrade || '');
      setMaxDailyLoss(cfg.maxDailyLoss || '');
      setMinTradingFunds(cfg.minTradingFunds || '');
      setTimeBasedExitIST(cfg.timeBasedExitIST || '15:15');
    }
  }, [strategy]);

  const handleSaveVersion = async () => {
    if (!strategyId) return;

    const newConfig: StrategyConfig = {
      underlying: 'NIFTY',
      instrumentType: 'OPTIONS',
      entryTimeIST,
      premiumMin,
      premiumMax,
      targetPremiumMove: targetMove,
      initialStopLoss: initialSL,
      candleInterval: '5m',
      trendIndicators: ['EMA_9', 'EMA_21'],
      maxTradesPerDay,
      lotCount,
      sidewaysAction,
      maxRiskPerTrade: maxRiskPerTrade || null,
      maxDailyLoss: maxDailyLoss || null,
      minTradingFunds: minTradingFunds || null,
      maxBidAskSpread: maxSpread || null,
      minLiquidity: minLiquidity || null,
      entryPriceTolerance: '0.50',
      maxDataAgeSeconds: 60,
      maxOrderWaitSeconds: 15,
      timeBasedExitIST,
      expirySelectionPolicy: 'CURRENT_WEEK',
      marketHolidayBehavior: 'SKIP',
      automatedRecoveryPolicy: 'PAUSE',
    };

    try {
      await updateStrategy.mutateAsync({
        strategyId,
        config: newConfig,
        changeReason: changeReason || 'Configuration update via Strategy Settings',
      });
      setSaveSuccess(true);
      setSaveModalOpen(false);
      setChangeReason('');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerEvaluation = async () => {
    if (!strategyId) return;
    try {
      const res = await evaluateStrategy.mutateAsync({ strategyId, force: true });
      setEvalResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  const handleRunBacktest = async () => {
    setBacktestRunning(true);
    try {
      const res = await backtestStrategy.mutateAsync({ symbol: 'NIFTY', interval: '5m' });
      setBacktestResult(res);
    } finally {
      setBacktestRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Strategy Configuration & Engine"
        subtitle="Version-controlled 12:20 PM IST directional options engine, market calendar scheduling, and backtesting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Strategy Settings' },
        ]}
      />

      {/* Top Telemetry & Schedule Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
            v{strategy?.version ?? 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                {strategy?.name ?? 'NIFTY 12:20 Rule-Based Directional Buyer'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Active Strategy
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Scheduled entry at {entryTimeIST} IST on trading days • Max 1 trade/day
            </p>
          </div>
        </div>

        {/* Schedule & Countdown Pill */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Next Run: <strong>{schedule?.nextRunIST ?? 'Today 12:20:00 IST'}</strong></span>
            {schedule && schedule.timeRemainingSeconds > 0 && (
              <span className="text-blue-600 font-bold">
                ({Math.floor(schedule.timeRemainingSeconds / 3600)}h {Math.floor((schedule.timeRemainingSeconds % 3600) / 60)}m)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleTriggerEvaluation}
            disabled={evaluateStrategy.isPending}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> Run Evaluation Now
          </button>
        </div>
      </div>

      {/* Evaluation Result Flash Banner */}
      {evalResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-blue-900">Evaluation Decision: {evalResult.decision}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold">
                {evalResult.tradeDate}
              </span>
            </div>
            <p className="text-blue-800">{evalResult.reason}</p>
            {evalResult.selectedContract && (
              <div className="font-mono text-[11px] pt-1 text-blue-900 font-semibold">
                Selected Contract: {evalResult.selectedContract.tradingSymbol} (Ask: ₹{evalResult.selectedContract.askPrice})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>New Strategy Version v{strategy?.version ? strategy.version + 1 : 2} saved and validated successfully!</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('CONFIG')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'CONFIG' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Sliders className="w-3.5 h-3.5" /> Configuration & Risk Limits
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SCHEDULE')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'SCHEDULE' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Calendar className="w-3.5 h-3.5" /> Market Calendar & Schedule
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VERSIONS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'VERSIONS' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <History className="w-3.5 h-3.5" /> Version History ({versions?.length ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RUNS')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'RUNS' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <Layers className="w-3.5 h-3.5" /> Decision Runs ({runs?.length ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BACKTEST')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'BACKTEST' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          )}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Backtesting Simulator
        </button>
      </div>

      {/* TAB 1: CONFIGURATION & PARAMETERS */}
      {activeTab === 'CONFIG' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD 1: Core Strategy Rules */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-neutral-900">Core Strategy Logic</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-600 font-medium block">Underlying & Instrument</label>
                  <input
                    type="text"
                    disabled
                    value="NIFTY 50 (Options)"
                    className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-neutral-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Daily Scheduled Entry Time (IST)</label>
                  <input
                    type="text"
                    value={entryTimeIST}
                    onChange={(e) => setEntryTimeIST(e.target.value)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Format: HH:mm (Asia/Kolkata)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-600 font-medium block">Candle Interval</label>
                    <input
                      type="text"
                      disabled
                      value="5m (Canonical)"
                      className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-neutral-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 font-medium block">Max Trades / Day</label>
                    <input
                      type="number"
                      value={maxTradesPerDay}
                      onChange={(e) => setMaxTradesPerDay(Number(e.target.value))}
                      className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Sideways Market Action</label>
                  <select
                    value={sidewaysAction}
                    onChange={(e) => setSidewaysAction(e.target.value as any)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="SKIP">SKIP (Skip trading for the day)</option>
                    <option value="WAIT">WAIT (Wait for next 5m candle confirmation)</option>
                    <option value="ENTER_CAUTIOUS">ENTER_CAUTIOUS (Half lot sizing)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 2: Premium Scanner & Targets */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-neutral-900">Premium Targets & Stops</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-600 font-medium block">Min Executable Ask</label>
                    <div className="flex items-center gap-1 font-mono mt-1">
                      <span>₹</span>
                      <input
                        type="text"
                        value={premiumMin}
                        onChange={(e) => setPremiumMin(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-600 font-medium block">Max Executable Ask</label>
                    <div className="flex items-center gap-1 font-mono mt-1">
                      <span>₹</span>
                      <input
                        type="text"
                        value={premiumMax}
                        onChange={(e) => setPremiumMax(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-600 font-medium block">Target Premium Move</label>
                    <div className="flex items-center gap-1 font-mono mt-1">
                      <span>+₹</span>
                      <input
                        type="text"
                        value={targetMove}
                        onChange={(e) => setTargetMove(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-600 font-medium block">Initial Stop Loss</label>
                    <div className="flex items-center gap-1 font-mono mt-1">
                      <span>-₹</span>
                      <input
                        type="text"
                        value={initialSL}
                        onChange={(e) => setInitialSL(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-600 font-medium block">Max Spread (₹)</label>
                    <input
                      type="text"
                      value={maxSpread}
                      onChange={(e) => setMaxSpread(e.target.value)}
                      className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 font-medium block">Min Ask Depth</label>
                    <input
                      type="number"
                      value={minLiquidity}
                      onChange={(e) => setMinLiquidity(Number(e.target.value))}
                      className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Default Lot Count</label>
                  <input
                    type="number"
                    value={lotCount}
                    onChange={(e) => setLotCount(Number(e.target.value))}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">1 Lot = 25 Quantities (NIFTY)</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Risk Limits & Live Guard */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-sm text-neutral-900">Risk Governance Limits</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-600 font-medium block">Max Risk Per Trade (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 500.00"
                    value={maxRiskPerTrade}
                    onChange={(e) => setMaxRiskPerTrade(e.target.value)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Max Daily Loss Limit (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1500.00"
                    value={maxDailyLoss}
                    onChange={(e) => setMaxDailyLoss(e.target.value)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Min Trading Funds Reserve (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10000.00"
                    value={minTradingFunds}
                    onChange={(e) => setMinTradingFunds(e.target.value)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 font-medium block">Auto Square-Off Time (IST)</label>
                  <input
                    type="text"
                    value={timeBasedExitIST}
                    onChange={(e) => setTimeBasedExitIST(e.target.value)}
                    className="mt-1 w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Hard intraday exit: 15:15 IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-sans">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Saving increments strategy version and stores an immutable audit snapshot in PostgreSQL.</span>
            </div>

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              disabled={updateStrategy.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save as New Version
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET CALENDAR & SCHEDULE */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500">Market Trading Day?</span>
              <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
                {schedule?.isTradingDay ? 'YES (Active Day)' : 'NO (Non-Trading)'}
              </p>
              <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
                {schedule?.isHoliday ? schedule.holidayName ?? 'Holiday' : 'Regular Equity & F&O Hours'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500">Next Evaluation Target</span>
              <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
                {schedule?.nextRunIST ? schedule.nextRunIST.slice(11, 16) + ' IST' : '12:20 IST'}
              </p>
              <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
                {schedule?.nextRunIST ? schedule.nextRunIST.slice(0, 10) : 'Today'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500">Already Run Today?</span>
              <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
                {schedule?.alreadyRunToday ? 'YES (Executed)' : 'NO (Pending)'}
              </p>
              <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
                Max 1 scheduled evaluation / day
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500">Exchange Hours State</span>
              <p className="font-mono text-xl font-bold text-neutral-900 mt-1">
                {schedule?.isMarketOpen ? 'OPEN (09:15-15:30)' : 'CLOSED'}
              </p>
              <span className="text-[11px] text-neutral-400 font-sans mt-2 block">
                Server IST: {schedule?.serverTimeIST ?? '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'VERSIONS' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Immutable Version Snapshots</h4>
              <p className="text-xs text-neutral-500">All persisted configuration iterations with full parameters</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Created At</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Ask Range</th>
                  <th className="py-2.5 px-3">Target / SL</th>
                  <th className="py-2.5 px-3">Change Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {!versions || versions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No version history found.
                    </td>
                  </tr>
                ) : (
                  versions.map((ver) => (
                    <tr key={ver.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-blue-600">v{ver.versionNumber}</td>
                      <td className="py-3 px-3 text-neutral-500 font-sans text-[11px]">
                        {formatISTDateTime(ver.createdAt)}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px]">{ver.createdBy ?? 'system'}</td>
                      <td className="py-3 px-3">₹{ver.config.premiumMin} - ₹{ver.config.premiumMax}</td>
                      <td className="py-3 px-3 text-neutral-600">
                        +₹{ver.config.targetPremiumMove} / -₹{ver.config.initialStopLoss}
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-600 max-w-sm truncate">
                        {ver.changeReason ?? 'Standard update'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DECISION RUNS */}
      {activeTab === 'RUNS' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Decision & Analysis Run Ledger</h4>
              <p className="text-xs text-neutral-500">Every scheduled 12:20 PM IST decision, candidate, and rejection reason</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Trade Date</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Selected Contract</th>
                  <th className="py-2.5 px-3">Evaluated At</th>
                  <th className="py-2.5 px-3">Decision Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {!runs || runs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-400 font-sans text-xs">
                      No decision runs recorded yet. Runs execute automatically at 12:20 PM IST.
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-bold">{r.tradeDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border',
                            r.decision === 'ENTER_CE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : r.decision === 'ENTER_PE'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          )}
                        >
                          {r.decision}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-neutral-900">
                        {r.selectedContract ? r.selectedContract.tradingSymbol : '—'}
                      </td>
                      <td className="py-3 px-3 text-neutral-500 font-sans text-[11px]">
                        {formatISTDateTime(r.evaluatedAt)}
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-600 max-w-md truncate">
                        {r.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BACKTESTING SIMULATOR */}
      {activeTab === 'BACKTEST' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Isolated Backtesting Simulator</h4>
              <p className="text-xs text-neutral-500">
                Evaluates EMA 9/21 rules chronologically at 12:20 PM on completed 5m bars without lookahead leakage
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunBacktest}
              disabled={backtestRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {backtestRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Simulating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Execute Backtest Simulation
                </>
              )}
            </button>
          </div>

          {backtestResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-400 font-medium">Evaluated Days</span>
                  <p className="font-mono text-base font-bold text-neutral-900 mt-0.5">
                    {backtestResult.evaluatedDays} Days
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-400 font-medium">Trade Signals</span>
                  <p className="font-mono text-base font-bold text-neutral-900 mt-0.5">
                    {backtestResult.tradeSignals} ({backtestResult.ceSignals} CE / {backtestResult.peSignals} PE)
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-400 font-medium">Skipped (Sideways)</span>
                  <p className="font-mono text-base font-bold text-neutral-900 mt-0.5">
                    {backtestResult.skippedDays} Days
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-400 font-medium">Est. Net Outcome</span>
                  <p className={cn('font-mono text-base font-bold mt-0.5', backtestResult.totalEstimatedNetPnl >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    ₹{backtestResult.totalEstimatedNetPnl.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Signal Log Table */}
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Signal</th>
                      <th className="py-2 px-3 text-right">Spot</th>
                      <th className="py-2 px-3 text-right">EMA 9</th>
                      <th className="py-2 px-3 text-right">EMA 21</th>
                      <th className="py-2 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {backtestResult.signalLog.map((log: any, i: number) => (
                      <tr key={`log-${i}`} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-bold">{log.date}</td>
                        <td className="py-2 px-3 text-neutral-500">{log.timeIST}</td>
                        <td className="py-2 px-3 font-bold">
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded font-bold uppercase text-[10px]',
                              log.signal === 'BUY_CE'
                                ? 'bg-blue-50 text-blue-700'
                                : log.signal === 'BUY_PE'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-neutral-100 text-neutral-500'
                            )}
                          >
                            {log.signal}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">₹{log.spotPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-blue-600">₹{log.ema9.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-amber-600">₹{log.ema21.toFixed(2)}</td>
                        <td className="py-2 px-3 font-sans text-neutral-500 truncate max-w-xs">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">Save New Strategy Version</h3>
                <p className="text-xs text-neutral-500">Creates immutable snapshot v{strategy?.version ? strategy.version + 1 : 2}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Audit Log: Reason for Configuration Change
              </label>
              <textarea
                rows={3}
                placeholder="Describe your adjustments (e.g. Adjusted premium range to 40-45, set daily loss limit to 1500)..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVersion}
                disabled={updateStrategy.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                {updateStrategy.isPending ? 'Validating...' : 'Confirm & Save Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
