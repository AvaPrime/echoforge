import { defineConfig } from "vitest/config";
import base from "../../config/vitest.base";

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    environment: "jsdom",
    setupFiles: []
  }
});