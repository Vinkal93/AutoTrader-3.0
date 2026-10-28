import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@autotrader/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src/index.ts'),
      '@autotrader/ui-tokens': path.resolve(__dirname, '../../packages/ui-tokens/src/index.ts'),
    },
  },
});
