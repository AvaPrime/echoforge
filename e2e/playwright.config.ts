import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm --filter @echoforge/dashboard dev",
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  }
});