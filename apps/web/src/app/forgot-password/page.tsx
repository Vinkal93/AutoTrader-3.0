'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to process password reset request.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 flex flex-col justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md mx-auto text-center px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-neutral-900 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight">
            AutoTrader <span className="text-blue-600">3.0</span>
          </span>
        </Link>
        <h1 className="mt-2.5 sm:mt-4 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
          Reset Your Password
        </h1>
        <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 max-w-xs mx-auto">
          Enter your registered email address and we will send a password reset link
        </p>
      </div>

      <div className="mt-4 sm:mt-6 w-full max-w-md mx-auto">
        <div className="bg-white p-4 sm:p-7 md:p-8 shadow-sm border border-neutral-200/80 rounded-2xl">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-2 space-y-3">
              <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">Check Your Email</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If an account exists with <strong className="font-semibold text-neutral-800">{email}</strong>,
                you will receive an email shortly with instructions.
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              <div>
                <label htmlFor="email" className="block text-[11px] sm:text-xs font-semibold text-neutral-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full min-h-[42px] pl-9 pr-3 py-2 text-base sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="pt-1.5 sm:pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Recovery Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
            <Link href="/signup" className="text-neutral-500 hover:text-neutral-800">
              Create account
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600">
            ← Return to public website
          </Link>
        </p>
      </div>
    </div>
  );
}
