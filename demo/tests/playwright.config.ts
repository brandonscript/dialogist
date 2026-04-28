import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const demoNextRoot = path.resolve(configDir, "../nextjs");

export default defineConfig({
  testDir: "./specs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./playwright-report" }]],
  use: {
    baseURL: "http://localhost:5608",
    viewport: { width: 1440, height: 900 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    headless: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    /** Same bundler as local demo (`npm run dev`): Turbopack via `dev:e2e`. */
    command: "npm run dev:e2e",
    url: "http://localhost:5608",
    reuseExistingServer: !process.env.CI,
    cwd: demoNextRoot,
    timeout: 120000,
  },
});
