// Kept separate from vite.config.ts so the React Router plugin does not run
// under tests.
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    setupFiles: ["app/test/setup.ts"],
  },
});
