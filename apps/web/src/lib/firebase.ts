/**
 * Firebase Client SDK Initialization & Safe Analytics Module
 * 
 * Complies with AGENTS.md rules:
 * - Rule 10 & 20: Zero Cross-Tenant Leakage (never send tokens, TOTPs, or user orders to Firebase)
 * - Safe SSR / SSG compatibility (Next.js 14 App Router)
 * - Safe fast-refresh singleton pattern
 */

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics, logEvent } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCXKHVzl1qGTdTD_as5pcARQT2f03Od-do',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'autotrader-34075.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'autotrader-34075',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'autotrader-34075.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '10292069063',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:10292069063:web:24a53b690a263a88c0f4e2',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-NM0PXSZBVF',
};

/**
 * Returns the singleton FirebaseApp instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

let analyticsInstance: Analytics | null = null;

/**
 * Returns the Firebase Analytics instance safely in browser environment.
 * Resolves to null on server (SSR/SSG) or if indexedDB / browser environment is unsupported.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      const app = getFirebaseApp();
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch (error) {
    // Non-critical: Analytics might be blocked by ad-blocker or unsupported in environment
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Firebase] Analytics not supported in current environment:', error);
    }
  }

  return null;
}

/**
 * Privacy-safe analytics event logger.
 * Never send PII, authentication tokens, broker credentials, or financial balances.
 */
export async function logFirebaseEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Firebase] Failed to log event "${eventName}":`, err);
    }
  }
}

export const firebaseApp: FirebaseApp = getFirebaseApp();

let authInstance: Auth | null = null;

/**
 * Returns the Firebase Auth instance safely in browser environment.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (authInstance) {
    return authInstance;
  }
  try {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
    return authInstance;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Firebase] Auth initialization error:', error);
    }
    return null;
  }
}
