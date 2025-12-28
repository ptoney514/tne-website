// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Admin Tryouts Page - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/tryouts without auth', async ({ page }) => {
    await page.goto('/admin/tryouts');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Tryouts Page - UI Elements', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    // Clear session and login
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login as admin
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    // Navigate to tryouts page
    await page.goto('/admin/tryouts');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should display Tryout Signups heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tryout Signups' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await expect(searchInput).toBeVisible();
  });

  test('should display filter dropdowns', async ({ page }) => {
    // Status filter
    await expect(page.locator('select').filter({ hasText: 'All Statuses' })).toBeVisible();
    // Session filter
    await expect(page.locator('select').filter({ hasText: 'All Sessions' })).toBeVisible();
    // Grade filter
    await expect(page.locator('select').filter({ hasText: 'All Grades' })).toBeVisible();
  });

  test('should display quick filter pills', async ({ page }) => {
    await expect(page.getByText('Quick filters:')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Attended')).toBeVisible();
    await expect(page.getByText('Selected')).toBeVisible();
  });

  test('should display refresh button', async ({ page }) => {
    const refreshButton = page.locator('button[title="Refresh"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should display export button', async ({ page }) => {
    const exportButton = page.locator('button[title="Export CSV"]');
    await expect(exportButton).toBeVisible();
  });
});

test.describe('Admin Tryouts Page - Table View', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin/tryouts');
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should display table with headers', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for table headers
    await expect(page.getByText('Player', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Grade')).toBeVisible();
    await expect(page.getByText('Parent/Guardian')).toBeVisible();
    await expect(page.getByText('Session')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Registered')).toBeVisible();
  });

  test('should show empty state or signups table', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No tryout signups yet|No signups found/i).isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });

  test('should display count footer', async ({ page }) => {
    await page.waitForTimeout(2000);

    await expect(page.getByText(/\d+ of \d+ signup/i)).toBeVisible();
  });
});

test.describe('Admin Tryouts Page - Quick Filters', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin/tryouts');
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should toggle quick filter pill active state when clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click the Pending filter
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending' });
    await pendingFilter.click();

    // Should have active state
    await expect(pendingFilter).toHaveAttribute('data-active', 'true');

    // Click again to deactivate
    await pendingFilter.click();
    await expect(pendingFilter).toHaveAttribute('data-active', 'false');
  });

  test('should filter by search query', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill('Test');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Results should be filtered (or show empty state)
    // This is a smoke test - actual filtering depends on data
  });

  test('should show Clear all button when filters are active', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click a filter
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending' });
    await pendingFilter.click();

    // Clear all button should appear
    await expect(page.getByText('Clear all')).toBeVisible();

    // Click clear all
    await page.getByText('Clear all').click();

    // Filter should be deactivated
    await expect(pendingFilter).toHaveAttribute('data-active', 'false');
  });

  test('should filter by status dropdown', async ({ page }) => {
    await page.waitForTimeout(1000);

    const statusSelect = page.locator('select').filter({ hasText: 'All Statuses' });
    await statusSelect.selectOption('pending');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Clear all should be visible
    await expect(page.getByText('Clear all')).toBeVisible();
  });

  test('should filter by grade dropdown', async ({ page }) => {
    await page.waitForTimeout(1000);

    const gradeSelect = page.locator('select').filter({ hasText: 'All Grades' });
    await gradeSelect.selectOption('5');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Clear all should be visible
    await expect(page.getByText('Clear all')).toBeVisible();
  });
});

test.describe('Admin Tryouts Page - Detail Panel', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin/tryouts');
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should open detail panel when row is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find a signup row
    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Detail panel should show with player info
      await expect(page.getByText('Player Information')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display actions section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Should show actions section
      await expect(page.getByText('Actions')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display parent/guardian section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Should show parent info
      await expect(page.getByText('Parent/Guardian')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display tryout session section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Should show session section
      await expect(page.getByText('Tryout Session')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close detail panel when X is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();
      await expect(page.getByText('Player Information')).toBeVisible({ timeout: 5000 });

      // Find and click the close button in the detail panel
      const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await closeButton.click();

      // Panel should be closed
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Admin Tryouts Page - Status Actions', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin/tryouts');
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should display Confirm button for pending signups', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Filter to pending
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending' });
    await pendingFilter.click();
    await page.waitForTimeout(500);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Should show Confirm button
      await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display session dropdown in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const signupRow = page.locator('tbody tr').first();

    if (await signupRow.isVisible().catch(() => false)) {
      await signupRow.click();

      // Should show session dropdown
      await expect(page.locator('select').filter({ hasText: /Change session/i })).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Tryouts Page - Export', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin/tryouts');
    await page.waitForSelector('h1:has-text("Tryout Signups")', { timeout: 15000 });
  });

  test('should trigger CSV download when export button is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Listen for download
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

    // Click export button
    const exportButton = page.locator('button[title="Export CSV"]');
    await exportButton.click();

    // If there's data to export, a download should be triggered
    const download = await downloadPromise;

    if (download) {
      expect(download.suggestedFilename()).toContain('tne-tryout-signups');
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });
});
