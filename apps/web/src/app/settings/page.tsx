'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUIStore } from '@/store/ui-store';
import { Settings as SettingsIcon, Moon, Sun, Volume2, VolumeX, Shield, User, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const [defaultLots, setDefaultLots] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application & Terminal Settings"
        subtitle="User display preferences, default order lot sizing, and operator credentials"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Settings' },
        ]}
      />

      <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Visual Appearance */}
          <div className="space-y-3 pb-5 border-b border-neutral-100">
            <h4 className="font-bold text-sm text-neutral-900 tracking-tight">Display Appearance</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <strong className="text-neutral-900 block font-medium">Terminal Theme Mode</strong>
                  <span className="text-neutral-500 text-[11px]">Toggle between modern Light and Dark themes</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50"
              >
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
            </div>
          </div>

          {/* Audio Notifications */}
          <div className="space-y-3 pb-5 border-b border-neutral-100">
            <h4 className="font-bold text-sm text-neutral-900 tracking-tight">Audio Feedback</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-neutral-400" />}
                <div>
                  <strong className="text-neutral-900 block font-medium">Trade Fill & Alert Chimes</strong>
                  <span className="text-neutral-500 text-[11px]">Play audio cues upon order fill or risk halt</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Default Lot Sizing */}
          <div className="space-y-3 pb-5 border-b border-neutral-100">
            <h4 className="font-bold text-sm text-neutral-900 tracking-tight">Default Order Sizing</h4>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <label htmlFor="default-lots" className="text-neutral-700 font-semibold block">
                NIFTY Default Lots (25 or 50 Qty / Lot based on exchange revision)
              </label>
              <input
                id="default-lots"
                type="number"
                min={1}
                max={10}
                value={defaultLots}
                onChange={(e) => setDefaultLots(parseInt(e.target.value) || 1)}
                className="px-3 py-1.5 text-xs tabular-nums font-semibold bg-white border border-neutral-300 rounded-lg w-28 text-neutral-900 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-neutral-400 block">
                Must be an integer lot multiple.
              </span>
            </div>
          </div>

          {/* Operator Profile */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 tracking-tight">Operator Authentication</h4>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs space-y-1.5">
              <div>Role: <strong className="text-neutral-900 font-medium">Single Owner / Administrator</strong></div>
              <div>Auth Engine: <strong className="text-neutral-900 font-medium">Supabase Auth (Server JWT)</strong></div>
              <div>IP Status: <strong className="text-neutral-900 font-medium">VPS Whitelisted Static IP</strong></div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Saved Preferences
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
