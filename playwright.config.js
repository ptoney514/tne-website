import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
const isRemote = !!process.env.PLAYWRIGHT_TEST_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  // Global setup and teardown for test data management (skip for remote/smoke runs)
  globalSetup: isRemote ? undefined : './tests/setup/globalSetup.js',
  globalTeardown: isRemote ? undefined : './tests/setup/globalTeardown.js',

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
        baseURL,
      },
    },
    // Form submission tests (12 entries each for registration, tryouts, contact)
    {
      name: 'form-submissions',
      testMatch: /public\/form-submissions\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
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
        baseURL,
      },
    },
    // Admin E2E tests (requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars)
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    // Smoke tests for auth flows (runs against preview deployments in CI)
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    // Auth API diagnostic tests
    {
      name: 'auth-api',
      testMatch: /auth\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
  ],
  webServer: isRemote
    ? undefined
    : {
        command: 'cd react-app && npm run dev',
        url: 'http://localhost:5173',
        // Always start this repo's server to avoid accidentally running tests
        // against another local project listening on the same port.
        reuseExistingServer: false,
        timeout: 120 * 1000,
      },
});
