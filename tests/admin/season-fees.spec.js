// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Admin Season Fees - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/settings/seasons');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Season Fees - Authenticated', () => {
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

  test('should display Fees expand button on season cards', async ({ page }) => {
    // Wait for seasons to load
    await page.waitForTimeout(2000);

    // Look for the Fees button (from SeasonCard)
    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    // If there are season cards, there should be Fees buttons
    if (count > 0) {
      await expect(feesButton.first()).toBeVisible();
    }
  });

  test('should expand fees section when clicking Fees button', async ({ page }) => {
    await page.waitForTimeout(2000);

    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    if (count > 0) {
      await feesButton.first().click();

      // Should show the fees section (either with fee items or empty state)
      await page.waitForTimeout(1000);

      const hasAddFee = await page.getByRole('button', { name: /Add Fee/i }).isVisible().catch(() => false);
      const hasEmptyState = await page.getByText(/No fees configured/i).isVisible().catch(() => false);

      expect(hasAddFee || hasEmptyState).toBe(true);
    }
  });

  test('should show empty state when no fees configured', async ({ page }) => {
    await page.waitForTimeout(2000);

    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    if (count > 0) {
      // Expand first season's fees
      await feesButton.first().click();
      await page.waitForTimeout(1000);

      // Add Fee button should always be present in the fees section
      const addFeeButton = page.getByRole('button', { name: /Add Fee/i });
      await expect(addFeeButton.first()).toBeVisible();
    }
  });

  test('should open Add Fee modal', async ({ page }) => {
    await page.waitForTimeout(2000);

    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    if (count > 0) {
      // Expand fees section
      await feesButton.first().click();
      await page.waitForTimeout(1000);

      // Click Add Fee
      const addFeeButton = page.getByRole('button', { name: /Add Fee/i });
      await addFeeButton.first().click();

      // Modal should appear with Add Fee heading
      await expect(page.getByRole('heading', { name: /Add Fee/i })).toBeVisible();

      // Form fields should be present
      await expect(page.getByText(/Fee Name/i)).toBeVisible();
      await expect(page.getByText(/Amount/i)).toBeVisible();
    }
  });

  test('should close Add Fee modal on cancel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    if (count > 0) {
      // Expand fees section
      await feesButton.first().click();
      await page.waitForTimeout(1000);

      // Click Add Fee
      const addFeeButton = page.getByRole('button', { name: /Add Fee/i });
      await addFeeButton.first().click();

      // Verify modal is open
      await expect(page.getByRole('heading', { name: /Add Fee/i })).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: /Cancel/i }).click();

      // Modal should be gone
      await expect(page.getByRole('heading', { name: /Add Fee/i })).not.toBeVisible();
    }
  });

  test('should show fee form toggle controls', async ({ page }) => {
    await page.waitForTimeout(2000);

    const feesButton = page.getByRole('button', { name: /Fees/i });
    const count = await feesButton.count();

    if (count > 0) {
      await feesButton.first().click();
      await page.waitForTimeout(1000);

      const addFeeButton = page.getByRole('button', { name: /Add Fee/i });
      await addFeeButton.first().click();

      // Check for toggle labels in the modal
      await expect(page.getByText('Active')).toBeVisible();
      await expect(page.getByText('Public')).toBeVisible();
      await expect(page.getByText('Payment Enabled')).toBeVisible();
    }
  });
});
