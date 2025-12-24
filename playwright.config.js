import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    // Static HTML pages (existing tests)
    {
      name: 'static-pages',
      testMatch: /pages\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'file://' + process.cwd(),
      },
    },
    // React app (auth tests)
    {
      name: 'react-app',
      testMatch: /auth\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
    },
    // React app (admin tests)
    {
      name: 'admin-app',
      testMatch: /admin\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
    },
    // React app (public pages)
    {
      name: 'public-pages',
      testMatch: /public\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
    },
  ],
  webServer: {
    command: 'cd react-app && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
