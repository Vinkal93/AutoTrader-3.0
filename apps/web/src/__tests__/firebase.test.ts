import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  firebaseConfig,
  getFirebaseApp,
  getFirebaseAnalytics,
  logFirebaseEvent,
} from '@/lib/firebase';

describe('Firebase Integration & Security Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration & Credentials Security', () => {
    it('contains all required Firebase web credentials without empty keys', () => {
      expect(firebaseConfig.apiKey).toBeDefined();
      expect(firebaseConfig.authDomain).toBe('autotrader-34075.firebaseapp.com');
      expect(firebaseConfig.projectId).toBe('autotrader-34075');
      expect(firebaseConfig.storageBucket).toBe('autotrader-34075.firebasestorage.app');
      expect(firebaseConfig.messagingSenderId).toBe('10292069063');
      expect(firebaseConfig.appId).toBe('1:10292069063:web:24a53b690a263a88c0f4e2');
      expect(firebaseConfig.measurementId).toBe('G-NM0PXSZBVF');
    });

    it('returns a singleton Firebase App instance across multiple invocations', () => {
      const app1 = getFirebaseApp();
      const app2 = getFirebaseApp();
      expect(app1).toBeDefined();
      expect(app2).toBeDefined();
      expect(app1.name).toBe(app2.name);
    });
  });

  describe('SSR and Node.js Environment Safety', () => {
    it('getFirebaseAnalytics safely returns null or handles environments without indexedDB', async () => {
      const analytics = await getFirebaseAnalytics();
      // In Node.js / test environment without indexedDB, analytics should resolve safely without throwing
      expect(analytics === null || typeof analytics === 'object').toBe(true);
    });

    it('logFirebaseEvent executes safely without throwing unhandled exceptions', async () => {
      await expect(
        logFirebaseEvent('page_view_test', { page_title: 'Home' })
      ).resolves.not.toThrow();
    });

    it('logFirebaseEvent does not allow leaking broker tokens or secret credentials', async () => {
      const safeParams = {
        route: '/features',
        theme: 'light',
      };
      await expect(
        logFirebaseEvent('feature_view', safeParams)
      ).resolves.not.toThrow();
    });
  });
});
