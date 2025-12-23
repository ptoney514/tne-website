// @ts-check
import { test, expect } from '@playwright/test';

// Real credentials for testing - set via environment variable
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'test-password';

test.describe('Real Supabase Login', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should show console logs for auth initialization', async ({ page }) => {
    const logs = [];
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto('http://localhost:5173/login');

    // Wait for auth initialization
    await page.waitForTimeout(10000);

    console.log('=== Console Logs ===');
    logs.forEach((log) => {
      console.log(`[${log.type}] ${log.text}`);
    });

    // Check for Supabase logs
    const supabaseLogs = logs.filter((l) => l.text.includes('[Supabase]') || l.text.includes('[Auth]'));
    console.log('\n=== Supabase/Auth Logs ===');
    supabaseLogs.forEach((log) => {
      console.log(log.text);
    });

    expect(supabaseLogs.length).toBeGreaterThan(0);
  });

  test('should attempt real login and capture network', async ({ page }) => {
    // Listen to network requests
    const authRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('supabase')) {
        authRequests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('supabase')) {
        console.log(`[Response] ${response.url()} - ${response.status()}`);
      }
    });

    // Go to login
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    console.log('=== Attempting login... ===');

    // Click sign in
    await page.click('button[type="submit"]');

    // Wait and see what happens
    await page.waitForTimeout(15000);

    console.log('\n=== Auth Requests Made ===');
    authRequests.forEach((req) => {
      console.log(`${req.method} ${req.url}`);
    });

    // Check current URL
    const currentUrl = page.url();
    console.log(`\n=== Current URL: ${currentUrl} ===`);

    // Check for error message
    const errorElement = await page.$('.text-red-700, [class*="error"]');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log(`Error shown: ${errorText}`);
    }
  });

  test('direct Supabase auth test', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Try to call Supabase auth directly
    const result = await page.evaluate(async () => {
      // Access the supabase client from window if available
      const supabaseUrl = 'https://xnvtfzakgdkqkzfvsswq.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudnRmemFrZ2RrcWt6ZnZzc3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjYxOTgsImV4cCI6MjA3NzYwMjE5OH0.gDPvGVl23-SPf_wtTTb3kpaMamipKtuT6Ed5MOfeov8';

      // Test REST API
      const restStart = Date.now();
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: supabaseKey },
      });
      const restTime = Date.now() - restStart;

      // Test Auth API
      const authStart = Date.now();
      let authResult = null;
      let authError = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'pernellg@proton.me',
            password: 'test', // Wrong password intentionally
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        authResult = {
          status: authResponse.status,
          time: Date.now() - authStart,
        };
      } catch (err) {
        authError = err.message;
      }

      return {
        rest: { status: restResponse.status, time: restTime },
        auth: authResult || { error: authError, time: Date.now() - authStart },
      };
    });

    console.log('=== Direct API Test Results ===');
    console.log('REST API:', result.rest);
    console.log('Auth API:', result.auth);

    expect(result.rest.status).toBe(200);
  });
});
