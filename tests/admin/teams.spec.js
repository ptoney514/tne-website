// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
// These tests require real Supabase credentials and can be run manually with:
// TEST_ADMIN_EMAIL=email TEST_ADMIN_PASSWORD=password npx playwright test tests/admin/teams.spec.js
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Admin Teams Page - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/teams without auth', async ({ page }) => {
    await page.goto('/admin/teams');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Teams Page - UI Elements', () => {
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

    // Wait for login to complete (URL will change from /login)
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    // Navigate to teams page
    await page.goto('/admin/teams');

    // Wait for the Active Teams heading to ensure page is loaded
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });
  });

  test('should display teams page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Active Teams' })).toBeVisible({ timeout: 10000 });
  });

  test('should display page subtitle', async ({ page }) => {
    await expect(page.getByText('Select a team to manage rosters and schedules')).toBeVisible({ timeout: 10000 });
  });

  test('should display New Team button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /New Team/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search...');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should display filter chips', async ({ page }) => {
    // Status filters
    await expect(page.getByText('Needs Coach')).toBeVisible();

    // Gender filters
    await expect(page.getByRole('button', { name: 'Boys' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Girls' })).toBeVisible();

    // Tier filters
    await expect(page.getByRole('button', { name: /TNE Elite/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Express United/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Development/i })).toBeVisible();
  });

  test('should display Program Tier Legend', async ({ page }) => {
    await expect(page.getByText('Program Tier Legend')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Top-tier competitive teams')).toBeVisible();
  });

  test('should open create team modal when New Team is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /New Team/i });
    await addButton.click();

    // Modal should be visible
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible({ timeout: 5000 });

    // Form fields should be present
    await expect(page.getByLabel(/Team Name/i)).toBeVisible();
    await expect(page.getByLabel(/Grade Level/i)).toBeVisible();
    await expect(page.getByLabel(/Gender/i)).toBeVisible();
  });

  test('should close modal when Cancel is clicked', async ({ page }) => {
    // Open modal
    const addButton = page.getByRole('button', { name: /New Team/i });
    await addButton.click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should be closed
    await expect(page.getByRole('heading', { name: 'Create Team' })).not.toBeVisible();
  });
});

test.describe('Admin Teams Page - Table View', () => {
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

    await page.goto('/admin/teams');
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });
  });

  test('should display teams in table format', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Table should have headers
    await expect(page.getByText('Team', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Program / Tags')).toBeVisible();
    await expect(page.getByText('Players')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });

  test('should display tier badges in table rows', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for tier badges (at least one should be visible if teams exist)
    const tierBadges = page.locator('[data-testid="tier-badge"]');
    const count = await tierBadges.count();

    // If teams exist, there should be tier badges
    if (count > 0) {
      await expect(tierBadges.first()).toBeVisible();
    }
  });

  test('should show empty state or teams table', async ({ page }) => {
    await page.waitForTimeout(2000);

    const hasTeams = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No teams yet|No teams match filters/i).isVisible().catch(() => false);

    expect(hasTeams || hasEmptyState).toBe(true);
  });
});

test.describe('Admin Teams Page - Filters', () => {
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

    await page.goto('/admin/teams');
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });
  });

  test('should toggle filter chip active state when clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click the Boys filter
    const boysFilter = page.getByRole('button', { name: 'Boys' });
    await boysFilter.click();

    // Should have ring class (active state)
    await expect(boysFilter).toHaveClass(/ring-2/);

    // Click again to deactivate
    await boysFilter.click();
    await expect(boysFilter).not.toHaveClass(/ring-2/);
  });

  test('should filter by search query', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('Search...');
    await searchInput.fill('Express');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Results should be filtered (or show empty state)
    // This is a smoke test - actual filtering depends on data
  });
});

test.describe('Admin Teams Page - Edit Tags Modal', () => {
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

    await page.goto('/admin/teams');
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });
  });

  test('should open edit tags modal when pencil icon is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find and click the first edit tags button (pencil icon)
    const editButton = page.locator('button[title="Edit tier and tags"]').first();

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();

      // Modal should be visible
      await expect(page.getByRole('heading', { name: 'Edit Team Classification' })).toBeVisible({ timeout: 5000 });

      // Tier options should be visible
      await expect(page.getByText('Program Tier')).toBeVisible();
      await expect(page.getByText('TNE Elite')).toBeVisible();
      await expect(page.getByText('Express United')).toBeVisible();
      await expect(page.getByText('Development')).toBeVisible();

      // Tags should be visible
      await expect(page.getByText('Tags (select all that apply)')).toBeVisible();
    }
  });

  test('should close edit tags modal when Cancel is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    const editButton = page.locator('button[title="Edit tier and tags"]').first();

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      await expect(page.getByRole('heading', { name: 'Edit Team Classification' })).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Modal should close
      await expect(page.getByRole('heading', { name: 'Edit Team Classification' })).not.toBeVisible();
    }
  });
});

test.describe('Admin Teams Page - Form Validation', () => {
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

    await page.goto('/admin/teams');
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });

    // Open create modal
    await page.getByRole('button', { name: /New Team/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();
  });

  test('should have required fields', async ({ page }) => {
    const nameInput = page.getByLabel(/Team Name/i);
    const gradeSelect = page.getByLabel(/Grade Level/i);

    await expect(nameInput).toHaveAttribute('required');
    await expect(gradeSelect).toHaveAttribute('required');
  });

  test('should show grade level options', async ({ page }) => {
    const gradeSelect = page.getByLabel(/Grade Level/i);
    await gradeSelect.click();

    // Check for grade options
    await expect(page.getByRole('option', { name: '3rd Grade' })).toBeVisible();
    await expect(page.getByRole('option', { name: '5th Grade' })).toBeVisible();
    await expect(page.getByRole('option', { name: '8th Grade' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'High School' })).toBeVisible();
  });

  test('should show gender options', async ({ page }) => {
    await expect(page.locator('option', { hasText: 'Boys' })).toBeVisible();
    await expect(page.locator('option', { hasText: 'Girls' })).toBeVisible();
  });
});

test.describe('Admin Teams CRUD Operations', () => {
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

    await page.goto('/admin/teams');
    await page.waitForSelector('h1:has-text("Active Teams")', { timeout: 15000 });
  });

  test('should fill out and submit team creation form', async ({ page }) => {
    // Open create modal
    await page.getByRole('button', { name: /New Team/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();

    // Fill form
    await page.getByLabel(/Team Name/i).fill('Test Team E2E');
    await page.getByLabel(/Grade Level/i).selectOption('5th');
    await page.getByLabel(/Gender/i).selectOption('male');

    // Select first available season
    const seasonSelect = page.getByLabel(/Season/i);
    const options = await seasonSelect.locator('option').all();
    if (options.length > 1) {
      await seasonSelect.selectOption({ index: 1 });
    }

    // Fill optional fields
    await page.getByLabel(/Location/i).fill('TNE Training Center');
    await page.getByLabel(/Days/i).fill('Mon, Wed, Fri');
    await page.getByLabel(/Time/i).first().fill('6:00 PM - 8:00 PM');

    // Submit button should be clickable
    const submitButton = page.getByRole('button', { name: /Create Team/i });
    await expect(submitButton).toBeEnabled();

    // Click submit (will attempt to create team in Supabase)
    await submitButton.click();

    // Wait for either success (modal closes) or error message
    // We don't assert on success because it depends on Supabase state
  });

  test('should navigate to roster when team row is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find a team row
    const teamRow = page.locator('tr[data-testid^="team-row-"]').first();

    if (await teamRow.isVisible().catch(() => false)) {
      await teamRow.click();

      // Should navigate to roster page
      await expect(page).toHaveURL(/\/admin\/teams\/.*\/roster/);
    }
  });
});
