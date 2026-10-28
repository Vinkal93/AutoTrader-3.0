import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  API_ROUTES,
  type HealthResponse,
  type SystemStatusResponse,
  type BrokerConnectionResponse,
  type AccountFundsResponse,
  type Position,
  type Order,
  type Trade,
  type NiftyQuote,
  type Strategy,
  type DashboardOverview,
  type SystemEvent,
  type TradingMode,
  type EngineState,
  type TradeCycleDetail,
  type PerformanceMetrics,
  type RiskAllowance,
  type CandlesResponse,
  type OptionChainResponse,
  type TrendAnalysis,
  type ScannerResult,
  type ScannerConfig,
  type OrderValidationRequest,
  type OrderValidationResult,
  type StrategyVersionRecord,
  type StrategyRunRecord,
  type StrategyScheduleStatus,
  type BacktestRequest,
  type BacktestResult,
  type StrategyConfig,
} from '@autotrader/api-contracts';

// Query keys
export const queryKeys = {
  health: ['health'] as const,
  systemStatus: ['systemStatus'] as const,
  brokerConnection: ['brokerConnection'] as const,
  accountFunds: ['accountFunds'] as const,
  positions: ['positions'] as const,
  orders: ['orders'] as const,
  trades: ['trades'] as const,
  tradeCycles: (page: number, pageSize: number) => ['tradeCycles', page, pageSize] as const,
  tradeCycleDetail: (id: string) => ['tradeCycleDetail', id] as const,
  performanceMetrics: (timeframe: string) => ['performanceMetrics', timeframe] as const,
  riskAllowance: ['riskAllowance'] as const,
  candles: (symbol: string, interval: string) => ['candles', symbol, interval] as const,
  optionChain: (symbol: string, expiry?: string) => ['optionChain', symbol, expiry] as const,
  marketTrend: ['marketTrend'] as const,
  marketScanner: (params?: Partial<ScannerConfig>) => ['marketScanner', params] as const,
  niftyQuote: ['niftyQuote'] as const,
  strategies: ['strategies'] as const,
  activeStrategy: ['activeStrategy'] as const,
  strategyVersions: (id: string) => ['strategyVersions', id] as const,
  strategyRuns: (id: string) => ['strategyRuns', id] as const,
  strategySchedule: (id: string) => ['strategySchedule', id] as const,
  dashboardOverview: ['dashboardOverview'] as const,
  systemEvents: ['systemEvents'] as const,
};

// 1. Health
export function useHealth(refetchInterval: number | false = 30000) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const res = await api.get<HealthResponse>(API_ROUTES.health);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 2. System Status
export function useSystemStatus(refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.systemStatus,
    queryFn: async () => {
      const res = await api.get<SystemStatusResponse>(API_ROUTES.systemStatus);
      return res.data;
    },
    refetchInterval,
    retry: 2,
  });
}

// 3. Broker Connection
export function useBrokerConnection(refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: queryKeys.brokerConnection,
    queryFn: async () => {
      const res = await api.get<BrokerConnectionResponse>(API_ROUTES.brokerConnection);
      return res.data;
    },
    refetchInterval,
    retry: 2,
  });
}

// 4. Account Funds
export function useAccountFunds(refetchInterval: number | false = 15000) {
  return useQuery({
    queryKey: queryKeys.accountFunds,
    queryFn: async () => {
      const res = await api.get<AccountFundsResponse>(API_ROUTES.accountFunds);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 5. Positions
export function usePositions(refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: async () => {
      const res = await api.get<Position[]>(API_ROUTES.positions);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 6. Orders
export function useOrders(refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      const res = await api.get<Order[]>(API_ROUTES.orders);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 7. Trades
export function useTrades(refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: queryKeys.trades,
    queryFn: async () => {
      const res = await api.get<Trade[]>(API_ROUTES.trades);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 8. NIFTY Quote
export function useNiftyQuote(refetchInterval: number | false = 3000) {
  return useQuery({
    queryKey: queryKeys.niftyQuote,
    queryFn: async () => {
      const res = await api.get<NiftyQuote>(API_ROUTES.niftyQuote);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 9. Strategies
export function useStrategies() {
  return useQuery({
    queryKey: queryKeys.strategies,
    queryFn: async () => {
      const res = await api.get<Strategy[]>(API_ROUTES.strategies);
      return res.data;
    },
    retry: 1,
  });
}

// 10. Active Strategy
export function useActiveStrategy() {
  return useQuery({
    queryKey: queryKeys.activeStrategy,
    queryFn: async () => {
      const res = await api.get<Strategy | null>(API_ROUTES.activeStrategy);
      return res.data;
    },
    retry: 1,
  });
}

// 11. Dashboard Overview
export function useDashboardOverview(refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: async () => {
      const res = await api.get<DashboardOverview>(API_ROUTES.dashboardOverview);
      return res.data;
    },
    refetchInterval,
    retry: 2,
  });
}

// 12. System Events
export function useSystemEvents(limit = 50, refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: [...queryKeys.systemEvents, limit],
    queryFn: async () => {
      const res = await api.get<SystemEvent[]>(`${API_ROUTES.systemEvents}?limit=${limit}`);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 13. Trade Cycles
export function useTradeCycles(page = 1, pageSize = 20, refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: queryKeys.tradeCycles(page, pageSize),
    queryFn: async () => {
      const res = await api.get<TradeCycleDetail[]>(`${API_ROUTES.tradeCycles}?page=${page}&page_size=${pageSize}`);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 14. Trade Cycle Detail
export function useTradeCycleDetail(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.tradeCycleDetail(id) : ['tradeCycleDetail', 'none'],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get<TradeCycleDetail>(`${API_ROUTES.tradeCycles}/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
    retry: 1,
  });
}

// 15. Performance Metrics
export function usePerformanceMetrics(timeframe: 'TODAY' | '7D' | '30D' | 'ALL' = 'TODAY', refetchInterval: number | false = 15000) {
  return useQuery({
    queryKey: queryKeys.performanceMetrics(timeframe),
    queryFn: async () => {
      const res = await api.get<PerformanceMetrics>(`${API_ROUTES.analyticsPerformance}?timeframe=${timeframe}`);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 16. Risk Allowance
export function useRiskAllowance(refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: queryKeys.riskAllowance,
    queryFn: async () => {
      const res = await api.get<RiskAllowance>('/api/v1/analytics/risk');
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// 17. Candlesticks
export function useCandles(symbol = 'NIFTY', interval = '5m', refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.candles(symbol, interval),
    queryFn: async () => {
      const res = await api.get<CandlesResponse>(`${API_ROUTES.candles}?symbol=${symbol}&interval=${interval}`);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

// Mutations
export function useReconnectBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<BrokerConnectionResponse>(API_ROUTES.brokerConnect);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokerConnection });
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      queryClient.invalidateQueries({ queryKey: ['accountFunds'] });
    },
  });
}

export function useSetTradingMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: TradingMode) => {
      const res = await api.post<SystemStatusResponse>(API_ROUTES.systemMode, { mode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });
}

export function useTransitionEngineState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ state, reason }: { state: EngineState; reason?: string }) => {
      const res = await api.post<SystemStatusResponse>(API_ROUTES.systemEngineState, { state, reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });
}

// Phase 3: Market Scanner & Terminal Hooks

export function useOptionChain(symbol = 'NIFTY', expiry?: string, refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.optionChain(symbol, expiry),
    queryFn: async () => {
      const url = expiry
        ? `${API_ROUTES.optionChain}?symbol=${symbol}&expiry=${expiry}`
        : `${API_ROUTES.optionChain}?symbol=${symbol}`;
      const res = await api.get<OptionChainResponse>(url);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

export function useMarketTrend(symbol = 'NIFTY', interval = '5m', refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.marketTrend,
    queryFn: async () => {
      const res = await api.get<TrendAnalysis>(`${API_ROUTES.marketTrend}?symbol=${symbol}&interval=${interval}`);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

export function useMarketScanner(params?: Partial<ScannerConfig>, refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: queryKeys.marketScanner(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.underlying) queryParams.set('underlying', params.underlying);
      if (params?.premiumMin) queryParams.set('premium_min', params.premiumMin);
      if (params?.premiumMax) queryParams.set('premium_max', params.premiumMax);
      if (params?.preferredPremium) queryParams.set('preferred_premium', params.preferredPremium);
      if (params?.direction) queryParams.set('direction', params.direction);
      if (params?.expiryDate) queryParams.set('expiry', params.expiryDate);
      if (params?.maxSpread) queryParams.set('max_spread', params.maxSpread);
      if (params?.minLiquidity) queryParams.set('min_liquidity', String(params.minLiquidity));

      const qs = queryParams.toString();
      const url = qs ? `${API_ROUTES.marketScanner}?${qs}` : API_ROUTES.marketScanner;
      const res = await api.get<ScannerResult>(url);
      return res.data;
    },
    refetchInterval,
    retry: 1,
  });
}

export function useValidateOrder() {
  return useMutation({
    mutationFn: async (payload: OrderValidationRequest) => {
      const res = await api.post<OrderValidationResult>(API_ROUTES.ordersValidate, payload);
      return res.data;
    },
  });
}

export function useEmergencyExit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ status: string; message: string; haltedAt: string }>(
        API_ROUTES.ordersEmergencyExit
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.positions });
      queryClient.invalidateQueries({ queryKey: queryKeys.systemEvents });
    },
  });
}

// Phase 4: Strategy Engine Hooks

export function useStrategyVersions(strategyId?: string) {
  return useQuery({
    queryKey: strategyId ? queryKeys.strategyVersions(strategyId) : ['strategyVersions'],
    queryFn: async () => {
      if (!strategyId) return [];
      const res = await api.get<StrategyVersionRecord[]>(`/api/v1/strategies/${strategyId}/versions`);
      return res.data;
    },
    enabled: !!strategyId,
    retry: 1,
  });
}

export function useStrategyRuns(strategyId?: string, limit = 50) {
  return useQuery({
    queryKey: strategyId ? queryKeys.strategyRuns(strategyId) : ['strategyRuns'],
    queryFn: async () => {
      if (!strategyId) return [];
      const res = await api.get<StrategyRunRecord[]>(`/api/v1/strategies/${strategyId}/runs?limit=${limit}`);
      return res.data;
    },
    enabled: !!strategyId,
    retry: 1,
  });
}

export function useStrategySchedule(strategyId?: string, refetchInterval: number | false = 10000) {
  return useQuery({
    queryKey: strategyId ? queryKeys.strategySchedule(strategyId) : ['strategySchedule'],
    queryFn: async () => {
      if (!strategyId) return null;
      const res = await api.get<StrategyScheduleStatus>(`/api/v1/strategies/${strategyId}/schedule`);
      return res.data;
    },
    enabled: !!strategyId,
    refetchInterval,
    retry: 1,
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      strategyId,
      config,
      changeReason,
    }: {
      strategyId: string;
      config: StrategyConfig;
      changeReason: string;
    }) => {
      const res = await api.put<Strategy>(`/api/v1/strategies/${strategyId}`, {
        config,
        changeReason,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeStrategy });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategyVersions(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategySchedule(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });
}

export function useEvaluateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ strategyId, force = false }: { strategyId: string; force?: boolean }) => {
      const res = await api.post<StrategyRunRecord>(
        `/api/v1/strategies/${strategyId}/evaluate?force=${force}`
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategyRuns(data.strategyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategySchedule(data.strategyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });
}

export function useBacktestStrategy() {
  return useMutation({
    mutationFn: async (payload: BacktestRequest) => {
      const res = await api.post<BacktestResult>(API_ROUTES.strategyBacktest, payload);
      return res.data;
    },
  });
}
