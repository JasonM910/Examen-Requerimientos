import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4175",
    viewport: { width: 1440, height: 1050 },
    locale: "es-CR",
    timezoneId: "America/Costa_Rica",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4175 --strictPort",
    url: "http://127.0.0.1:4175",
    env: {
      DIETA_DATA_FILE: path.join(
        os.tmpdir(),
        `dieta-e2e-${process.pid}`,
        "db.json",
      ),
    },
    reuseExistingServer: false,
  },
});
