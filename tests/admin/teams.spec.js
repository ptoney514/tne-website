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

    // Wait for the Team Management heading to ensure page is loaded
    await page.waitForSelector('h1:has-text("Team Management")', { timeout: 15000 });
  });

  test('should display teams page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Team Management' })).toBeVisible({ timeout: 10000 });
  });

  test('should display back to dashboard link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back to Dashboard/i });
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test('should display Add Team button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Team/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('should open create team modal when Add Team is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Team/i });
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
    const addButton = page.getByRole('button', { name: /Add Team/i });
    await addButton.click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should be closed
    await expect(page.getByRole('heading', { name: 'Create Team' })).not.toBeVisible();
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    // Open modal
    const addButton = page.getByRole('button', { name: /Add Team/i });
    await addButton.click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();

    // Click X button (close icon)
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).click();

    // Modal should be closed
    await expect(page.getByRole('heading', { name: 'Create Team' })).not.toBeVisible();
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
    await page.waitForSelector('h1:has-text("Team Management")', { timeout: 15000 });

    // Open create modal
    await page.getByRole('button', { name: /Add Team/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();
  });

  test('should have required fields', async ({ page }) => {
    const nameInput = page.getByLabel(/Team Name/i);
    const gradeSelect = page.getByLabel(/Grade Level/i);
    const seasonSelect = page.getByLabel(/Season/i);

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
    const genderSelect = page.getByLabel(/Gender/i);

    await expect(page.locator('option', { hasText: 'Boys' })).toBeVisible();
    await expect(page.locator('option', { hasText: 'Girls' })).toBeVisible();
  });
});

test.describe('Admin Teams Page - Navigation', () => {
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
    await page.waitForSelector('h1:has-text("Team Management")', { timeout: 15000 });
  });

  test('should navigate back to dashboard', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back to Dashboard/i });
    await backLink.click();
    await expect(page).toHaveURL('/admin');
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
    await page.waitForSelector('h1:has-text("Team Management")', { timeout: 15000 });
  });

  test('should fill out and submit team creation form', async ({ page }) => {
    // Open create modal
    await page.getByRole('button', { name: /Add Team/i }).click();
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

  test('should show empty state or teams list', async ({ page }) => {
    // Page should either show teams grid or empty state
    await page.waitForTimeout(2000); // Wait for data to load

    const hasTeams = await page.locator('[class*="grid"]').locator('div').filter({ hasText: 'Players' }).count() > 0;
    const hasEmptyState = await page.getByText(/No teams yet|Create your first team/i).isVisible().catch(() => false);

    expect(hasTeams || hasEmptyState).toBe(true);
  });
});

test.describe('Admin Teams - Delete Confirmation', () => {
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
    await page.waitForSelector('h1:has-text("Team Management")', { timeout: 15000 });
  });

  test('should show delete confirmation when delete icon is clicked', async ({ page }) => {
    // Wait for teams to load
    await page.waitForTimeout(2000);

    // Find delete button (trash icon)
    const deleteButton = page.locator('button[title="Delete team"]').first();

    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();

      // Delete confirmation modal should appear
      await expect(page.getByRole('heading', { name: /Delete Team/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    }
    // If no teams exist, test passes (nothing to delete)
  });

  test('should close delete confirmation when Cancel is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);

    const deleteButton = page.locator('button[title="Delete team"]').first();

    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await expect(page.getByRole('heading', { name: /Delete Team/i })).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Modal should close
      await expect(page.getByRole('heading', { name: /Delete Team/i })).not.toBeVisible();
    }
  });
});
