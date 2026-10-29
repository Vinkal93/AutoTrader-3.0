import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TrendingUp, ArrowLeft, Home, HelpCircle, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 — Page Not Found | NIFTY Auto Trader 3.0',
  description: 'The requested page could not be found on NIFTY Auto Trader 3.0.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
      <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <TrendingUp className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            The page you requested does not exist, has been relocated, or is restricted to authenticated sessions.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm transition-colors"
          >
            <Layers className="w-4 h-4" /> Go to Trading Dashboard
          </Link>
          <Link
            href="/faqs"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Read Documentation & FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}
