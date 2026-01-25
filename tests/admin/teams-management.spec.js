// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Admin Teams Management E2E Tests
 *
 * These tests verify the admin teams management functionality.
 * Note: These tests require authentication. In CI, they will be skipped
 * unless test credentials are configured.
 */

// Helper to login before tests
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

test.describe('Admin Teams Page - Unauthenticated', () => {
  test('should redirect to login', async ({ page }) => {
    await page.goto('/admin/teams');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Teams Page - Page Load', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');
  });

  test('should display teams page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Teams/i }).first()).toBeVisible();
  });

  test('should display teams table or list', async ({ page }) => {
    // Wait for teams to load
    await page.waitForTimeout(1000);

    // Should have either a table or a list of teams
    const hasTable = await page.locator('table').count();
    const hasTeamCards = await page.locator('[data-testid="team-card"]').count();
    const hasTeamItems = await page.getByText(/Grade|Elite|Boys|Girls/i).count();

    expect(hasTable > 0 || hasTeamCards > 0 || hasTeamItems > 0).toBeTruthy();
  });

  test('should have add team button', async ({ page }) => {
    // Look for add team button
    const addButton = page.getByRole('button', { name: /Add Team|New Team|Create Team/i });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Admin Teams Page - Team CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');
  });

  test('should open create team modal/form when clicking add', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Team|New Team|Create Team/i });
    await addButton.click();

    // Should show a form or modal for creating a team
    await expect(page.getByText(/Create Team|New Team|Add Team/i)).toBeVisible();

    // Should have form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible();
  });

  test('should validate required fields on team creation', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Team|New Team|Create Team/i });
    await addButton.click();

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /Save|Create|Submit/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required|please fill|cannot be empty/i)).toBeVisible();
  });

  test('should be able to view team details', async ({ page }) => {
    // Wait for teams to load
    await page.waitForTimeout(1000);

    // Click on a team row or card (if any exist)
    const teamLink = page.getByRole('link', { name: /Grade|Elite|View|Details/i }).first();
    const teamExists = await teamLink.count();

    if (teamExists === 0) {
      // No teams to test with
      test.skip();
      return;
    }

    await teamLink.click();

    // Should navigate to team detail page
    await expect(page).toHaveURL(/\/admin\/teams\/.+/);
  });

  test('should be able to cancel team creation', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Team|New Team|Create Team/i });
    await addButton.click();

    // Look for cancel button
    const cancelButton = page.getByRole('button', { name: /Cancel|Close/i });
    await cancelButton.click();

    // Modal should close - form should not be visible
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).not.toBeVisible();
  });
});

test.describe('Admin Teams Page - Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');
  });

  test('should have season filter if applicable', async ({ page }) => {
    // Look for season selector
    const seasonFilter = page.getByRole('combobox', { name: /season/i });
    const seasonDropdown = page.locator('select').filter({ hasText: /season|winter|spring|fall/i });

    const hasSeasonFilter = (await seasonFilter.count()) > 0 || (await seasonDropdown.count()) > 0;

    // Season filter may or may not exist depending on implementation
    if (hasSeasonFilter) {
      // If it exists, it should be interactive
      const selector = (await seasonFilter.count()) > 0 ? seasonFilter : seasonDropdown;
      await expect(selector.first()).toBeEnabled();
    }
  });

  test('should filter teams by grade if filter exists', async ({ page }) => {
    // Look for grade filter
    const gradeFilter = page.getByRole('combobox', { name: /grade/i });
    const gradeExists = (await gradeFilter.count()) > 0;

    if (!gradeExists) {
      test.skip();
      return;
    }

    // Select a specific grade
    await gradeFilter.selectOption({ index: 1 });

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Teams list should update (we can't verify specific content without knowing the data)
  });
});

test.describe('Admin Teams Page - Team Detail View', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
  });

  test('should display team roster on detail page', async ({ page }) => {
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');

    // Navigate to first team
    const teamLink = page.getByRole('link', { name: /Grade|Elite|View|Details/i }).first();
    const teamExists = await teamLink.count();

    if (teamExists === 0) {
      test.skip();
      return;
    }

    await teamLink.click();
    await page.waitForLoadState('networkidle');

    // Should show roster section
    await expect(page.getByText(/Roster|Players|Team Members/i).first()).toBeVisible();
  });

  test('should have edit team functionality', async ({ page }) => {
    await page.goto('/admin/teams');
    await page.waitForLoadState('networkidle');

    const teamLink = page.getByRole('link', { name: /Grade|Elite|View|Details/i }).first();
    const teamExists = await teamLink.count();

    if (teamExists === 0) {
      test.skip();
      return;
    }

    await teamLink.click();
    await page.waitForLoadState('networkidle');

    // Look for edit button
    const editButton = page.getByRole('button', { name: /Edit|Modify/i }).first();
    await expect(editButton).toBeVisible();
  });
});
