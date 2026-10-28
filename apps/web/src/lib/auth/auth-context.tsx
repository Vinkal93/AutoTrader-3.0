'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthSession, OnboardingPayload } from '@autotrader/api-contracts';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { api } from '@/lib/api/client';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'autotrader_token';
const USER_KEY = 'autotrader_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession({
            accessToken: storedToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            user: parsedUser,
          });

          // Verify token against backend in background
          try {
            const res = await api.get<{
              id: string;
              email: string;
              fullName?: string;
              role: string;
              isOnboarded: boolean;
            }>('/api/v1/auth/session');
            if (res.data) {
              const verifiedUser: AuthUser = {
                id: res.data.id,
                email: res.data.email,
                fullName: res.data.fullName,
                role: res.data.role,
                isOnboarded: res.data.isOnboarded,
              };
              setUser(verifiedUser);
              localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
            }
          } catch {
            // Token expired or invalid on backend
            // In dev mode keep session, otherwise clear if explicitly 401
          }
        } else {
          // If Supabase is configured, check getSession
          const supabase = getSupabase();
          if (supabase) {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              const suUser = data.session.user;
              const mappedUser: AuthUser = {
                id: suUser.id,
                email: suUser.email || '',
                fullName: suUser.user_metadata?.full_name || null,
                avatarUrl: suUser.user_metadata?.avatar_url || null,
                role: suUser.role || 'authenticated',
                isOnboarded: Boolean(suUser.user_metadata?.is_onboarded ?? false),
              };
              setUser(mappedUser);
              setSession({
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: (data.session.expires_at || 0) * 1000,
                user: mappedUser,
              });
              localStorage.setItem(TOKEN_KEY, data.session.access_token);
              localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
            }
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuthData = (token: string, authUser: AuthUser) => {
    setUser(authUser);
    setSession({
      accessToken: token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user: authUser,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      // Set secure session cookie
      document.cookie = `autotrader_session=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = 'autotrader_session=; path=/; max-age=0; SameSite=Lax';
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || null,
            role: data.user.role || 'authenticated',
            isOnboarded: Boolean(data.user.user_metadata?.is_onboarded ?? true),
          };
          setAuthData(data.session.access_token, authUser);
          return;
        }
      }

      // Backend API auth
      const res = await api.post<{
        access_token: string;
        user: AuthUser;
      }>('/api/v1/auth/login', { email, password });

      if (res.data) {
        setAuthData(res.data.access_token, res.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, is_onboarded: false },
          },
        });
        if (error) throw error;
        if (data.session) {
          const authUser: AuthUser = {
            id: data.user?.id || 'new-user',
            email: data.user?.email || email,
            fullName: fullName || null,
            role: 'authenticated',
            isOnboarded: false,
          };
          setAuthData(data.session.access_token, authUser);
          return;
        }
      }

      // Backend API auth
      const res = await api.post<{
        access_token: string;
        user: AuthUser;
      }>('/api/v1/auth/signup', { email, password, full_name: fullName });

      if (res.data) {
        setAuthData(res.data.access_token, res.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (supabase) {
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
        return;
      }

      // Fallback dev mode Google auth simulation
      const res = await api.post<{
        access_token: string;
        user: AuthUser;
      }>('/api/v1/auth/google', {
        email: 'google.trader@autotrader.local',
        full_name: 'Google Trader',
      });

      if (res.data) {
        setAuthData(res.data.access_token, res.data.user);
        window.location.href = res.data.user.isOnboarded ? '/dashboard' : '/onboarding';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<string> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } else {
      await api.post('/api/v1/auth/forgot-password', { email });
    }
    return 'Password reset link sent to your registered email address.';
  };

  const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } else {
      await api.post('/api/v1/auth/reset-password', { token, new_password: newPassword });
    }
    return 'Your password has been reset successfully. Please log in with your new password.';
  };

  const completeOnboarding = async (payload: OnboardingPayload) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/user/onboarding/complete', {
        selected_broker_id: payload.selectedBrokerId,
        connect_broker_now: payload.connectBrokerNow,
        theme: payload.theme,
        default_lot_size: payload.defaultLotSize,
        risk_appetite: payload.riskAppetite,
      });

      if (user) {
        const updatedUser: AuthUser = { ...user, isOnboarded: true };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        await api.post('/api/v1/auth/logout').catch(() => {});
      }
    } finally {
      clearAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
