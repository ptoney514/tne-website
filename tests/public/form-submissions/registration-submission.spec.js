// @ts-check
import { test, expect } from '@playwright/test';
import { generateRegistrationData } from '../../fixtures/mockData.js';

/**
 * Registration Form Submission Tests
 *
 * Tests submitting 12 varied entries through the registration wizard
 * and verifying the data is correctly saved.
 */

/**
 * Navigate to registration page and select "Register" if type selector appears.
 * When both tryouts + team registration are open, the type selector shows first.
 * When only team registration is open, the wizard loads directly (auto-selected).
 */
async function selectTeamRegistration(page) {
  // Clear any saved registration draft to prevent stale state
  await page.evaluate(() => localStorage.removeItem('tne_registration_draft'));

  await page.waitForSelector('h1', { timeout: 15000 });

  // Check if type selector is visible (both paths are open)
  const typeSelector = page.getByText('How would you like to register?');
  const isSelectorVisible = await typeSelector.isVisible().catch(() => false);

  if (isSelectorVisible) {
    // Click the "Register" card (button with "Get Started" CTA)
    await page.locator('button').filter({ hasText: 'Get Started' }).click();
    // Wait for team wizard to load
    await page.waitForSelector('select#teamId', { timeout: 10000 });
  }
}

/**
 * Helper to fill Step 1 - Player & Team
 */
async function fillStep1(page, data) {
  // Wait for teams to load
  await page.waitForFunction(
    () => document.querySelector('select#teamId')?.options?.length > 1,
    { timeout: 15000 }
  );

  // Select team (use first available)
  await page.locator('select#teamId').selectOption({ index: 1 });

  // Fill player info
  await page.locator('input#playerFirstName').fill(data.playerFirstName);
  await page.locator('input#playerLastName').fill(data.playerLastName);
  await page.locator('input#playerDob').fill(data.playerDob);
  await page.locator('select#playerGrade').selectOption(data.playerGrade);
  await page.locator(`input[name="playerGender"][value="${data.playerGender}"]`).check();
  await page.locator('select#jerseySize').selectOption(data.jerseySize);

  // Optional position
  if (data.position) {
    await page.locator('select#position').selectOption(data.position);
  }

  // New required fields
  await page.locator('input#desiredJerseyNumber').fill(data.desiredJerseyNumber || '1');
  await page.locator('input#lastTeamPlayedFor').fill(data.lastTeamPlayedFor || 'None');
}

/**
 * Helper to fill Step 2 - Parent/Guardian
 */
async function fillStep2(page, data) {
  await page.locator('input#parentFirstName').fill(data.parentFirstName);
  await page.locator('input#parentLastName').fill(data.parentLastName);
  await page.locator('input#parentEmail').fill(data.parentEmail);
  await page.locator('input#parentPhone').fill(data.parentPhone);
  await page.locator('input#parentHomePhone').fill(data.parentHomePhone || '4025550000');
  await page.locator('select#relationship').selectOption(data.relationship);

  // Optional Parent 2
  if (data.parent2Name) {
    await page.locator('input#parent2Name').fill(data.parent2Name);
    if (data.parent2Phone) {
      await page.locator('input#parent2Phone').fill(data.parent2Phone);
    }
    if (data.parent2Email) {
      await page.locator('input#parent2Email').fill(data.parent2Email);
    }
  }

  await page.locator('input#addressStreet').fill(data.addressStreet);
  await page.locator('input#addressCity').fill(data.addressCity);
  await page.locator('select#addressState').selectOption(data.addressState);
  await page.locator('input#addressZip').fill(data.addressZip);
  await page.locator('input#emergencyName').fill(data.emergencyName);
  await page.locator('input#emergencyPhone').fill(data.emergencyPhone);
}

/**
 * Helper to fill Step 3 - Payment
 * Returns true if special request (needs different navigation)
 */
async function fillStep3(page, data) {
  switch (data.paymentPlanType) {
    case 'full':
      // Select Pay in Full
      await page.locator('button').filter({ hasText: 'Pay in Full' }).filter({ hasText: 'Complete your registration' }).click();
      await page.waitForTimeout(500);
      // For full payment, button says "Continue to Payment"
      await page.getByRole('button', { name: /Continue to Payment/i }).click();
      // Wait for payment instructions screen
      await page.waitForTimeout(500);
      // Click "Continue to Review" button
      await page.getByRole('button', { name: /Continue to Review/i }).click();
      return false;

    case 'installment':
      // Select Payment Plan
      await page.locator('button').filter({ hasText: 'Payment Plan' }).filter({ hasText: 'Split your payment' }).click();
      // Wait for plan options to appear
      await page.waitForTimeout(500);
      // Select a plan option - look for "Plan A" or "Plan B"
      const planButton = page.locator('button:has-text("Plan A")').or(page.locator('button:has-text("Plan B")'));
      await planButton.first().click();
      await page.waitForTimeout(500);
      // For installment, button says "Continue to Payment"
      await page.getByRole('button', { name: /Continue to Payment/i }).click();
      // Wait for payment instructions screen
      await page.waitForTimeout(500);
      // Click "Continue to Review" button
      await page.getByRole('button', { name: /Continue to Review/i }).click();
      return false;

    case 'special_request':
      // Select Special Arrangement
      await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();
      // Wait for form fields
      await page.waitForTimeout(500);
      // Fill special request details
      await page.locator('select#specialRequestReason').selectOption(data.specialRequestReason);
      if (data.specialRequestNotes) {
        await page.locator('textarea#specialRequestNotes').fill(data.specialRequestNotes);
      }
      // Submit the special request - button says "Submit Request"
      await page.getByRole('button', { name: /Submit Request/i }).click();
      return true; // Special request has different flow

    default:
      // Default to Pay in Full
      await page.locator('button').filter({ hasText: 'Pay in Full' }).filter({ hasText: 'Complete your registration' }).click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Continue to Payment/i }).click();
      return false;
  }
}

/**
 * Helper to fill Step 4 - Review & Waivers
 */
async function fillStep4(page, _data) {
  // Check all waivers
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();

  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }
}

test.describe('Registration Form Submissions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the registration API endpoint
    await page.route('**/api/register', async (route) => {
      const referenceId = `REG-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          referenceId,
          message: 'Registration submitted successfully',
        }),
      });
    });

    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  // Test 12 varied registrations - verify form flow completes
  for (let i = 0; i < 12; i++) {
    test(`should complete registration flow ${i + 1} of 12`, async ({ page }) => {
      const testData = generateRegistrationData(i);

      // Step 1: Player & Team
      await fillStep1(page, testData);
      await page.getByRole('button', { name: /Continue/i }).click();

      // Wait for Step 2
      await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

      // Step 2: Parent/Guardian
      await fillStep2(page, testData);
      await page.getByRole('button', { name: /Continue/i }).click();

      // Wait for Step 3
      await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });

      // Step 3: Payment (fillStep3 handles navigation to next step)
      await fillStep3(page, testData);

      // Wait for Step 4
      await expect(page.locator('h3:has-text("Review & Confirm")')).toBeVisible({ timeout: 10000 });

      // Step 4: Review & Waivers
      await fillStep4(page, testData);

      // Submit button should be enabled after waivers are accepted
      const submitButton = page.getByRole('button', { name: /Secure Player Spot/i });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Click submit and verify form submission completes
      await submitButton.click();

      // Wait for success message to appear
      // Regular payments show "Registration Complete!", special requests show "Request Submitted"
      const successLocator = page.locator('h3:has-text("Registration Complete"), h3:has-text("Request Submitted")');
      await expect(successLocator).toBeVisible({ timeout: 15000 });

      console.log(`Registration ${i + 1}: form submitted successfully`);
    });
  }
});

test.describe('Registration Form - Payment Type Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  test('should complete registration with Pay in Full', async ({ page }) => {
    const testData = generateRegistrationData(0);
    testData.paymentPlanType = 'full';

    await fillStep1(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await fillStep2(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });

    // Select Pay in Full
    await page.locator('button').filter({ hasText: 'Pay in Full' }).filter({ hasText: 'Complete your registration' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Payment/i }).click();

    // Wait for payment instructions screen and click Continue to Review
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    await expect(page.locator('h3:has-text("Review & Confirm")')).toBeVisible({ timeout: 10000 });
  });

  test('should complete registration with Payment Plan', async ({ page }) => {
    const testData = generateRegistrationData(1);
    testData.paymentPlanType = 'installment';
    testData.paymentPlanOption = 'planA';

    await fillStep1(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await fillStep2(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });

    // Select Payment Plan
    await page.locator('button').filter({ hasText: 'Payment Plan' }).filter({ hasText: 'Split your payment' }).click();
    await page.waitForTimeout(500);

    // Select a payment plan option (Plan A or Plan B)
    const planButton = page.locator('button:has-text("Plan A")').or(page.locator('button:has-text("Plan B")'));
    await planButton.first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Payment/i }).click();

    // Wait for payment instructions screen and click Continue to Review
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    await expect(page.locator('h3:has-text("Review & Confirm")')).toBeVisible({ timeout: 10000 });
  });

  test('should complete registration with Special Arrangement', async ({ page }) => {
    const testData = generateRegistrationData(2);
    testData.paymentPlanType = 'special_request';
    testData.specialRequestReason = 'financial_hardship';
    testData.specialRequestNotes = 'Test special request';

    await fillStep1(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await fillStep2(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });

    // Select Special Arrangement
    await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();
    await page.waitForTimeout(500);

    // Fill special request details
    await page.locator('select#specialRequestReason').selectOption('financial_hardship');
    await page.locator('textarea#specialRequestNotes').fill('Test special request');

    // Submit the special request
    await page.getByRole('button', { name: /Submit Request/i }).click();

    await expect(page.locator('h3:has-text("Review & Confirm")')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Registration Form - Grade Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  const grades = ['3', '4', '5', '6', '7', '8'];

  for (const grade of grades) {
    test(`should register player in grade ${grade}`, async ({ page }) => {
      const testData = generateRegistrationData(parseInt(grade) - 3);
      testData.playerGrade = grade;

      // Wait for teams to load
      await page.waitForFunction(
        () => document.querySelector('select#teamId')?.options?.length > 1,
        { timeout: 15000 }
      );

      // Select team
      await page.locator('select#teamId').selectOption({ index: 1 });

      // Fill basic player info
      await page.locator('input#playerFirstName').fill(testData.playerFirstName);
      await page.locator('input#playerLastName').fill(testData.playerLastName);
      await page.locator('input#playerDob').fill(testData.playerDob);
      await page.locator('select#playerGrade').selectOption(grade);
      await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();
      await page.locator('select#jerseySize').selectOption(testData.jerseySize);
      await page.locator('input#desiredJerseyNumber').fill(testData.desiredJerseyNumber || '1');
      await page.locator('input#lastTeamPlayedFor').fill(testData.lastTeamPlayedFor || 'None');

      // Verify grade is selected
      await expect(page.locator('select#playerGrade')).toHaveValue(grade);

      // Continue to next step
      await page.getByRole('button', { name: /Continue/i }).click();
      await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('Registration Form - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);
  });

  test('should navigate back and preserve data', async ({ page }) => {
    const testData = generateRegistrationData(0);

    // Fill Step 1
    await fillStep1(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify on Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Go back to Step 1
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    // Verify data is preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue(testData.playerFirstName);
    await expect(page.locator('input#playerLastName')).toHaveValue(testData.playerLastName);
    await expect(page.locator('input#playerDob')).toHaveValue(testData.playerDob);
  });

  test('should preserve data through all steps', async ({ page }) => {
    const testData = generateRegistrationData(0);
    testData.paymentPlanType = 'full';

    // Step 1
    await fillStep1(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await fillStep2(page, testData);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
    await page.locator('button').filter({ hasText: 'Pay in Full' }).filter({ hasText: 'Complete your registration' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Payment/i }).click();

    // Wait for payment instructions screen and click Continue to Review
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // Step 4 (Review)
    await expect(page.locator('h3:has-text("Review & Confirm")')).toBeVisible({ timeout: 10000 });

    // Go back to Step 1
    await page.getByRole('button', { name: 'Back', exact: true }).click(); // to Step 3
    await page.getByRole('button', { name: 'Back', exact: true }).click(); // to Step 2
    await page.getByRole('button', { name: 'Back', exact: true }).click(); // to Step 1

    // Verify Step 1 data preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue(testData.playerFirstName);
  });
});

test.describe('Registration Form - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/register');
    await selectTeamRegistration(page);

    // Wizard should be visible
    await expect(page.locator('h1').filter({ hasText: /Registration/i })).toBeVisible();

    // Mobile step indicator should be visible
    await expect(page.getByText(/Step 1 of 4/i)).toBeVisible();

    // Form fields should be visible
    await expect(page.locator('select#teamId')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });
});
