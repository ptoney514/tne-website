// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard E2E Tests
 *
 * These tests verify the admin dashboard functionality.
 * Note: These tests require authentication. In CI, they will be skipped
 * unless test credentials are configured.
 */

test.describe('Admin Dashboard - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/admin');

    // Should see login form elements
    await expect(page.getByRole('heading', { name: /Sign In|Log In/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Admin Dashboard - Navigation Guard', () => {
  test('should protect all admin routes', async ({ page }) => {
    const adminRoutes = [
      '/admin',
      '/admin/teams',
      '/admin/players',
      '/admin/coaches',
      '/admin/registrations',
      '/admin/tryouts',
      '/admin/games',
      '/admin/venues',
      '/admin/practices',
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      // All admin routes should redirect to login when not authenticated
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });
});

test.describe('Admin Dashboard - Authenticated', () => {
  // Skip these tests if no test credentials are configured
  test.beforeEach(async ({ page }) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Navigate to login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Submit login
    await page.getByRole('button', { name: /Sign In|Log In/i }).click();

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test('should display admin dashboard after login', async ({ page }) => {
    // Check for dashboard elements
    await expect(page.getByText(/Dashboard|Overview/i)).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Dashboard should show various stats
    const statsToCheck = ['Teams', 'Players', 'Registrations'];

    for (const stat of statsToCheck) {
      // Look for stat labels (may be in cards or headings)
      const statElement = page.getByText(new RegExp(stat, 'i')).first();
      await expect(statElement).toBeVisible({ timeout: 10000 });
    }
  });

  test('should have working navigation to teams page', async ({ page }) => {
    // Click on Teams link in sidebar or nav
    await page.getByRole('link', { name: /Teams/i }).first().click();

    await expect(page).toHaveURL(/\/admin\/teams/);
    await expect(page.getByRole('heading', { name: /Teams/i })).toBeVisible();
  });

  test('should have working navigation to players page', async ({ page }) => {
    await page.getByRole('link', { name: /Players/i }).first().click();

    await expect(page).toHaveURL(/\/admin\/players/);
    await expect(page.getByRole('heading', { name: /Players/i })).toBeVisible();
  });

  test('should have working navigation to registrations page', async ({ page }) => {
    await page.getByRole('link', { name: /Registrations/i }).first().click();

    await expect(page).toHaveURL(/\/admin\/registrations/);
  });

  test('should be able to sign out', async ({ page }) => {
    // Look for sign out button (may be in dropdown or visible)
    const signOutButton = page.getByRole('button', { name: /Sign Out|Log Out|Logout/i });

    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    } else {
      // May be in a user menu dropdown
      const userMenu = page.getByRole('button', { name: /menu|profile|user/i });
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.getByText(/Sign Out|Log Out|Logout/i).click();
      }
    }

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|$)/);
  });
});
