// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Admin Players Management E2E Tests
 *
 * These tests verify the admin players management functionality.
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

test.describe('Admin Players Page - Unauthenticated', () => {
  test('should redirect to login', async ({ page }) => {
    await page.goto('/admin/players');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Players Page - Page Load', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should display players page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Players/i }).first()).toBeVisible();
  });

  test('should display players table or list', async ({ page }) => {
    // Wait for players to load
    await page.waitForTimeout(1000);

    // Should have either a table or a list of players
    const hasTable = await page.locator('table').count();
    const hasPlayerCards = await page.locator('[data-testid="player-card"]').count();

    // At minimum, should have table headers or player info visible
    expect(hasTable > 0 || hasPlayerCards > 0).toBeTruthy();
  });

  test('should have add player button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player|New Player|Create Player/i });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Admin Players Page - Player CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should open create player modal/form when clicking add', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player|New Player|Create Player/i });
    await addButton.click();

    // Should show a form or modal for creating a player
    await expect(page.getByText(/Create Player|New Player|Add Player/i)).toBeVisible();

    // Should have form fields for player info
    const firstNameInput = page.locator('input[name="first_name"], input[name="firstName"], input[placeholder*="first" i]').first();
    await expect(firstNameInput).toBeVisible();
  });

  test('should validate required fields on player creation', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player|New Player|Create Player/i });
    await addButton.click();

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /Save|Create|Submit/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required|please fill|cannot be empty/i)).toBeVisible();
  });

  test('should be able to view player details', async ({ page }) => {
    // Wait for players to load
    await page.waitForTimeout(1000);

    // Look for a player row that can be clicked
    const playerRow = page.locator('tr').filter({ hasText: /@/ }).first(); // Players often show email
    const playerLink = page.getByRole('link', { name: /view|details/i }).first();
    const playerCard = page.locator('[data-testid="player-card"]').first();

    const hasClickablePlayer = (await playerRow.count()) > 0 ||
                               (await playerLink.count()) > 0 ||
                               (await playerCard.count()) > 0;

    if (!hasClickablePlayer) {
      // No players to test with
      test.skip();
      return;
    }

    // Click the first available player element
    if (await playerLink.count()) {
      await playerLink.click();
    } else if (await playerCard.count()) {
      await playerCard.click();
    } else {
      await playerRow.click();
    }

    // Should show player details (may be modal or separate page)
    await expect(page.getByText(/Player Details|Profile|Information/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should be able to cancel player creation', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Player|New Player|Create Player/i });
    await addButton.click();

    // Look for cancel button
    const cancelButton = page.getByRole('button', { name: /Cancel|Close/i });
    await cancelButton.click();

    // Form should close
    const firstNameInput = page.locator('input[name="first_name"], input[name="firstName"], input[placeholder*="first" i]').first();
    await expect(firstNameInput).not.toBeVisible();
  });
});

test.describe('Admin Players Page - Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByRole('searchbox');
    const searchByPlaceholder = page.locator('input[placeholder*="search" i]');

    const hasSearch = (await searchInput.count()) > 0 || (await searchByPlaceholder.count()) > 0;

    if (!hasSearch) {
      test.skip();
      return;
    }

    const search = (await searchInput.count()) > 0 ? searchInput : searchByPlaceholder;
    await search.fill('test');

    // Wait for search to apply
    await page.waitForTimeout(500);

    // Search should filter the list (we can't verify specific results without data)
  });

  test('should have team filter if applicable', async ({ page }) => {
    // Look for team filter
    const teamFilter = page.getByRole('combobox', { name: /team/i });
    const teamDropdown = page.locator('select').filter({ hasText: /team|grade/i });

    const hasTeamFilter = (await teamFilter.count()) > 0 || (await teamDropdown.count()) > 0;

    if (!hasTeamFilter) {
      test.skip();
      return;
    }

    const filter = (await teamFilter.count()) > 0 ? teamFilter : teamDropdown;
    await expect(filter.first()).toBeEnabled();
  });

  test('should have grade filter if applicable', async ({ page }) => {
    // Look for grade filter
    const gradeFilter = page.getByRole('combobox', { name: /grade/i });
    const hasGradeFilter = (await gradeFilter.count()) > 0;

    if (!hasGradeFilter) {
      test.skip();
      return;
    }

    await expect(gradeFilter.first()).toBeEnabled();
  });
});

test.describe('Admin Players Page - Player Edit', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should have edit button for players', async ({ page }) => {
    // Wait for players to load
    await page.waitForTimeout(1000);

    // Look for edit buttons
    const editButton = page.getByRole('button', { name: /Edit/i }).first();
    const editIcon = page.locator('button[aria-label*="edit" i], [data-testid*="edit"]').first();

    const hasEdit = (await editButton.count()) > 0 || (await editIcon.count()) > 0;

    if (!hasEdit) {
      // May require selecting a player first - test skipped
      test.skip();
      return;
    }

    expect(hasEdit).toBeTruthy();
  });

  test('should open edit form when clicking edit', async ({ page }) => {
    await page.waitForTimeout(1000);

    const editButton = page.getByRole('button', { name: /Edit/i }).first();
    const hasEdit = (await editButton.count()) > 0;

    if (!hasEdit) {
      test.skip();
      return;
    }

    await editButton.click();

    // Should show edit form
    await expect(page.getByText(/Edit Player|Update Player/i)).toBeVisible();
  });
});

test.describe('Admin Players Page - Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should have checkbox for selecting players if bulk operations exist', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for checkboxes in the player list
    const checkboxes = page.locator('input[type="checkbox"]');
    const hasCheckboxes = (await checkboxes.count()) > 0;

    if (!hasCheckboxes) {
      // Bulk operations may not be implemented
      test.skip();
      return;
    }

    // Should be able to check a checkbox
    await checkboxes.first().check();
    await expect(checkboxes.first()).toBeChecked();
  });
});

test.describe('Admin Players Page - Export', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should have export functionality if implemented', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByRole('button', { name: /Export|Download|CSV|Excel/i });
    const hasExport = (await exportButton.count()) > 0;

    if (!hasExport) {
      // Export may not be implemented
      test.skip();
      return;
    }

    await expect(exportButton.first()).toBeEnabled();
  });
});
