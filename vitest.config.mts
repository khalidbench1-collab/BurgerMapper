import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // UI interaction tests can exceed five seconds on constrained CI runners.
    // The production provider still has its independent 20-second timeout.
    testTimeout: 10_000,
  },
});
