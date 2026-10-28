'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import {
  LayoutDashboard,
  Layers,
  Link2,
  Terminal,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Strategies',
      href: '/strategies',
      icon: Layers,
      active: pathname.startsWith('/strategies'),
    },
    {
      label: 'Broker Connection',
      href: '/broker',
      icon: Link2,
      active: pathname.startsWith('/broker'),
    },
    {
      label: 'System & Logs',
      href: '/system',
      icon: Terminal,
      active: pathname.startsWith('/system'),
    },
    {
      label: 'Risk Rules',
      href: '/strategies#risk-rules',
      icon: ShieldCheck,
      badge: 'Protected',
      active: false,
    },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-neutral-900 text-white transition-all duration-300 ease-in-out border-r border-neutral-800',
        sidebarCollapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white">AutoTrader</span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold uppercase">
                v3.0 NIFTY
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                item.active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform group-hover:scale-105',
                  item.active ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                )}
              />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Phase 1 Foundation Footer */}
      {!sidebarCollapsed ? (
        <div className="p-4 m-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Phase 1 Read-Only</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-snug">
            Live order execution is locked. System runs in inspection & validation mode.
          </p>
        </div>
      ) : (
        <div className="p-3 text-center text-amber-400" title="Phase 1: Read-Only System">
          <Lock className="w-4 h-4 mx-auto" />
        </div>
      )}
    </aside>
  );
};
