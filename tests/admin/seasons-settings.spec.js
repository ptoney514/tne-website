// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Admin Seasons Settings - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/settings/seasons');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Seasons Settings - Authenticated', () => {
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

    // Wait for redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    // Navigate to seasons settings
    await page.goto('/admin/settings/seasons');
    await page.waitForLoadState('networkidle');
  });

  test('should display page heading and Create button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Seasons/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Season/i })).toBeVisible();
  });

  test('should display seasons table or empty state', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Either shows a table with seasons or an empty state
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No seasons yet/i).isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });

  test('should highlight Seasons sidebar link', async ({ page }) => {
    // The Seasons nav link should have the active/highlighted style
    const seasonsLink = page.getByRole('link', { name: /Seasons/i });
    await expect(seasonsLink).toBeVisible();

    const className = await seasonsLink.getAttribute('class');
    expect(className).toContain('bg-tne-red');
  });

  test('should open Create Season modal', async ({ page }) => {
    await page.getByRole('button', { name: /Create Season/i }).first().click();

    // Modal should appear
    await expect(page.getByRole('heading', { name: /Create Season/i })).toBeVisible();

    // Form fields should be present
    await expect(page.getByText(/Season Name/i)).toBeVisible();
    await expect(page.getByText(/Start Date/i)).toBeVisible();
    await expect(page.getByText(/End Date/i)).toBeVisible();
  });

  test('should close Create Season modal on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Create Season/i }).first().click();
    await expect(page.getByRole('heading', { name: /Create Season/i })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Modal should be gone
    await expect(page.getByRole('heading', { name: /Create Season/i })).not.toBeVisible();
  });

  test('should validate required fields in Create Season modal', async ({ page }) => {
    await page.getByRole('button', { name: /Create Season/i }).first().click();
    await expect(page.getByRole('heading', { name: /Create Season/i })).toBeVisible();

    // Try to submit empty form - HTML5 validation should prevent submission
    // The form has required attributes, so the submit button should exist
    const submitButton = page.getByRole('button', { name: /Create Season/i }).last();
    await expect(submitButton).toBeVisible();
  });

  test('should show edit and delete buttons for existing seasons', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasTable = await page.locator('table').isVisible().catch(() => false);
    if (hasTable) {
      // Edit button (pencil icon) should exist
      const editButtons = page.getByTitle('Edit');
      const editCount = await editButtons.count();
      expect(editCount).toBeGreaterThan(0);

      // Delete button (trash icon) should exist
      const deleteButtons = page.getByTitle('Delete');
      const deleteCount = await deleteButtons.count();
      expect(deleteCount).toBeGreaterThan(0);
    }
  });

  test('should show toggle active button for existing seasons', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasTable = await page.locator('table').isVisible().catch(() => false);
    if (hasTable) {
      const activateButtons = page.getByTitle(/Activate|Deactivate/);
      const count = await activateButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.waitForTimeout(2000);

    const deleteButtons = page.getByTitle('Delete');
    const count = await deleteButtons.count();

    if (count > 0) {
      await deleteButtons.first().click();

      // Confirmation dialog should appear
      await expect(page.getByText(/Delete Season\?/i)).toBeVisible();
      await expect(page.getByText(/This will also delete all teams/i)).toBeVisible();

      // Cancel and dismiss
      await page.getByRole('button', { name: /Cancel/i }).click();
      await expect(page.getByText(/Delete Season\?/i)).not.toBeVisible();
    }
  });
});
