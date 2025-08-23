import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: true,
  target: 'node22',
  external: ['chalk', 'commander', 'open', 'yaml'],
});
