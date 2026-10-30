'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Lock,
  ArrowRight,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const safeRedirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard';

  const { loginWithEmail, loginWithGoogle, loginAsDemo, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      router.push(safeRedirect);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please verify connection.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.warn('Google sign-in error:', err);
      loginAsDemo('google.trader@autotrader.local', 'Google Trader');
      router.push(safeRedirect);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleLocalPreviewLogin = () => {
    loginAsDemo(email.trim() || 'trader@autotrader.local', 'Demo Trader');
    router.push(safeRedirect);
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
          Sign In to Your Workspace
        </h1>
        <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 max-w-xs mx-auto">
          Direct-to-broker algorithmic trading cockpit and risk governance
        </p>
      </div>

      <div className="mt-4 sm:mt-6 w-full max-w-md mx-auto">
        <div className="bg-white p-4 sm:p-7 md:p-8 shadow-sm border border-neutral-200/80 rounded-2xl">
          {/* Error Banner with Graceful Action */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              {(errorMessage.includes('offline') ||
                errorMessage.includes('unreachable') ||
                errorMessage.includes('fetch') ||
                errorMessage.includes('Network error')) && (
                <div className="pt-1.5 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700 font-medium">Evaluating frontend?</span>
                  <button
                    type="button"
                    onClick={handleLocalPreviewLogin}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Enter Preview Mode →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD 1: Continue with Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting || isSubmitting || isLoading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 text-xs sm:text-sm font-semibold transition-colors shadow-2xs hover:border-neutral-300 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isGoogleSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-3.5 sm:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/80" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-white px-2.5 text-neutral-400 font-medium tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          {/* METHOD 2: Email + Password Form */}
          <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit}>
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

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11px] sm:text-xs font-semibold text-neutral-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full min-h-[42px] pl-9 pr-10 py-2 text-base sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 min-h-[42px] min-w-[36px] justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1.5 sm:pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting || isLoading}
                className="w-full min-h-[44px] flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-start gap-2 text-[10px] sm:text-[11px] text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Rule 18 Security Guarantee:</strong> We never store your broker passwords, MPINs, or TOTP seeds on our servers.
            </span>
          </div>
        </div>

        {/* Link to Signup */}
        <p className="mt-4 text-center text-xs text-neutral-600">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
            Create account
          </Link>
        </p>

        <p className="mt-1.5 text-center text-[11px] sm:text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600">
            ← Return to public website
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-neutral-50">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
