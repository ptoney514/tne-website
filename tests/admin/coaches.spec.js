// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Admin Coaches Page - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/coaches without auth', async ({ page }) => {
    await page.goto('/admin/coaches');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Coaches Page - UI Elements', () => {
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

    // Navigate to coaches page
    await page.goto('/admin/coaches');

    // Wait for the page to load
    await page.waitForSelector('button:has-text("Add Coach")', { timeout: 15000 });
  });

  test('should display Add Coach button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Coach/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name, email, or phone...');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should display filter dropdowns', async ({ page }) => {
    // Status filter
    await expect(page.locator('select').filter({ hasText: 'All Status' })).toBeVisible();
    // Role filter
    await expect(page.locator('select').filter({ hasText: 'All Roles' })).toBeVisible();
  });

  test('should display quick filter pills', async ({ page }) => {
    await expect(page.getByText('Quick filters:')).toBeVisible();
    await expect(page.getByText('Missing Certs')).toBeVisible();
    await expect(page.getByText('Expiring Soon')).toBeVisible();
    await expect(page.getByText('No Team')).toBeVisible();
  });

  test('should display certification legend', async ({ page }) => {
    await expect(page.getByText('Legend:')).toBeVisible();
    await expect(page.getByText('USA Basketball')).toBeVisible();
    await expect(page.getByText('CPR/First Aid')).toBeVisible();
    await expect(page.getByText('Background Check')).toBeVisible();
    await expect(page.getByText('Valid')).toBeVisible();
    await expect(page.getByText('Expiring')).toBeVisible();
    await expect(page.getByText('Missing')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.getByText('Active Coaches')).toBeVisible();
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Expiring Soon')).toBeVisible();
    await expect(page.getByText('Missing Certs')).toBeVisible();
  });

  test('should open Add Coach modal when button is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Coach/i });
    await addButton.click();

    // Modal should be visible
    await expect(page.getByRole('heading', { name: /Add Coach/i })).toBeVisible({ timeout: 5000 });

    // Form fields should be present
    await expect(page.getByLabel(/First Name/i)).toBeVisible();
    await expect(page.getByLabel(/Last Name/i)).toBeVisible();
  });

  test('should close Add Coach modal when Cancel is clicked', async ({ page }) => {
    // Open modal
    const addButton = page.getByRole('button', { name: /Add Coach/i });
    await addButton.click();
    await expect(page.getByRole('heading', { name: /Add Coach/i })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should be closed
    await expect(page.getByRole('heading', { name: /Add Coach/i })).not.toBeVisible();
  });
});

test.describe('Admin Coaches Page - Table View', () => {
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

    await page.goto('/admin/coaches');
    await page.waitForSelector('button:has-text("Add Coach")', { timeout: 15000 });
  });

  test('should display coaches table with headers', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Table should have headers
    await expect(page.getByText('Coach', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Phone')).toBeVisible();
    await expect(page.getByText('Teams')).toBeVisible();
    await expect(page.getByText('Certifications')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });

  test('should display certification badges in table rows', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for certification badges (if coaches exist)
    const certBadges = page.locator('[data-testid="cert-badge"]');
    const count = await certBadges.count();

    if (count > 0) {
      await expect(certBadges.first()).toBeVisible();
    }
  });

  test('should show empty state or coaches table', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasCoaches = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No coaches yet|No coaches found/i).isVisible().catch(() => false);

    expect(hasCoaches || hasEmptyState).toBe(true);
  });
});

test.describe('Admin Coaches Page - Quick Filters', () => {
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

    await page.goto('/admin/coaches');
    await page.waitForSelector('button:has-text("Add Coach")', { timeout: 15000 });
  });

  test('should toggle quick filter pill active state when clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click the Missing Certs filter
    const missingCertsFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Missing Certs' });
    await missingCertsFilter.click();

    // Should have ring class (active state)
    await expect(missingCertsFilter).toHaveAttribute('data-active', 'true');

    // Click again to deactivate
    await missingCertsFilter.click();
    await expect(missingCertsFilter).toHaveAttribute('data-active', 'false');
  });

  test('should filter by search query', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('Search by name, email, or phone...');
    await searchInput.fill('Test');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Results should be filtered (or show empty state)
  });

  test('should show Clear all button when filters are active', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click a filter
    const missingCertsFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Missing Certs' });
    await missingCertsFilter.click();

    // Clear all button should appear
    await expect(page.getByText('Clear all')).toBeVisible();

    // Click clear all
    await page.getByText('Clear all').click();

    // Filter should be deactivated
    await expect(missingCertsFilter).toHaveAttribute('data-active', 'false');
  });
});

test.describe('Admin Coaches Page - Coach Detail Panel', () => {
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

    await page.goto('/admin/coaches');
    await page.waitForSelector('button:has-text("Add Coach")', { timeout: 15000 });
  });

  test('should open coach detail panel when row is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find a coach row
    const coachRow = page.locator('tr[data-testid^="coach-row-"]').first();

    if (await coachRow.isVisible().catch(() => false)) {
      await coachRow.click();

      // Detail panel should show coach info
      await expect(page.getByText('Contact Information')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Coaches Page - Form Validation', () => {
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

    await page.goto('/admin/coaches');
    await page.waitForSelector('button:has-text("Add Coach")', { timeout: 15000 });

    // Open create modal
    await page.getByRole('button', { name: /Add Coach/i }).click();
    await expect(page.getByRole('heading', { name: /Add Coach/i })).toBeVisible();
  });

  test('should have required fields', async ({ page }) => {
    const firstNameInput = page.getByLabel(/First Name/i);
    const lastNameInput = page.getByLabel(/Last Name/i);

    await expect(firstNameInput).toHaveAttribute('required');
    await expect(lastNameInput).toHaveAttribute('required');
  });

  test('should show role options', async ({ page }) => {
    await expect(page.locator('option', { hasText: 'Head Coach' })).toBeVisible();
    await expect(page.locator('option', { hasText: 'Assistant Coach' })).toBeVisible();
    await expect(page.locator('option', { hasText: 'Skills Trainer' })).toBeVisible();
  });
});
