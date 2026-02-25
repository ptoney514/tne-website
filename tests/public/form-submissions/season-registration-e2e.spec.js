// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Season Registration E2E Test
 *
 * Submits a real season registration (Braxton Simmons) via the UI
 * and verifies it appears in the admin registrations page.
 *
 * This test hits the real /api/register endpoint (no mocking).
 * Turnstile uses the always-pass test key in local dev.
 */

const PLAYER = {
  firstName: 'Braxton',
  lastName: 'Simmons',
  dob: '2015-08-17',
  grade: '4',
  gender: 'male',
  lastTeam: 'Bellevue West T-Birds',
};

const PARENT = {
  firstName: 'Jake',
  lastName: 'Simmons',
  email: 'Jt.simmons15@gmail.com',
  phone: '(619) 630-6130',
  homePhone: '(619) 630-6130',
  relationship: 'father',
  street: '123 Halleck Park Dr',
  city: 'Papillion',
  state: 'NE',
  zip: '68046',
};

const PARENT2 = {
  name: 'Shannon Simmons',
  phone: '(815) 243-7360',
  email: 'Shannon.simmons2617@gmail.com',
};

const EMERGENCY = {
  name: 'Shannon Simmons',
  phone: '(815) 243-7360',
};

test.describe('Season Registration E2E — Braxton Simmons', () => {
  test('should submit season registration and verify in admin', async ({ page }) => {
    // Clear any saved registration draft
    await page.goto('/register');
    await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));

    // ── Wait for the registration form to load (not show "closed") ──
    // The loading fix ensures we see the form, not the closed message
    await page.waitForSelector('h1', { timeout: 15000 });

    // Wait for either the type selector or auto-redirect to season form
    // (if only tryouts is open, it auto-selects season)
    await expect(
      page.getByText('Register for a Season').or(page.getByText('Register for Season'))
    ).toBeVisible({ timeout: 15000 });

    // Click "Register for a Season" if the type selector is showing
    const seasonCard = page.getByText('Register for a Season');
    if (await seasonCard.isVisible().catch(() => false)) {
      await seasonCard.click();
    }

    // ── STEP 1: Player & Season ──
    // Season should be auto-populated (single season in config)
    await expect(page.locator('input#playerFirstName')).toBeVisible({ timeout: 10000 });

    await page.locator('input#playerFirstName').fill(PLAYER.firstName);
    await page.locator('input#playerLastName').fill(PLAYER.lastName);
    await page.locator('input#playerDob').fill(PLAYER.dob);
    await page.locator('select#playerGrade').selectOption(PLAYER.grade);
    await page.locator(`input[name="playerGender"][value="${PLAYER.gender}"]`).check();
    await page.locator('input#lastTeamPlayedFor').fill(PLAYER.lastTeam);

    // Click Continue to step 2
    await page.getByRole('button', { name: /Continue/i }).click();

    // ── STEP 2: Parent/Guardian ──
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    await page.locator('input#parentFirstName').fill(PARENT.firstName);
    await page.locator('input#parentLastName').fill(PARENT.lastName);
    await page.locator('input#parentEmail').fill(PARENT.email);
    await page.locator('input#parentPhone').fill(PARENT.phone);
    await page.locator('input#parentHomePhone').fill(PARENT.homePhone);
    await page.locator('select#relationship').selectOption(PARENT.relationship);

    await page.locator('input#addressStreet').fill(PARENT.street);
    await page.locator('input#addressCity').fill(PARENT.city);
    await page.locator('select#addressState').selectOption(PARENT.state);
    await page.locator('input#addressZip').fill(PARENT.zip);

    // Parent 2 (optional)
    await page.locator('input#parent2Name').fill(PARENT2.name);
    await page.locator('input#parent2Phone').fill(PARENT2.phone);
    await page.locator('input#parent2Email').fill(PARENT2.email);

    // Emergency contact
    await page.locator('input#emergencyName').fill(EMERGENCY.name);
    await page.locator('input#emergencyPhone').fill(EMERGENCY.phone);

    // Click Continue to step 3
    await page.getByRole('button', { name: /Continue/i }).click();

    // ── STEP 3: Review & Confirm ──
    await expect(page.getByText('Review & Confirm')).toBeVisible({ timeout: 5000 });

    // Verify player name is shown in review
    await expect(page.getByText(`${PLAYER.firstName} ${PLAYER.lastName}`)).toBeVisible();

    // Check all 3 waiver checkboxes (Liability, Medical, Media)
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // Wait for Turnstile to complete (uses test key that always passes)
    await expect(page.getByText('Verification complete')).toBeVisible({ timeout: 15000 });

    // Click "Submit Registration"
    const submitButton = page.getByRole('button', { name: /Submit Registration/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // ── SUCCESS SCREEN ──
    // Season success shows "You're Registered for ..."
    await expect(
      page.getByText(/You're Registered/i).or(page.getByText(/registered/i))
    ).toBeVisible({ timeout: 15000 });

    // Capture reference ID
    const refIdElement = page.locator('.font-mono.font-bold');
    const referenceId = await refIdElement.textContent();
    console.log(`Season registration submitted — Reference ID: ${referenceId}`);
    expect(referenceId).toBeTruthy();

    // ── ADMIN VERIFICATION ──
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      console.log('Skipping admin verification — TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD not set');
      return;
    }

    // Log in as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In|Log In/i }).click();

    // Wait for redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    // Navigate to registrations
    await page.goto('/admin/registrations');
    await page.waitForLoadState('networkidle');

    // Search for Braxton Simmons
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('Braxton Simmons');

    // Verify the registration is visible
    await expect(
      page.getByText('Braxton Simmons', { exact: false })
    ).toBeVisible({ timeout: 10000 });

    console.log('Admin verification passed — Braxton Simmons registration found');
  });
});
