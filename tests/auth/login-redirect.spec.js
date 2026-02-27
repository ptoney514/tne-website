// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Login Redirect Tests
 *
 * Verify that login correctly redirects users based on role
 * and preserves the intended destination.
 */

test.describe('Login Redirect - No Credentials Required', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();
  });

  test('unauthenticated admin access redirects to login with return path', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login with ?from=/admin
    await expect(page).toHaveURL(/\/login.*from=%2Fadmin/);
  });
});

test.describe('Login Redirect - Credentials Required', () => {
  test.beforeEach(() => {
    if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
      test.skip();
    }
  });

  test('admin login redirects to /admin', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(process.env.TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Admin users should be redirected to /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  });

  test('login preserves "from" redirect destination', async ({ page }) => {
    // Go to a protected page first (which redirects to /login with state)
    await page.goto('/admin/teams');
    await expect(page).toHaveURL(/\/login/);

    // Log in
    await page.locator('input[type="email"]').fill(process.env.TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should redirect back to the originally requested page
    await expect(page).toHaveURL(/\/admin\/teams/, { timeout: 15000 });
  });
});
