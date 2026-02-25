// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Season Registration Flow E2E Tests
 *
 * Tests the season registration path (Player -> Contact -> Review & Confirm)
 * which is available when `tryouts.is_open` is true in config.json.
 *
 * Season registration is a 3-step flow with no payment step.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to registration page and select "Season" path.
 * Clears any saved draft first to avoid stale state.
 */
async function selectSeasonRegistration(page) {
  await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
  // Wait for loading spinner to disappear and content to render
  await page.waitForFunction(
    () => !document.body.textContent.includes('Loading registration options'),
    { timeout: 15000 },
  );

  const typeSelector = page.getByText('How would you like to register?');
  const isSelectorVisible = await typeSelector.isVisible().catch(() => false);

  if (isSelectorVisible) {
    await page.getByText('Register for a Season').click();
    // Wait for season wizard to load (playerFirstName input appears on step 1)
    await page.waitForSelector('#playerFirstName', { timeout: 10000 });
  }
}

/**
 * Fill season registration Step 1 — Player & Season info.
 */
async function fillSeasonStep1(page, data = {}) {
  await page.locator('input#playerFirstName').fill(data.playerFirstName || 'John');
  await page.locator('input#playerLastName').fill(data.playerLastName || 'Smith');
  await page.locator('input#playerDob').fill(data.playerDob || '2015-03-15');
  await page.locator('select#playerGrade').selectOption(data.playerGrade || '5');
  await page.locator(`input[name="playerGender"][value="${data.playerGender || 'male'}"]`).check();
  if (data.position) {
    await page.locator('select#position').selectOption(data.position);
  }
  await page.locator('input#lastTeamPlayedFor').fill(data.lastTeamPlayedFor || 'Omaha Stars');
}

/**
 * Fill season registration Step 2 — Parent/Guardian & Contact info.
 * This step is shared with the team registration flow.
 */
async function fillSeasonStep2(page, data = {}) {
  await page.locator('input#parentFirstName').fill(data.parentFirstName || 'Jane');
  await page.locator('input#parentLastName').fill(data.parentLastName || 'Smith');
  await page.locator('input#parentEmail').fill(data.parentEmail || 'jane.smith@example.com');
  await page.locator('input#parentPhone').fill(data.parentPhone || '4025551234');
  await page.locator('input#parentHomePhone').fill(data.parentHomePhone || '4025559876');
  await page.locator('select#relationship').selectOption(data.relationship || 'mother');
  await page.locator('input#addressStreet').fill(data.addressStreet || '123 Main St');
  await page.locator('input#addressCity').fill(data.addressCity || 'Omaha');
  await page.locator('select#addressState').selectOption(data.addressState || 'NE');
  await page.locator('input#addressZip').fill(data.addressZip || '68114');
  await page.locator('input#emergencyName').fill(data.emergencyName || 'Bob Smith');
  await page.locator('input#emergencyPhone').fill(data.emergencyPhone || '4025559999');
}

/**
 * Navigate through Steps 1 and 2 and land on the Review & Confirm step (Step 3).
 */
async function navigateToReviewStep(page, step1Data = {}, step2Data = {}) {
  await fillSeasonStep1(page, step1Data);
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

  await fillSeasonStep2(page, step2Data);
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible({ timeout: 5000 });
}

// ---------------------------------------------------------------------------
// 1. Type Selector Tests
// ---------------------------------------------------------------------------

test.describe('Season Registration - Type Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display type selector when both paths are open', async ({ page }) => {
    await expect(page.getByText('How would you like to register?')).toBeVisible();
    await expect(page.getByText('Register for a Season')).toBeVisible();
    await expect(page.getByText('Register for a Team')).toBeVisible();
  });

  test('should show season card with tryout label', async ({ page }) => {
    await expect(page.getByText('Register for a Season')).toBeVisible();
    await expect(page.getByText('Sign up for tryouts for an upcoming season. No payment required.')).toBeVisible();
    // Tryouts label badge (e.g. "Spring 2026 Tryouts")
    await expect(page.getByText('Spring 2026 Tryouts')).toBeVisible();
  });

  test('should show team card with current teams label', async ({ page }) => {
    await expect(page.getByText('Register for a Team')).toBeVisible();
    await expect(page.getByText(/Already placed on a team/)).toBeVisible();
    await expect(page.getByText('Current teams')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Season Registration Flow — Step 1 (Player & Season)
// ---------------------------------------------------------------------------

test.describe('Season Registration - Step 1: Player & Season', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectSeasonRegistration(page);
  });

  test('should display season registration form with correct fields', async ({ page }) => {
    // "Register for Season" heading
    await expect(page.getByRole('heading', { name: 'Register for Season' })).toBeVisible();

    // Season should be shown as read-only text (single season auto-selected)
    await expect(page.getByText('Spring 2026')).toBeVisible();

    // Player info fields
    await expect(page.locator('input#playerFirstName')).toBeVisible();
    await expect(page.locator('input#playerLastName')).toBeVisible();
    await expect(page.locator('input#playerDob')).toBeVisible();
    await expect(page.locator('select#playerGrade')).toBeVisible();
    await expect(page.locator('input[name="playerGender"][value="male"]')).toBeVisible();
    await expect(page.locator('input[name="playerGender"][value="female"]')).toBeVisible();
    await expect(page.locator('select#position')).toBeVisible();
    await expect(page.locator('input#lastTeamPlayedFor')).toBeVisible();

    // These team-specific fields should NOT be present
    await expect(page.locator('select#teamId')).not.toBeVisible();
    await expect(page.locator('select#jerseySize')).not.toBeVisible();
    await expect(page.locator('input#desiredJerseyNumber')).not.toBeVisible();

    // Continue button
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should show 3-step indicator', async ({ page }) => {
    // On mobile viewports the step indicator shows "Step X of Y"
    // On desktop it shows step circles. We check the mobile text since
    // it exists in DOM for all viewports (hidden via CSS on sm+).
    // The desktop version shows 3 numbered circles.
    // Check that 3 step progress bars exist (season has 3 steps)
    const stepBars = page.locator('.sm\\:hidden .flex.gap-1\\.5 > div');
    await expect(stepBars).toHaveCount(3);
  });

  test('should validate required fields when Continue is clicked without filling', async ({ page }) => {
    // Clear any pre-filled data
    await page.locator('input#playerFirstName').fill('');
    await page.locator('input#playerLastName').fill('');
    await page.locator('input#lastTeamPlayedFor').fill('');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation errors for required fields
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
  });

  test('should have correct grade options (3rd-8th)', async ({ page }) => {
    const gradeSelect = page.locator('select#playerGrade');
    const optionCount = await gradeSelect.locator('option').count();
    // placeholder "Select grade" + 6 grades (3rd through 8th)
    expect(optionCount).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// 3. Season Registration Flow — Full E2E
// ---------------------------------------------------------------------------

test.describe('Season Registration - Full E2E Flow', () => {
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectSeasonRegistration(page);
  });

  test('should complete Step 1 and navigate to Step 2', async ({ page }) => {
    await fillSeasonStep1(page);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify Step 2 loaded
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Emergency Contact' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
  });

  test('should complete all 3 steps and reach review', async ({ page }) => {
    await navigateToReviewStep(page);

    // Verify review content
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible();

    // Player summary card should show entered data
    await expect(page.getByText('John Smith')).toBeVisible();
    // Parent summary card
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('jane.smith@example.com')).toBeVisible();
  });

  test('should show fee preview with no payment due messaging on review', async ({ page }) => {
    await navigateToReviewStep(page);

    // Blue "Fee Preview (No Payment Due)" box
    await expect(page.getByText('Fee Preview (No Payment Due)')).toBeVisible();
    await expect(page.getByText('Once your player is placed on a team, the following fees will apply')).toBeVisible();

    // Fee amounts
    await expect(page.getByText('$450').first()).toBeVisible();
    await expect(page.getByText('$1,400').first()).toBeVisible();
  });

  test('should show only 3 waivers (no Payment Terms)', async ({ page }) => {
    await navigateToReviewStep(page);

    // These 3 waivers should be visible
    await expect(page.getByText('Liability Waiver')).toBeVisible();
    await expect(page.getByText('Medical Authorization')).toBeVisible();
    await expect(page.getByText('Photo/Video Release')).toBeVisible();

    // Payment Terms should NOT be visible in season mode
    await expect(page.getByText('Payment Terms')).not.toBeVisible();
  });

  test('should have disabled submit until waivers are accepted', async ({ page }) => {
    // Mock Turnstile so the token requirement doesn't block us
    await page.addInitScript(() => {
      window.turnstile = {
        render: (container, options) => {
          setTimeout(() => {
            if (options.callback) {
              options.callback('mock-turnstile-token');
            }
          }, 100);
          return 'mock-widget-id';
        },
        reset: () => {},
        remove: () => {},
      };
    });

    // Need to reload after addInitScript
    await page.goto('/register');
    await selectSeasonRegistration(page);
    await navigateToReviewStep(page);

    const submitButton = page.getByRole('button', { name: /Submit Registration/i });

    // Should be disabled initially (no waivers checked yet, even with Turnstile mocked)
    await expect(submitButton).toBeDisabled();

    // Check all 3 waivers
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBe(3); // Only 3 waivers for season registration

    await checkboxes.nth(0).check(); // Liability
    await checkboxes.nth(1).check(); // Medical
    await checkboxes.nth(2).check(); // Photo/Video

    // Wait a bit for Turnstile mock to fire its callback
    await page.waitForTimeout(300);

    // Now the submit button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate back from Step 2 and preserve data', async ({ page }) => {
    await fillSeasonStep1(page, { playerFirstName: 'TestFirst', playerLastName: 'TestLast' });
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Go back
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    // Data should be preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue('TestFirst');
    await expect(page.locator('input#playerLastName')).toHaveValue('TestLast');
  });

  test('should navigate back from Step 3 and preserve data', async ({ page }) => {
    await navigateToReviewStep(page);

    // Go back to Step 2
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Verify Step 2 data preserved
    await expect(page.locator('input#parentFirstName')).toHaveValue('Jane');
    await expect(page.locator('input#parentEmail')).toHaveValue('jane.smith@example.com');

    // Go back to Step 1
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    // Verify Step 1 data preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue('John');
    await expect(page.locator('input#playerLastName')).toHaveValue('Smith');
  });
});

// ---------------------------------------------------------------------------
// 4. Season Registration — Success Screen (with API mock)
// ---------------------------------------------------------------------------

test.describe('Season Registration - Success Screen', () => {
  test('should show season success screen after submission', async ({ page }) => {
    // Mock Turnstile widget
    await page.addInitScript(() => {
      window.turnstile = {
        render: (container, options) => {
          setTimeout(() => {
            if (options.callback) {
              options.callback('mock-turnstile-token');
            }
          }, 100);
          return 'mock-widget-id';
        },
        reset: () => {},
        remove: () => {},
      };
    });

    // Mock the registration API endpoint
    await page.route('**/api/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          referenceId: `TNE-2026-TEST`,
          message: 'Registration submitted successfully',
        }),
      });
    });

    await page.goto('/register');
    await selectSeasonRegistration(page);
    await navigateToReviewStep(page);

    // Check all waivers
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // Wait for Turnstile mock callback to fire
    await page.waitForTimeout(300);

    // Submit
    const submitButton = page.getByRole('button', { name: /Submit Registration/i });
    await expect(submitButton).toBeEnabled({ timeout: 3000 });
    await submitButton.click();

    // Verify success screen
    await expect(page.getByText(/You're Registered for/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Spring 2026')).toBeVisible();

    // Reference ID should be visible
    await expect(page.getByText('Reference ID')).toBeVisible();

    // "What's Next" box
    await expect(page.getByText("What's Next")).toBeVisible();
    await expect(page.getByText(/Watch for tryout dates/i)).toBeVisible();

    // Action buttons
    await expect(page.getByRole('link', { name: /View Tryout Info/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Register Another Player/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Season Registration — Sidebar
// ---------------------------------------------------------------------------

test.describe('Season Registration - Sidebar', () => {
  test('should show season fee preview sidebar when in season mode', async ({ page }) => {
    await page.goto('/register');
    await selectSeasonRegistration(page);

    // Sidebar should show "Season Fee Preview" header
    await expect(page.getByText('Season Fee Preview')).toBeVisible();

    // Fee breakdown
    await expect(page.getByText('3rd-8th Girls')).toBeVisible();
    await expect(page.getByText('3rd-8th Boys')).toBeVisible();
    await expect(page.getByText('Jr 3SSB')).toBeVisible();

    // Footer text
    await expect(
      page.getByText('No payment due until team placement. Fees apply after tryouts.')
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Season Registration — Mobile
// ---------------------------------------------------------------------------

test.describe('Season Registration - Mobile', () => {
  test('should show correct mobile step indicator for season flow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/register');
    await selectSeasonRegistration(page);

    // Mobile step indicator should show "Step 1 of 3"
    await expect(page.getByText(/Step 1 of 3/i)).toBeVisible();

    // Fill step 1 and advance
    await fillSeasonStep1(page);
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Should now show "Step 2 of 3"
    await expect(page.getByText(/Step 2 of 3/i)).toBeVisible();
  });
});
