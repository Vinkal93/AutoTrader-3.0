'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { APP_ROUTES, type RouteItem } from '@/lib/routes';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lock,
  ExternalLink,
  ShieldAlert,
  X,
  AlertTriangle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  // Close mobile drawer on Escape key for accessibility (WCAG 2.1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  const renderBadge = (item: RouteItem) => {
    if (!item.badge) return null;
    const variantClasses = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }[item.badgeVariant || 'neutral'];

    return (
      <span
        className={cn(
          'ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase',
          variantClasses
        )}
      >
        {item.badge}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        aria-label="Application Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white text-neutral-800 transition-all duration-300 ease-in-out border-r border-neutral-200 shadow-xs',
          // Mobile state: slide in/out
          mobileSidebarOpen ? 'translate-x-0 w-72 sm:w-64' : '-translate-x-full lg:translate-x-0',
          // Desktop state: collapsed vs expanded
          sidebarCollapsed ? 'lg:w-18' : 'lg:w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100 bg-white">
          <Link
            href="/dashboard"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-neutral-900">
                  AutoTrader <span className="text-blue-600 font-semibold">3.0</span>
                </span>
                <span className="text-[10px] text-neutral-500 tracking-wider font-semibold uppercase">
                  NIFTY Algorithmic
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button (Touch target >= 44px) */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {APP_ROUTES.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                title={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all group relative min-h-[44px] sm:min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  item.isPhaseLocked && 'opacity-85'
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-md" />
                )}

                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-blue-600' : 'text-neutral-400 group-hover:text-neutral-700'
                  )}
                />

                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.isPhaseLocked && (
                      <Lock className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
                    )}
                    {renderBadge(item)}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Risk & Safety Disclosures Footer (Never hidden on mobile) */}
        {(!sidebarCollapsed || mobileSidebarOpen) && (
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/70 m-3 rounded-xl border space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Risk Disclosure
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                Protected
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-tight">
              Options trading carries substantial risk of loss. SEBI-compliant execution safety lock active.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
