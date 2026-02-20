// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Admin Registration Controls E2E Tests
 *
 * Tests that admin can enable/disable registration and tryouts,
 * and that the public registration page responds to config changes.
 */

// Helper to login as admin
async function loginAsAdmin(page) {
  const testEmail = process.env.TEST_ADMIN_EMAIL;
  const testPassword = process.env.TEST_ADMIN_PASSWORD;

  if (!testEmail || !testPassword) {
    return false;
  }

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);
  await page.getByRole('button', { name: /Sign In|Log In/i }).click();

  await page.waitForURL(/\/admin/, { timeout: 10000 });
  return true;
}

// ---------------------------------------------------------------------------
// 1. Public Registration Page - Config-Driven Behavior (no auth needed)
// ---------------------------------------------------------------------------

test.describe('Registration Page - Config-Driven Display', () => {
  test('should show type selector when both registration and tryouts are open', async ({
    page,
  }) => {
    // Default config has both open - just navigate
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Clear any draft
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
    // Reload to ensure clean state
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10000 });

    // Type selector should be visible
    await expect(page.getByText('How would you like to register?')).toBeVisible();
    await expect(page.getByText('Register for a Season')).toBeVisible();
    await expect(page.getByText('Register for a Team')).toBeVisible();
  });

  test('should auto-select team registration when only registration is open', async ({
    page,
  }) => {
    // Intercept config to disable tryouts
    await page.route('**/data/json/config.json', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.tryouts.is_open = false;
      await route.fulfill({ json });
    });

    await page.goto('/register');
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
    await page.waitForSelector('h1', { timeout: 10000 });

    // Should NOT show type selector
    await expect(page.getByText('How would you like to register?')).not.toBeVisible({
      timeout: 3000,
    });

    // Should go directly to team wizard - look for team selector
    await expect(page.locator('select#teamId')).toBeVisible({ timeout: 10000 });
  });

  test('should auto-select season registration when only tryouts is open', async ({ page }) => {
    // Intercept config to disable team registration
    await page.route('**/data/json/config.json', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.registration.is_open = false;
      await route.fulfill({ json });
    });

    await page.goto('/register');
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
    await page.waitForSelector('h1', { timeout: 10000 });

    // Should NOT show type selector
    await expect(page.getByText('How would you like to register?')).not.toBeVisible({
      timeout: 3000,
    });

    // Should go directly to season wizard - look for player first name input
    // (season step 1 has no team selector)
    await expect(page.locator('input#playerFirstName')).toBeVisible({ timeout: 10000 });
    // Team selector should NOT be visible (season flow doesn't have it)
    await expect(page.locator('select#teamId')).not.toBeVisible();
  });

  test('should show closed message when both are disabled', async ({ page }) => {
    // Intercept config to disable both
    await page.route('**/data/json/config.json', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.registration.is_open = false;
      json.tryouts.is_open = false;
      await route.fulfill({ json });
    });

    await page.goto('/register');
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
    await page.waitForSelector('h1', { timeout: 10000 });

    // Should show closed message
    await expect(page.getByText('Registration Is Currently Closed')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('Get Notified')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Admin Registration Settings (requires auth)
// ---------------------------------------------------------------------------

test.describe('Admin Registration Settings - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/settings/registration');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Registration Settings', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto('/admin/settings/registration');
    await page.waitForLoadState('networkidle');
  });

  test('should display registration settings page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Registration Settings/i })
    ).toBeVisible();
  });

  test('should have registration open toggle', async ({ page }) => {
    // Should have a toggle for "Registration Open"
    await expect(page.getByText('Registration Open')).toBeVisible();
  });

  test('should have registration label input', async ({ page }) => {
    // Should have a label input field
    await expect(page.getByText('Registration Label')).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible();
  });

  test('should show preview section', async ({ page }) => {
    // Wait for season to load and preview to show
    await page.waitForTimeout(2000);

    const previewVisible = await page
      .getByText('Preview')
      .isVisible()
      .catch(() => false);
    if (previewVisible) {
      await expect(page.getByText('Homepage Display')).toBeVisible();
    }
  });

  test('should have season selector', async ({ page }) => {
    await expect(page.getByText('Select Season to Configure')).toBeVisible();

    // Season dropdown should be present
    const seasonSelect = page.locator('select').first();
    await expect(seasonSelect).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Admin Season Management (requires auth)
// ---------------------------------------------------------------------------

test.describe('Admin Season Management - Team Assignment', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
  });

  test('should display seasons settings page with create button', async ({ page }) => {
    await page.goto('/admin/settings/seasons');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Seasons/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Season/i })).toBeVisible();
  });

  test('should display teams management with add team button', async ({ page }) => {
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Teams/i }).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Add Team|New Team|Create Team/i })
    ).toBeVisible();
  });
});
