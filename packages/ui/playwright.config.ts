import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.ts",
  workers: 1,
  webServer: {
    command: "pnpm exec vite --config vite.preview.config.ts",
    url: "http://127.0.0.1:43131",
    reuseExistingServer: false,
  },
  outputDir: "../../test-results/ui",
  use: { baseURL: "http://127.0.0.1:43131", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 960 } } },
    {
      name: "mobile",
      use: { viewport: { width: 360, height: 780 }, reducedMotion: "reduce" },
    },
  ],
});
