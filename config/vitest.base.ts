import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reports: ['text', 'html'],
      all: true,
      thresholds: { lines: 0.7, statements: 0.7, branches: 0.6, functions: 0.7 }
    },
  },
});
