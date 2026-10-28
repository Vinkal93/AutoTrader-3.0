'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Lock, ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('trader@autotrader.local');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-neutral-900 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            AutoTrader <span className="text-blue-600">3.0</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
          Trader Terminal Sign In
        </h2>
        <p className="mt-1 text-xs text-neutral-600">
          Access your multi-broker dashboard, strategy telemetry, and risk controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-neutral-200/80 rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-700">
                Trader Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-neutral-700">
                  Password
                </label>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="mt-1 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Cockpit'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Note */}
          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <span className="text-[11px] text-neutral-500 block mb-2">
              Evaluating in Preview Mode?
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Launch Institutional Terminal Directly →
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Credential Protection:</strong> This sign-in authenticates your SaaS workspace. We never ask for your broker MPIN or trading password here.
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          <Link href="/" className="font-semibold text-blue-600 hover:underline">
            ← Return to public home page
          </Link>
        </p>
      </div>
    </div>
  );
}
