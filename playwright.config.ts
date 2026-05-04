import { defineConfig, devices } from '@playwright/test';

// Smoke + visual checks for the public site. Three viewports per route
// to catch the kind of overflow regression that hit /properties/[slug]
// — the body overflow guard is a safety net, this is the active check.

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    { name: 'mobile',  use: { ...devices['iPhone 13'] } },
    { name: 'tablet',  use: { ...devices['iPad (gen 7)'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
  ],
});
