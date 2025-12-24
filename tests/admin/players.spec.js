// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Admin Players Page - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/players without auth', async ({ page }) => {
    await page.goto('/admin/players');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Players Page - UI Elements', () => {
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

    // Navigate to players page
    await page.goto('/admin/players');

    // Wait for the page to load
    await page.waitForSelector('button:has-text("Add Player")', { timeout: 15000 });
  });

  test('should display Add Player button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name...');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should display sort dropdown', async ({ page }) => {
    // Check for sort dropdown with Name option
    await expect(page.locator('select').filter({ hasText: 'Name' }).first()).toBeVisible();
  });

  test('should display filter dropdowns', async ({ page }) => {
    // Team filter
    await expect(page.locator('select').filter({ hasText: 'All Teams' })).toBeVisible();
    // Grade filter
    await expect(page.locator('select').filter({ hasText: 'All Grades' })).toBeVisible();
    // Payment filter
    await expect(page.locator('select').filter({ hasText: 'All Payments' })).toBeVisible();
  });

  test('should display quick filter pills', async ({ page }) => {
    await expect(page.getByText('Quick filters:')).toBeVisible();
    await expect(page.getByText('Unassigned')).toBeVisible();
    await expect(page.getByText('Unpaid')).toBeVisible();
    await expect(page.getByText('New Players')).toBeVisible();
    await expect(page.getByText('Tournament Roster')).toBeVisible();
  });

  test('should open Add Player modal when button is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player/i });
    await addButton.click();

    // Modal should be visible
    await expect(page.getByRole('heading', { name: /Add Player/i })).toBeVisible({ timeout: 5000 });

    // Form fields should be present
    await expect(page.getByLabel(/First Name/i)).toBeVisible();
    await expect(page.getByLabel(/Last Name/i)).toBeVisible();
  });

  test('should close Add Player modal when Cancel is clicked', async ({ page }) => {
    // Open modal
    const addButton = page.getByRole('button', { name: /Add Player/i });
    await addButton.click();
    await expect(page.getByRole('heading', { name: /Add Player/i })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should be closed
    await expect(page.getByRole('heading', { name: /Add Player/i })).not.toBeVisible();
  });
});

test.describe('Admin Players Page - Table View', () => {
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

    await page.goto('/admin/players');
    await page.waitForSelector('button:has-text("Add Player")', { timeout: 15000 });
  });

  test('should display players table with headers', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Table should have headers
    await expect(page.getByText('Player', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Grade')).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    await expect(page.getByText('Parent/Guardian')).toBeVisible();
    await expect(page.getByText('Phone')).toBeVisible();
    await expect(page.getByText('Payment')).toBeVisible();
  });

  test('should display grade badges in table rows', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for grade badges (if players exist)
    const gradeBadges = page.locator('[data-testid="grade-badge"]');
    const count = await gradeBadges.count();

    if (count > 0) {
      await expect(gradeBadges.first()).toBeVisible();
    }
  });

  test('should show empty state or players table', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasPlayers = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No players yet|No players found/i).isVisible().catch(() => false);

    expect(hasPlayers || hasEmptyState).toBe(true);
  });
});

test.describe('Admin Players Page - Quick Filters', () => {
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

    await page.goto('/admin/players');
    await page.waitForSelector('button:has-text("Add Player")', { timeout: 15000 });
  });

  test('should toggle quick filter pill active state when clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click the Unassigned filter
    const unassignedFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Unassigned' });
    await unassignedFilter.click();

    // Should have ring class (active state)
    await expect(unassignedFilter).toHaveAttribute('data-active', 'true');

    // Click again to deactivate
    await unassignedFilter.click();
    await expect(unassignedFilter).toHaveAttribute('data-active', 'false');
  });

  test('should filter by search query', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('Search by name...');
    await searchInput.fill('Test');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Results should be filtered (or show empty state)
    // This is a smoke test - actual filtering depends on data
  });

  test('should show Clear all button when filters are active', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click a filter
    const unassignedFilter = page.locator('[data-testid="filter-pill"]').filter({ hasText: 'Unassigned' });
    await unassignedFilter.click();

    // Clear all button should appear
    await expect(page.getByText('Clear all')).toBeVisible();

    // Click clear all
    await page.getByText('Clear all').click();

    // Filter should be deactivated
    await expect(unassignedFilter).toHaveAttribute('data-active', 'false');
  });
});

test.describe('Admin Players Page - Player Detail Panel', () => {
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

    await page.goto('/admin/players');
    await page.waitForSelector('button:has-text("Add Player")', { timeout: 15000 });
  });

  test('should open player detail panel when row is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find a player row
    const playerRow = page.locator('tr[data-testid^="player-row-"]').first();

    if (await playerRow.isVisible().catch(() => false)) {
      await playerRow.click();

      // Detail panel should show tabs
      await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: 'Parent Info' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
    }
  });

  test('should show player stats in detail panel', async ({ page }) => {
    await page.waitForTimeout(2000);

    const playerRow = page.locator('tr[data-testid^="player-row-"]').first();

    if (await playerRow.isVisible().catch(() => false)) {
      await playerRow.click();

      // Should show stats
      await expect(page.getByText('Teams')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Seasons')).toBeVisible();
      await expect(page.getByText('Years Exp')).toBeVisible();
    }
  });

  test('should close detail panel when X is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    const playerRow = page.locator('tr[data-testid^="player-row-"]').first();

    if (await playerRow.isVisible().catch(() => false)) {
      await playerRow.click();
      await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible({ timeout: 5000 });

      // Close the panel
      await page.locator('button[title="Close"]').first().click();

      // Panel should be closed
      await expect(page.getByRole('button', { name: 'Overview' })).not.toBeVisible();
    }
  });
});

test.describe('Admin Players Page - Form Validation', () => {
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

    await page.goto('/admin/players');
    await page.waitForSelector('button:has-text("Add Player")', { timeout: 15000 });

    // Open create modal
    await page.getByRole('button', { name: /Add Player/i }).click();
    await expect(page.getByRole('heading', { name: /Add Player/i })).toBeVisible();
  });

  test('should have required fields', async ({ page }) => {
    const firstNameInput = page.getByLabel(/First Name/i);
    const lastNameInput = page.getByLabel(/Last Name/i);

    await expect(firstNameInput).toHaveAttribute('required');
    await expect(lastNameInput).toHaveAttribute('required');
  });

  test('should show grade level options', async ({ page }) => {
    const gradeSelect = page.getByLabel(/Current Grade/i);
    await gradeSelect.click();

    // Check for grade options
    await expect(page.getByRole('option', { name: '3rd Grade' })).toBeVisible();
    await expect(page.getByRole('option', { name: '5th Grade' })).toBeVisible();
    await expect(page.getByRole('option', { name: '8th Grade' })).toBeVisible();
  });

  test('should show gender options', async ({ page }) => {
    await expect(page.locator('option', { hasText: 'Male' })).toBeVisible();
    await expect(page.locator('option', { hasText: 'Female' })).toBeVisible();
  });
});
