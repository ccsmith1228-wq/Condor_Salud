/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/lib/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        "src/**/*.d.ts",
        "src/lib/supabase/**",
        "src/**/*.stories.{ts,tsx}",
      ],
      thresholds: {
        statements: 9,
        branches: 7,
        functions: 14,
        lines: 9,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
