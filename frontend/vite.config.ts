
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173
  },

  test: {
    globals: true,
    environment: "jsdom",

    setupFiles: ["./src/test/setup.ts"],

    reporters: ["default", "junit"],

    outputFile: {
      junit: "./test-results/junit.xml"
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "cobertura", "lcov"],
      reportsDirectory: "./coverage",

      include: ["src/**/*.{ts,tsx}"],

      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
        "src/main.tsx"
      ]
    }
  }
});
