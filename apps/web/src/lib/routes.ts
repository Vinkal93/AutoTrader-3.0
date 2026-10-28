import {
  LayoutDashboard,
  PlayCircle,
  Sliders,
  History,
  BarChart3,
  Wallet,
  ShieldAlert,
  Bell,
  Cpu,
  Activity,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';

export interface RouteItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'blue' | 'amber' | 'neutral' | 'emerald';
  category: 'core' | 'analytics' | 'management' | 'system';
  isPhaseLocked?: boolean;
  phaseNote?: string;
}

export const APP_ROUTES: RouteItem[] = [
  // Core trading
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    category: 'core',
  },
  {
    id: 'live-trading',
    label: 'Live Trading',
    href: '/live-trading',
    icon: PlayCircle,
    badge: 'Terminal',
    badgeVariant: 'blue',
    category: 'core',
    isPhaseLocked: false,
    phaseNote: 'Professional Live Trading Terminal with Market Scanner and Safely Gated Controls.',
  },
  {
    id: 'strategies',
    label: 'Strategy Settings',
    href: '/strategies',
    icon: Sliders,
    category: 'core',
  },
  {
    id: 'trade-history',
    label: 'Trade History',
    href: '/trades',
    icon: History,
    category: 'core',
  },

  // Analytics & Financials
  {
    id: 'performance',
    label: 'Performance & Analytics',
    href: '/analytics',
    icon: BarChart3,
    category: 'analytics',
  },
  {
    id: 'funds',
    label: 'Funds & Charges',
    href: '/funds',
    icon: Wallet,
    category: 'analytics',
  },
  {
    id: 'risk',
    label: 'Risk Management',
    href: '/risk',
    icon: ShieldAlert,
    category: 'management',
  },

  // System & Connections
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    category: 'system',
  },
  {
    id: 'broker',
    label: 'API & Connections',
    href: '/broker',
    icon: Cpu,
    category: 'system',
  },
  {
    id: 'system',
    label: 'System Status',
    href: '/system',
    icon: Activity,
    category: 'system',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    category: 'system',
  },
];
