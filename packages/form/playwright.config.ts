import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: ["browser.spec.ts", "composition.spec.ts"],
  workers: 1,
  outputDir: "../../test-results/form",
  webServer: {
    command: "pnpm exec vite --config vite.preview.config.ts",
    url: "http://127.0.0.1:43132",
    reuseExistingServer: false,
  },
  use: { baseURL: "http://127.0.0.1:43132", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 960 } } },
    {
      name: "mobile",
      use: { viewport: { width: 360, height: 780 }, reducedMotion: "reduce" },
    },
  ],
});
