// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Login Flow E2E Tests
 *
 * These tests verify the complete login flow including network requests,
 * response shapes, cookie handling, and session management.
 */

test.describe('Login Flow - Network Verification', () => {
  test.beforeEach(() => {
    if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
      test.skip();
    }
  });

  test('sign-in API returns correct response shape', async ({ page }) => {
    // Set up request interception
    let signInResponse = null;

    page.on('response', (response) => {
      if (response.url().includes('/api/auth/sign-in/email')) {
        signInResponse = response;
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(process.env.TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for the sign-in response
    await page.waitForResponse((response) =>
      response.url().includes('/api/auth/sign-in/email')
    );

    expect(signInResponse).not.toBeNull();
    expect(signInResponse.status()).toBe(200);

    const body = await signInResponse.json();
    // Better Auth returns { user, session } on success
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(process.env.TEST_ADMIN_EMAIL);
    expect(body.session).toBeDefined();
  });

  test('session cookie is set after login', async ({ page, context }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(process.env.TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for navigation after login
    await page.waitForURL(/\/(admin|$)/, { timeout: 15000 });

    // Check that a session cookie was set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name.includes('session') || c.name.includes('better-auth')
    );
    expect(sessionCookie).toBeDefined();
  });

  test('get-session returns user data after login', async ({ page, request }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(process.env.TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for navigation after login
    await page.waitForURL(/\/(admin|$)/, { timeout: 15000 });

    // Use the page's context to make an API request (cookies are shared)
    const sessionResponse = await page.evaluate(async () => {
      const res = await fetch('/api/auth/get-session', {
        credentials: 'include',
      });
      return { status: res.status, body: await res.json() };
    });

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.user).toBeDefined();
    expect(sessionResponse.body.user.email).toBe(process.env.TEST_ADMIN_EMAIL);
  });
});

test.describe('Login Flow - Lockout Behavior', () => {
  test.beforeEach(async ({ request }) => {
    const res = await request.get('/api/auth/ok').catch(() => null);
    const ct = res ? (res.headers()['content-type'] || '') : '';
    if (!res || !ct.includes('application/json')) test.skip();
  });

  test('lockout after 5 rapid failed login attempts', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.getByRole('button', { name: /Sign In/i });

    // Submit wrong credentials 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await emailInput.fill('fake@example.com');
      await passwordInput.fill('wrongpassword');
      await signInButton.click();
      // Wait briefly for the response before trying again
      await page.waitForTimeout(500);
    }

    // After rapid failures, expect either a lockout message or a rate-limit indicator
    const lockoutVisible = await page
      .locator('text=/too many|locked|rate.limit|please wait|try again later/i')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    const buttonDisabled = await signInButton.isDisabled().catch(() => false);
    const buttonText = await signInButton.textContent();
    const showsWaitMessage = /please wait|loading|locked/i.test(buttonText || '');

    // At least one lockout indicator should be present
    expect(lockoutVisible || buttonDisabled || showsWaitMessage).toBe(true);
  });
});

test.describe('Login Flow - Error Handling', () => {
  test.beforeEach(async ({ request }) => {
    // These tests require a running auth backend (Vercel serverless functions)
    // Skip when running against local Vite dev server (returns HTML for /api routes)
    const res = await request.get('/api/auth/ok').catch(() => null);
    const ct = res ? (res.headers()['content-type'] || '') : '';
    if (!res || !ct.includes('application/json')) test.skip();
  });

  test('invalid credentials show error message, not crash', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('fake@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should show an error message, not a blank page or unhandled error
    await expect(page.locator('[class*="red"]').first()).toBeVisible({ timeout: 10000 });

    // Should still be on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign-in API does not return 500 for invalid credentials', async ({ page }) => {
    let responseStatus = null;

    page.on('response', (response) => {
      if (response.url().includes('/api/auth/sign-in/email')) {
        responseStatus = response.status();
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('fake@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await page.waitForResponse((response) =>
      response.url().includes('/api/auth/sign-in/email')
    );

    // Must NOT be a 500 — should be 4xx
    expect(responseStatus).not.toBeNull();
    expect(responseStatus).toBeGreaterThanOrEqual(400);
    expect(responseStatus).toBeLessThan(500);
  });
});
