import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  // Global setup and teardown for test data management
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',

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
    // React app (public pages - existing tests)
    {
      name: 'public-pages',
      testMatch: /public\/(?!form-submissions|data-verification).*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
    },
    // Form submission tests (12 entries each for registration, tryouts, contact)
    {
      name: 'form-submissions',
      testMatch: /public\/form-submissions\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      // Run form submissions sequentially to avoid rate limiting
      fullyParallel: false,
    },
    // Data verification / regression tests
    {
      name: 'data-verification',
      testMatch: /public\/data-verification\/.*\.spec\.js/,
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
