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
  niftyQuote: ['niftyQuote'] as const,
  strategies: ['strategies'] as const,
  activeStrategy: ['activeStrategy'] as const,
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
    },
  });
}

export function useSetTradingMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: TradingMode) => {
      const res = await api.post<{ mode: TradingMode }>('/api/v1/system/mode', { mode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });
}
