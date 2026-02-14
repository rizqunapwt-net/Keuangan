// ============================================================================
// VITEST CONFIGURATION - Frontend Tests
// ============================================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
    
    // Globals
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['frontend/src/**/*.{ts,tsx}'],
      exclude: [
        'frontend/src/**/*.test.{ts,tsx}',
        'frontend/src/**/*.spec.{ts,tsx}',
        'frontend/src/**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    
    // Test match patterns
    include: ['**/*.{test,spec}.{ts,tsx}'],
    
    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Mock reset
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
});
