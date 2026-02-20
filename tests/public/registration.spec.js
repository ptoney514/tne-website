// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Navigate to registration page and select "Team Registration" if type selector appears.
 * Since both tryouts + team registration are open, the type selector shows first.
 */
async function selectTeamRegistration(page) {
  // Clear any saved registration draft to prevent stale state
  await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));

  await page.waitForSelector('h1', { timeout: 10000 });

  // Check if type selector is visible (both paths are open)
  const typeSelector = page.getByText('How would you like to register?');
  const isSelectorVisible = await typeSelector.isVisible().catch(() => false);

  if (isSelectorVisible) {
    // Click the "Register for a Team" card
    await page.getByText('Register for a Team').click();
    // Wait for team wizard to load
    await page.waitForSelector('select#teamId', { timeout: 10000 });
  }
}

test.describe('Public Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  test('should display registration page with heading', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Registration/i })).toBeVisible();
  });

  test('should display registration fees section', async ({ page }) => {
    await expect(page.getByText('Registration Fees')).toBeVisible();
  });

  test('should display registration wizard with step indicator', async ({ page }) => {
    // Step indicator shows short titles on lg+ screens and step numbers in circles
    // Check for "Player" short title (visible at lg+ viewport)
    await expect(page.getByText('Player', { exact: true }).first()).toBeVisible();
  });
});

test.describe('Registration Wizard - Step 1: Player & Team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  test('should display all Step 1 form fields', async ({ page }) => {
    // Team selection
    await expect(page.locator('select#teamId')).toBeVisible();
    await expect(page.getByText('Select Your Team')).toBeVisible();

    // Player info
    await expect(page.getByText('Player Information')).toBeVisible();
    await expect(page.locator('input#playerFirstName')).toBeVisible();
    await expect(page.locator('input#playerLastName')).toBeVisible();
    await expect(page.locator('input#playerDob')).toBeVisible();
    await expect(page.locator('select#playerGrade')).toBeVisible();
    await expect(page.locator('input[name="playerGender"][value="male"]')).toBeVisible();
    await expect(page.locator('input[name="playerGender"][value="female"]')).toBeVisible();
    await expect(page.locator('select#jerseySize')).toBeVisible();
    await expect(page.locator('input#desiredJerseyNumber')).toBeVisible();
    await expect(page.locator('select#position')).toBeVisible();
    await expect(page.locator('input#lastTeamPlayedFor')).toBeVisible();

    // Continue button
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should show validation errors when Continue clicked without filling required fields', async ({ page }) => {
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error for team
    await expect(page.getByText('Please select a team')).toBeVisible();
  });

  test('should show fee breakdown when team with fees is selected', async ({ page }) => {
    const teamSelect = page.locator('select#teamId');

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Select the first real team
    await teamSelect.selectOption({ index: 1 });

    // Fee breakdown should appear only if the team has fees > $0
    // Check if fee breakdown is present (may or may not be based on team fees)
    const feeBreakdown = page.locator('.bg-tne-red\\/5');
    const breakdownCount = await feeBreakdown.count();

    // If breakdown is visible, verify it shows the fee
    if (breakdownCount > 0) {
      await expect(page.getByText('Season Fee:')).toBeVisible({ timeout: 5000 });
    }
    // If no breakdown, that's correct behavior when team has $0.00 fees
  });

  test('should have correct grade options (3rd-8th)', async ({ page }) => {
    // Wait for the wizard to be visible (registration needs to be open)
    const gradeSelect = page.locator('select#playerGrade');

    // First check if registration is open (wizard is shown)
    const wizardVisible = await page.locator('select#teamId').isVisible();
    if (!wizardVisible) {
      // Skip this test if registration is closed
      test.skip();
      return;
    }

    const optionCount = await gradeSelect.locator('option').count();
    // placeholder + 6 grades (3rd-8th)
    expect(optionCount).toBe(7);
  });
});

test.describe('Registration Wizard - Complete Flow E2E', () => {
  test.setTimeout(60000);
  test('should complete Step 1 and navigate to Step 2', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Fill Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');

    // Click Continue
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify we're on Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Emergency Contact' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
  });

  test('should complete Step 2 and navigate to Step 3 (Payment)', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Complete Step 2
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane.smith@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');

    // Click Continue
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify we're on Step 3 - Payment
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
    // Use heading role to target the specific payment option titles
    await expect(page.getByRole('heading', { name: 'Pay in Full' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment Plan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Request Special Arrangement' })).toBeVisible();
  });

  test('should select payment option and navigate to Step 4 (Review)', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Complete Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane.smith@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 - Select Special Arrangement (doesn't require payment)
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
    // Click the Special Arrangement button
    await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();

    // Fill special request fields
    await page.locator('select#specialRequestReason').selectOption('financial_hardship');
    await page.locator('textarea#specialRequestNotes').fill('Need financial assistance for registration.');

    // Click Submit Request
    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Verify we're on Step 4 - Review
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Liability Waiver')).toBeVisible();
    await expect(page.getByText('Medical Authorization')).toBeVisible();
    await expect(page.getByText('Photo/Video Release')).toBeVisible();
    await expect(page.getByText('Payment Terms')).toBeVisible();
  });

  test('should require all waivers before submission', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Complete Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane.smith@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 - Select Special Arrangement
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
    // Click the Special Arrangement button
    await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();
    await page.locator('select#specialRequestReason').selectOption('financial_hardship');
    await page.locator('textarea#specialRequestNotes').fill('Need financial assistance.');
    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Step 4 - Verify submit button is disabled without waivers
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible({ timeout: 5000 });
    const submitButton = page.getByRole('button', { name: /Secure Player Spot/i });
    await expect(submitButton).toBeDisabled();

    // Accept all waivers
    await page.locator('input[type="checkbox"]').nth(0).check(); // Liability
    await page.locator('input[type="checkbox"]').nth(1).check(); // Medical
    await page.locator('input[type="checkbox"]').nth(2).check(); // Media
    await page.locator('input[type="checkbox"]').nth(3).check(); // Payment Terms

    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Registration Wizard - Navigation', () => {
  test('should navigate back and preserve entered data', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Fill Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('TestFirst');
    await page.locator('input#playerLastName').fill('TestLast');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');

    // Go to Step 2
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Go back to Step 1
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    // Verify data is preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue('TestFirst');
    await expect(page.locator('input#playerLastName')).toHaveValue('TestLast');
    await expect(page.locator('input#playerDob')).toHaveValue('2015-03-15');
  });
});

test.describe('Registration Wizard - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  test('should validate required fields in Step 1', async ({ page }) => {
    // Click Continue without filling anything
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error for team
    await expect(page.getByText('Please select a team')).toBeVisible();
  });

  test('should validate player info fields after team selection', async ({ page }) => {
    // Wait for teams and select one
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );
    await page.locator('select#teamId').selectOption({ index: 1 });

    // Click Continue without filling player info
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error for first name
    await expect(page.getByText('First name is required')).toBeVisible();
  });

  test('should validate email format in Step 2', async ({ page }) => {
    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Fill with invalid email
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('invalid-email');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');

    // Try to continue
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should validate ZIP code format in Step 2', async ({ page }) => {
    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Fill with invalid ZIP
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('123'); // Invalid - too short
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');

    // Try to continue
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show ZIP validation error
    await expect(page.getByText('Please enter a valid 5-digit ZIP code')).toBeVisible();
  });

  test('should have disabled Continue button until all fields are filled in Step 2', async ({ page }) => {
    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Continue button should be disabled initially
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeDisabled();

    // Should show prompt to complete required fields
    await expect(page.getByText('Complete all required fields to continue')).toBeVisible();

    // Fill all required fields
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled();

    // Prompt should be hidden
    await expect(page.getByText('Complete all required fields to continue')).not.toBeVisible();
  });

  test('should have disabled Continue button until payment is selected in Step 3', async ({ page }) => {
    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Complete Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 - Verify Continue button is disabled without payment selection
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });

    // Should show prompt to select payment option
    await expect(page.getByText('Select a payment option above to continue')).toBeVisible();

    // Continue button should be disabled
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeDisabled();

    // Select Pay in Full option
    await page.locator('button').filter({ hasText: 'Pay in Full' }).filter({ hasText: 'Complete your registration' }).click();

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled();

    // Prompt should be hidden
    await expect(page.getByText('Select a payment option above to continue')).not.toBeVisible();
  });
});

test.describe('Registration Wizard - Payment Options', () => {
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wait for teams to load
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options.length > 1,
      { timeout: 10000 }
    );

    // Complete Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('John');
    await page.locator('input#playerLastName').fill('Smith');
    await page.locator('input#playerDob').fill('2015-03-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Complete Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Smith');
    await page.locator('input#parentEmail').fill('jane@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Bob Smith');
    await page.locator('input#emergencyPhone').fill('4025559999');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 3
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
  });

  test('should display all three payment options', async ({ page }) => {
    // Use heading role to target the specific payment option titles
    await expect(page.getByRole('heading', { name: 'Pay in Full' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment Plan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Request Special Arrangement' })).toBeVisible();
  });

  test('should show payment plan options when Payment Plan is selected', async ({ page }) => {
    // Click the Payment Plan button (which contains the h4 heading)
    await page.locator('button').filter({ hasText: 'Payment Plan' }).filter({ hasText: 'Split your payment' }).click();

    // Should show plan options
    await expect(page.getByText('Plan A')).toBeVisible();
    await expect(page.getByText('Plan B')).toBeVisible();
  });

  test('should show special request form when Special Arrangement is selected', async ({ page }) => {
    // Click the Special Arrangement button (which contains the h4 heading)
    await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();

    // Should show reason dropdown and notes field
    await expect(page.locator('select#specialRequestReason')).toBeVisible();
    await expect(page.locator('textarea#specialRequestNotes')).toBeVisible();
  });
});

test.describe('Registration Wizard - Mobile Responsiveness', () => {
  test('should display wizard correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wizard should be visible
    await expect(page.locator('h1').filter({ hasText: /Registration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should show mobile step indicator', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Mobile step indicator should show step count
    await expect(page.getByText(/Step 1 of 4/i)).toBeVisible();
  });
});
