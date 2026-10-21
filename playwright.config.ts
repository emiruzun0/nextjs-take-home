import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  // The test hits the real Open-Meteo API (see DECISIONS.md, decision 7),
  // so allow a slow response and one retry for a network blip.
  timeout: 30_000,
  retries: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  // Chromium only: one browser is enough to prove the flow works.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Test the production build, not the dev server.
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
