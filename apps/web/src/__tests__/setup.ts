import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Inter: () => ({
    variable: '--font-inter',
  }),
  JetBrains_Mono: () => ({
    variable: '--font-mono',
  }),
}));
