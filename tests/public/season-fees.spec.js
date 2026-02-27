// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Season Fees E2E Tests
 *
 * Uses Playwright route mocking to control API responses (avoids DB dependency).
 * Tests that the registration page correctly displays dynamic fee data from the
 * season fees API in both the sidebar and review step.
 */

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SEASON_ID = '11111111-1111-1111-1111-111111111111';

const MOCK_SEASONS = [
  {
    id: MOCK_SEASON_ID,
    name: 'Spring 2026',
    start_date: '2026-03-01',
    end_date: '2026-07-31',
    is_active: true,
    tryouts_open: true,
    tryouts_label: 'Spring 2026 Tryouts',
    registration_open: true,
    registration_label: 'Spring 2026',
  },
];

const MOCK_FEES = [
  {
    id: 'fee-1',
    season_id: MOCK_SEASON_ID,
    name: '3rd-8th Girls',
    description: null,
    amount: '450.00',
    currency: 'USD',
    display_order: 1,
  },
  {
    id: 'fee-2',
    season_id: MOCK_SEASON_ID,
    name: '3rd-8th Boys',
    description: null,
    amount: '450.00',
    currency: 'USD',
    display_order: 2,
  },
  {
    id: 'fee-3',
    season_id: MOCK_SEASON_ID,
    name: '5th-8th Boys Jr 3SSB',
    description: null,
    amount: '1400.00',
    currency: 'USD',
    display_order: 3,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set up route mocks for seasons and fees APIs */
async function mockAPIs(page, { fees = MOCK_FEES, seasonsResponse = MOCK_SEASONS } = {}) {
  // Mock the public seasons API
  await page.route('**/api/public/seasons**', async (route) => {
    if (route.request().url().includes('/fees')) {
      return route.fallback();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(seasonsResponse),
    });
  });

  // Mock the fees API for any season ID
  await page.route('**/api/public/seasons/*/fees', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fees),
    });
  });
}

/** Navigate to registration and select season path */
async function selectSeasonRegistration(page) {
  await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
  await page.waitForFunction(
    () => !document.body.textContent.includes('Loading registration options'),
    { timeout: 15000 },
  );

  const typeSelector = page.getByText('How would you like to register?');
  const isSelectorVisible = await typeSelector.isVisible().catch(() => false);

  if (isSelectorVisible) {
    await page.getByText('Register for a Season').click();
    await page.waitForSelector('#playerFirstName', { timeout: 10000 });
  }
}

/** Fill season Step 1 */
async function fillSeasonStep1(page) {
  await page.locator('input#playerFirstName').fill('Test');
  await page.locator('input#playerLastName').fill('Player');
  await page.locator('input#playerDob').fill('2015-03-15');
  await page.locator('select#playerGrade').selectOption('5');
  await page.locator('input[name="playerGender"][value="male"]').check();
  await page.locator('input#lastTeamPlayedFor').fill('Test Team');
}

/** Fill season Step 2 */
async function fillSeasonStep2(page) {
  await page.locator('input#parentFirstName').fill('Test');
  await page.locator('input#parentLastName').fill('Parent');
  await page.locator('input#parentEmail').fill('test@example.com');
  await page.locator('input#parentPhone').fill('4025551234');
  await page.locator('input#parentHomePhone').fill('4025559876');
  await page.locator('select#relationship').selectOption('mother');
  await page.locator('input#addressStreet').fill('123 Main St');
  await page.locator('input#addressCity').fill('Omaha');
  await page.locator('select#addressState').selectOption('NE');
  await page.locator('input#addressZip').fill('68114');
  await page.locator('input#emergencyName').fill('Emergency Contact');
  await page.locator('input#emergencyPhone').fill('4025559999');
}

/** Navigate to the review step (step 3) */
async function navigateToReviewStep(page) {
  await fillSeasonStep1(page);
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

  await fillSeasonStep2(page);
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible({ timeout: 5000 });
}

// ---------------------------------------------------------------------------
// 1. Sidebar Fee Display
// ---------------------------------------------------------------------------

test.describe('Season Fees - Sidebar', () => {
  test('should display fees from API in sidebar', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/register');
    await selectSeasonRegistration(page);

    // Sidebar should show "Season Fee Preview" header
    await expect(page.getByText('Season Fee Preview')).toBeVisible();

    // Fee names from mock data
    await expect(page.getByText('3rd-8th Girls')).toBeVisible();
    await expect(page.getByText('3rd-8th Boys')).toBeVisible();
    await expect(page.getByText('5th-8th Boys Jr 3SSB')).toBeVisible();

    // Fee amounts
    await expect(page.getByText('$450').first()).toBeVisible();
    await expect(page.getByText('$1,400')).toBeVisible();

    // Footer
    await expect(
      page.getByText('No payment due until team placement. Fees apply after tryouts.')
    ).toBeVisible();
  });

  test('should show fallback message when no fees are configured', async ({ page }) => {
    await mockAPIs(page, { fees: [] });
    await page.goto('/register');
    await selectSeasonRegistration(page);

    await expect(page.getByText('Season Fee Preview')).toBeVisible();
    await expect(
      page.getByText('Payment information will be updated soon.')
    ).toBeVisible();
  });

  test('should show fallback on API error (no crash)', async ({ page }) => {
    // Mock seasons normally but make fees API return 500
    await page.route('**/api/public/seasons', async (route) => {
      if (route.request().url().includes('/fees')) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SEASONS),
      });
    });
    await page.route('**/api/public/seasons/*/fees', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/register');
    await selectSeasonRegistration(page);

    // Should show fallback, not crash
    await expect(page.getByText('Season Fee Preview')).toBeVisible();
    await expect(
      page.getByText('Payment information will be updated soon.')
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Review Step Fee Display
// ---------------------------------------------------------------------------

test.describe('Season Fees - Review Step', () => {
  test.setTimeout(60000);

  test('should display dynamic fees in review step', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/register');
    await selectSeasonRegistration(page);
    await navigateToReviewStep(page);

    // Blue fee preview box
    await expect(page.getByText('Fee Preview (No Payment Due)')).toBeVisible();
    await expect(
      page.getByText('Once your player is placed on a team, the following fees will apply')
    ).toBeVisible();

    // Dynamic fee rows from mock data
    const feePreview = page.locator('.rounded-xl.bg-blue-50');
    await expect(feePreview.getByText('3rd-8th Girls')).toBeVisible();
    await expect(feePreview.getByText('3rd-8th Boys')).toBeVisible();
    await expect(feePreview.getByText('5th-8th Boys Jr 3SSB')).toBeVisible();
    await expect(feePreview.getByText('$450').first()).toBeVisible();
    await expect(feePreview.getByText('$1,400')).toBeVisible();
  });

  test('should show fallback in review step when no fees configured', async ({ page }) => {
    await mockAPIs(page, { fees: [] });
    await page.goto('/register');
    await selectSeasonRegistration(page);
    await navigateToReviewStep(page);

    // Scope to the review step's blue info box (sidebar also shows fallback)
    const feePreview = page.locator('.rounded-xl.bg-blue-50');
    await expect(feePreview.getByText('Fee Preview (No Payment Due)')).toBeVisible();
    await expect(
      feePreview.getByText('Payment information will be updated soon.')
    ).toBeVisible();
  });

  test('should show fallback in review step on API error', async ({ page }) => {
    // Mock seasons normally but make fees API return 500
    await page.route('**/api/public/seasons**', async (route) => {
      if (route.request().url().includes('/fees')) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SEASONS),
      });
    });
    await page.route('**/api/public/seasons/*/fees', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/register');
    await selectSeasonRegistration(page);
    await navigateToReviewStep(page);

    // Scope to the review step's blue info box (sidebar also shows fallback)
    const feePreview = page.locator('.rounded-xl.bg-blue-50');
    await expect(feePreview.getByText('Fee Preview (No Payment Due)')).toBeVisible();
    await expect(
      feePreview.getByText('Payment information will be updated soon.')
    ).toBeVisible();
  });
});
