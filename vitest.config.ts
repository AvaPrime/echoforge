import { defineConfig, mergeConfig } from 'vitest/config';
import base from './config/vitest.base';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      coverage: {
        lines: 80,
        statements: 80,
        functions: 75,
        branches: 70,
      },
    },
    resolve: {
      alias: {
        '@echoforge/blueprint': './packages/blueprint/src',
        '@echoforge/codessa': './packages/codessa/src',
        '@echoforge/echocore': './packages/echocore/src',
        '@echoforge/echoui': './packages/echoui/src',
        '@echoforge/forgekit': './packages/forgekit/src',
        '@echoforge/mirror': './packages/mirror/src',
      },
    },
  })
);
