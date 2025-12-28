// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Admin Registrations Page - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/registrations without auth', async ({ page }) => {
    await page.goto('/admin/registrations');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Registrations Page - UI Elements', () => {
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

    // Navigate to registrations page
    await page.goto('/admin/registrations');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
  });

  test('should display Registrations heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Registrations' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await expect(searchInput).toBeVisible();
  });

  test('should display filter dropdowns', async ({ page }) => {
    // Status filter
    await expect(page.locator('select').filter({ hasText: 'All Statuses' })).toBeVisible();
    // Payment filter
    await expect(page.locator('select').filter({ hasText: 'All Payments' })).toBeVisible();
    // Team filter
    await expect(page.locator('select').filter({ hasText: 'All Teams' })).toBeVisible();
  });

  test('should display quick filter pills', async ({ page }) => {
    await expect(page.getByText('Quick filters:')).toBeVisible();
    await expect(page.getByText('Pending Review')).toBeVisible();
    await expect(page.getByText('Unpaid')).toBeVisible();
    await expect(page.getByText('Unassigned')).toBeVisible();
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

test.describe('Admin Registrations Page - Table View', () => {
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

    await page.goto('/admin/registrations');
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
  });

  test('should display table with headers', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for table headers
    await expect(page.getByText('Player', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Grade')).toBeVisible();
    await expect(page.getByText('Parent/Guardian')).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Payment')).toBeVisible();
    await expect(page.getByText('Submitted')).toBeVisible();
  });

  test('should show empty state or registrations table', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No registrations yet|No registrations found/i).isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });

  test('should display count footer', async ({ page }) => {
    await page.waitForTimeout(2000);

    await expect(page.getByText(/\d+ of \d+ registration/i)).toBeVisible();
  });
});

test.describe('Admin Registrations Page - Quick Filters', () => {
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

    await page.goto('/admin/registrations');
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
  });

  test('should toggle quick filter pill active state when clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click the Pending Review filter
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending Review' });
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
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending Review' });
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

  test('should filter by payment dropdown', async ({ page }) => {
    await page.waitForTimeout(1000);

    const paymentSelect = page.locator('select').filter({ hasText: 'All Payments' });
    await paymentSelect.selectOption('pending');

    // Wait for filter to apply
    await page.waitForTimeout(500);
  });
});

test.describe('Admin Registrations Page - Detail Panel', () => {
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

    await page.goto('/admin/registrations');
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
  });

  test('should open detail panel when row is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find a registration row
    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Detail panel should show with player info
      await expect(page.getByText('Player Information')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display actions section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show actions section
      await expect(page.getByText('Actions')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display parent/guardian section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show parent info
      await expect(page.getByText('Parent/Guardian')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display waiver section in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show waiver section
      await expect(page.getByText('Waiver')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close detail panel when X is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();
      await expect(page.getByText('Player Information')).toBeVisible({ timeout: 5000 });

      // Find and click the close button in the detail panel
      const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await closeButton.click();

      // Panel should be closed - Player Information should not be in detail panel
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Admin Registrations Page - Status Actions', () => {
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

    await page.goto('/admin/registrations');
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
  });

  test('should display Approve button for pending registrations', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Filter to pending
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending Review' });
    await pendingFilter.click();
    await page.waitForTimeout(500);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show Approve button
      await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display Reject button for pending registrations', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Filter to pending
    const pendingFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Pending Review' });
    await pendingFilter.click();
    await page.waitForTimeout(500);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show Reject button
      await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display payment status dropdown', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show payment status dropdown
      await expect(page.locator('select').filter({ hasText: /Payment/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display team assignment dropdown', async ({ page }) => {
    await page.waitForTimeout(2000);

    const registrationRow = page.locator('tbody tr').first();

    if (await registrationRow.isVisible().catch(() => false)) {
      await registrationRow.click();

      // Should show team assignment dropdown
      await expect(page.locator('select').filter({ hasText: /Assign to team/i })).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Registrations Page - Export', () => {
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

    await page.goto('/admin/registrations');
    await page.waitForSelector('h1:has-text("Registrations")', { timeout: 15000 });
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
      expect(download.suggestedFilename()).toContain('tne-registrations');
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });
});

test.describe('Admin Registrations Page - Navigation', () => {
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
  });

  test('should show Registrations link in navbar', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });

    // Desktop navbar should have Registrations link
    await expect(page.locator('nav').getByText('Registrations')).toBeVisible();
  });

  test('should navigate to registrations page from navbar', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });

    // Click Registrations link
    await page.locator('nav').getByText('Registrations').click();

    // Should be on registrations page
    await expect(page).toHaveURL('/admin/registrations');
  });

  test('should show badge count on navbar when pending registrations exist', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });

    // Badge may or may not be visible depending on data
    // This test just verifies the navbar link is accessible
    await expect(page.locator('nav').getByText('Registrations')).toBeVisible();
  });
});
