import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    entry: ['src/index.ts'],
  },
  sourcemap: true,
  outDir: 'dist',
  jsx: 'react-jsx',
  external: ['react', 'react-dom'],
  clean: true,
  splitting: false,
});