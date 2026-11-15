import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/web/tests",
  outputDir: "test-results/web",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: "http://127.0.0.1:43120",
    timeout: 120_000,
    reuseExistingServer: false,
  },
  use: { baseURL: "http://127.0.0.1:43120", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        viewport: { width: 360, height: 780 },
        isMobile: true,
        reducedMotion: "reduce",
      },
    },
  ],
});
