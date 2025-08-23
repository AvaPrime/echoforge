import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  target: "es2022",
  treeshake: true,
  splitting: false,
  minify: false,
  // Externalize peer deps automatically in every lib
  // (tsup does good defaults; you can add more here if needed)
});