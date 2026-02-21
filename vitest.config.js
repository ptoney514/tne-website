import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.js',
    include: ['**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', '.next', 'tests/**'],
    testTimeout: 10000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': '.',
    },
  },
});
