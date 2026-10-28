'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSupabase } from '@/lib/auth/supabase';
import { useAuth } from '@/lib/auth/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data, error: suError } = await supabase.auth.getSession();
          if (suError) throw suError;

          if (data.session) {
            const isOnboarded = Boolean(data.session.user.user_metadata?.is_onboarded);
            router.push(isOnboarded ? '/dashboard' : '/onboarding');
            return;
          }
        }

        // Check if user is already established in context
        if (user) {
          router.push(user.isOnboarded ? '/dashboard' : '/onboarding');
          return;
        }

        // Fallback default redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication verification failed.';
        setError(msg);
      }
    };

    handleAuthCallback();
  }, [router, user]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm text-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-sm">
          <TrendingUp className="w-5 h-5" />
        </div>

        {error ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <Link
              href="/login"
              className="inline-block text-xs font-semibold text-blue-600 hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-base font-bold text-neutral-900">
              Verifying Your Authentication
            </h2>
            <p className="text-xs text-neutral-500">
              Establishing your secure tenant session and loading workspace permissions...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
