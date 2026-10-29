'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception safely to diagnostics
    console.error('Unhandled UI Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
      <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            Application Exception
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Unexpected System Error
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            The application encountered an unexpected runtime error. In accordance with platform safety protocols, active operations are safeguarded.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-neutral-400 bg-neutral-100 py-1 px-2 rounded-md">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
