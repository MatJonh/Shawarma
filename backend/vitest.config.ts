
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    reporters: ["default", "junit"],

    outputFile: {
      junit: "./test-results/junit.xml"
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "cobertura", "lcov"],
      reportsDirectory: "./coverage",

      include: ["src/**/*.ts"],

      exclude: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/server.ts"
      ]
    }
  }
});
