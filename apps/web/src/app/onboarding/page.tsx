'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  User,
  Layers,
  Link2,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState(user?.fullName || 'Trader');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('trader-1');
  const [selectedBroker, setSelectedBroker] = useState<string>('KOTAK_NEO');
  const [connectNow, setConnectNow] = useState<boolean>(false);
  const [brokerClientId, setBrokerClientId] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [defaultLotSize, setDefaultLotSize] = useState<number>(1);
  const [riskAppetite, setRiskAppetite] = useState<'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'>('MODERATE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brokerList = [
    {
      id: 'KOTAK_NEO',
      name: 'Kotak Neo',
      version: 'Trade API v2',
      status: 'Supported',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Live adapter with Tradebook feeds and dedicated static-IP routing.',
    },
    {
      id: 'ZERODHA_KITE',
      name: 'Zerodha Kite',
      version: 'Kite Connect v3',
      status: 'Connection available',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Hosted OAuth 2.0 authorization with daily token cycle.',
    },
    {
      id: 'UPSTOX',
      name: 'Upstox Pro',
      version: 'API v2',
      status: 'Connection available',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'OAuth 2.0 PKCE and high-capacity market stream.',
    },
    {
      id: 'ANGEL_ONE',
      name: 'Angel One',
      version: 'SmartAPI v2',
      status: 'Approval pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'SmartAPI connector in static IP whitelisting review.',
    },
    {
      id: 'DHAN',
      name: 'DhanHQ',
      version: 'API v2',
      status: 'Approval pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Direct Dhan connector in static IP verification.',
    },
    {
      id: 'FYERS',
      name: 'Fyers',
      version: 'API v3',
      status: 'Coming soon',
      statusColor: 'bg-neutral-100 text-neutral-600 border-neutral-200',
      desc: 'Adapter architecture scheduled in upcoming release.',
    },
  ];

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        selectedBrokerId: selectedBroker,
        connectBrokerNow: connectNow,
        theme: selectedTheme,
        defaultLotSize,
        riskAppetite,
        brokerCredentials: connectNow && brokerClientId ? { account_id: brokerClientId } : undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      // Fallback: direct to dashboard
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 flex flex-col justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header Branding & Step Indicators */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 text-neutral-900 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              AutoTrader <span className="text-blue-600">3.0</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Account Setup &amp; Onboarding
          </h1>
          <p className="mt-1 text-xs text-neutral-600">
            Configure your non-custodial workspace in a few simple steps
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-8 bg-blue-600'
                    : i < step
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-neutral-200'
                }`}
                title={`Step ${i}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-neutral-400 mt-2 block uppercase tracking-wider">
            Step {step} of 6
          </span>
        </div>

        {/* Card Body */}
        <div className="bg-white p-4 sm:p-7 md:p-10 rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-sm relative">
          {/* STEP 1: Welcome & Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Welcome to NIFTY Auto Trader</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your dedicated algorithmic trading environment is ready. Let&apos;s set your display name and confirm your workspace identity.
                </p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Trader Display Name
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full pl-9 pr-3 min-h-[42px] py-2 text-base sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'trader-1', color: 'bg-blue-600', label: 'T1' },
                    { id: 'trader-2', color: 'bg-emerald-600', label: 'T2' },
                    { id: 'trader-3', color: 'bg-purple-600', label: 'T3' },
                    { id: 'trader-4', color: 'bg-amber-600', label: 'T4' },
                  ].map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`w-11 h-11 rounded-2xl ${av.color} text-white font-bold text-xs flex items-center justify-center transition-all ${
                        selectedAvatar === av.id ? 'ring-3 ring-offset-2 ring-blue-600 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {av.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
                <span className="font-bold text-neutral-900 block">Verified Account Email:</span>
                <span className="font-mono text-neutral-700">{user?.email || 'trader@autotrader.local'}</span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Continue to Broker Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Broker */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Select Primary Broker</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Choose your active broker to monitor live quotes, margins, and option telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {brokerList.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBroker(b.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedBroker === b.id
                        ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600 shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-neutral-900">{b.name}</span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${b.statusColor}`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 block mb-1">{b.version}</span>
                    <p className="text-[11px] text-neutral-600 leading-tight">{b.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Configure Authorization
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Broker / Skip */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Broker Authorization</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Authorize connection with <strong className="font-semibold text-neutral-800">{selectedBroker}</strong> or skip to explore the dashboard in disconnected mode.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm text-neutral-900">Connect Now via OAuth</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={connectNow}
                    onChange={(e) => setConnectNow(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>

                {connectNow ? (
                  <div className="space-y-3 pt-2 border-t border-neutral-200">
                    <div>
                      <label htmlFor="brokerClientId" className="block text-xs font-semibold text-neutral-700 mb-1">
                        Client Trading Code
                      </label>
                      <input
                        id="brokerClientId"
                        type="text"
                        placeholder="e.g. X123456"
                        value={brokerClientId}
                        onChange={(e) => setBrokerClientId(e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      You will complete the official broker-hosted login upon opening your settings.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-600">
                    You can skip this step and enter your dashboard in disconnected mode. You can connect your broker at any time from the Broker Connections menu.
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  {!connectNow && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs font-semibold text-neutral-600 hover:text-neutral-800"
                    >
                      Skip Connection
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Review Permissions
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Account Permissions */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Review Scoped Permissions</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The SaaS platform operates under principle of least privilege.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Read Market Quotes &amp; Positions</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Fetch live NIFTY options Greeks, best-5 depth, open positions, and margin collaterals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Account Funds &amp; Tradebook</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Read-only access to verify ledger balances and compute gross vs. net trading tariffs.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-amber-950">Live Order Execution Gate (Locked)</h3>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      Automated real-money order routing is locked in Phase 1-2. Paper trading and telemetry are enabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Choose Preferences
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Choose Preferences */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Trading Preferences</h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Configure default lot sizes and risk classification.
                </p>
              </div>

              {/* Theme Preference */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Cockpit Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('light')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedTheme === 'light'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Professional Light (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('dark')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedTheme === 'dark'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Dark Mode (Optional)
                  </button>
                </div>
              </div>

              {/* Default Lot Size */}
              <div>
                <label htmlFor="lotSize" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Default Option Lot Size (NIFTY = 25 qty / lot)
                </label>
                <input
                  id="lotSize"
                  type="number"
                  min={1}
                  max={10}
                  value={defaultLotSize}
                  onChange={(e) => setDefaultLotSize(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                />
              </div>

              {/* Risk Appetite */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Risk Appetite Classification
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskAppetite(r)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        riskAppetite === r
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Review Summary
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Confirmation & Open Dashboard */}
          {step === 6 && (
            <div className="space-y-6 text-center animate-in fade-in duration-150 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-neutral-900">Your Cockpit is Ready</h2>
                <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Your tenant workspace has been initialized with isolated permissions and validated risk boundaries.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Trader Name:</span>
                  <span className="font-semibold text-neutral-800">{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Selected Broker:</span>
                  <span className="font-semibold text-neutral-800">{selectedBroker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Connection Mode:</span>
                  <span className="font-semibold text-neutral-800">
                    {connectNow ? 'Broker Sync Pending' : 'Disconnected (Read-Only)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Default Lot Size:</span>
                  <span className="font-semibold text-neutral-800 tabular-nums">{defaultLotSize} lot(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Risk Profile:</span>
                  <span className="font-semibold text-neutral-800">{riskAppetite}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Cockpit...
                    </>
                  ) : (
                    <>
                      Open Trading Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
