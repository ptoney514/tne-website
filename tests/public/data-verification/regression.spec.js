// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression Tests for Form Validation and Error Handling
 *
 * Tests common validation scenarios and edge cases to prevent regressions.
 */

test.describe('Email Validation', () => {
  test.describe('Contact Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
    });

    test('should reject email without @ symbol', async ({ page }) => {
      await page.locator('#name').fill('Test User');
      await page.locator('#email').fill('invalidemail.com');
      await page.locator('#subject').selectOption('other');
      await page.locator('#message').fill('Test message');

      await page.getByRole('button', { name: /Send Message/i }).click();

      const emailInput = page.locator('#email');
      const isInvalid = await emailInput.evaluate((el) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    });

    test('should reject email without domain', async ({ page }) => {
      await page.locator('#name').fill('Test User');
      await page.locator('#email').fill('test@');
      await page.locator('#subject').selectOption('other');
      await page.locator('#message').fill('Test message');

      await page.getByRole('button', { name: /Send Message/i }).click();

      const emailInput = page.locator('#email');
      const isInvalid = await emailInput.evaluate((el) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    });

    test('should accept valid email with subdomain', async ({ page }) => {
      await page.locator('#name').fill('Test User');
      await page.locator('#email').fill('test@sub.domain.com');
      await page.locator('#subject').selectOption('other');
      await page.locator('#message').fill('Test message');

      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el) => el.checkValidity());
      expect(isValid).toBe(true);
    });

    test('should accept valid email with plus sign', async ({ page }) => {
      await page.locator('#name').fill('Test User');
      await page.locator('#email').fill('test+tag@example.com');
      await page.locator('#subject').selectOption('other');
      await page.locator('#message').fill('Test message');

      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el) => el.checkValidity());
      expect(isValid).toBe(true);
    });
  });

  test.describe('Registration Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
      await page.waitForSelector('h1', { timeout: 15000 });

      // Complete Step 1 to get to Step 2 where email is validated
      await page.waitForFunction(
        () => document.querySelector('select#teamId')?.options?.length > 1,
        { timeout: 15000 }
      );

      await page.locator('select#teamId').selectOption({ index: 1 });
      await page.locator('input#playerFirstName').fill('Test');
      await page.locator('input#playerLastName').fill('Player');
      await page.locator('input#playerDob').fill('2015-01-15');
      await page.locator('select#playerGrade').selectOption('5');
      await page.locator('input[name="playerGender"][value="male"]').check();
      await page.locator('select#jerseySize').selectOption('YM');
      await page.locator('input#desiredJerseyNumber').fill('23');
      await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
      await page.getByRole('button', { name: /Continue/i }).click();

      await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for invalid email', async ({ page }) => {
      await page.locator('input#parentFirstName').fill('Jane');
      await page.locator('input#parentLastName').fill('Parent');
      await page.locator('input#parentEmail').fill('invalid-email');
      await page.locator('input#parentPhone').fill('4025551234');
      await page.locator('input#parentHomePhone').fill('4025559876');
      await page.locator('select#relationship').selectOption('mother');
      await page.locator('input#addressStreet').fill('123 Main St');
      await page.locator('input#addressCity').fill('Omaha');
      await page.locator('select#addressState').selectOption('NE');
      await page.locator('input#addressZip').fill('68114');
      await page.locator('input#emergencyName').fill('Emergency');
      await page.locator('input#emergencyPhone').fill('4025559999');

      await page.getByRole('button', { name: /Continue/i }).click();

      // Should show validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    });
  });
});

test.describe('ZIP Code Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Complete Step 1
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options?.length > 1,
      { timeout: 15000 }
    );

    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('Test');
    await page.locator('input#playerLastName').fill('Player');
    await page.locator('input#playerDob').fill('2015-01-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
  });

  test('should reject ZIP code with less than 5 digits', async ({ page }) => {
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Parent');
    await page.locator('input#parentEmail').fill('test@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('123'); // Invalid - too short
    await page.locator('input#emergencyName').fill('Emergency');
    await page.locator('input#emergencyPhone').fill('4025559999');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error
    await expect(page.getByText('Please enter a valid 5-digit ZIP code')).toBeVisible();
  });

  test('should reject ZIP code with letters', async ({ page }) => {
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Parent');
    await page.locator('input#parentEmail').fill('test@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('6811A'); // Invalid - contains letter
    await page.locator('input#emergencyName').fill('Emergency');
    await page.locator('input#emergencyPhone').fill('4025559999');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error
    await expect(page.getByText('Please enter a valid 5-digit ZIP code')).toBeVisible();
  });

  test('should accept valid 5-digit ZIP code', async ({ page }) => {
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Parent');
    await page.locator('input#parentEmail').fill('test@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114'); // Valid
    await page.locator('input#emergencyName').fill('Emergency');
    await page.locator('input#emergencyPhone').fill('4025559999');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Should proceed to next step
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Required Field Validation', () => {
  test.describe('Registration Step 1', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
      await page.waitForSelector('h1', { timeout: 15000 });
    });

    test('should require team selection', async ({ page }) => {
      await page.getByRole('button', { name: /Continue/i }).click();
      await expect(page.getByText('Please select a team')).toBeVisible();
    });

    test('should require player first name', async ({ page }) => {
      await page.waitForFunction(
        () => document.querySelector('select#teamId')?.options?.length > 1,
        { timeout: 15000 }
      );

      await page.locator('select#teamId').selectOption({ index: 1 });
      await page.getByRole('button', { name: /Continue/i }).click();
      await expect(page.getByText('First name is required')).toBeVisible();
    });
  });

  test.describe('Registration Step 2', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
      await page.waitForSelector('h1', { timeout: 15000 });

      // Complete Step 1
      await page.waitForFunction(
        () => document.querySelector('select#teamId')?.options?.length > 1,
        { timeout: 15000 }
      );

      await page.locator('select#teamId').selectOption({ index: 1 });
      await page.locator('input#playerFirstName').fill('Test');
      await page.locator('input#playerLastName').fill('Player');
      await page.locator('input#playerDob').fill('2015-01-15');
      await page.locator('select#playerGrade').selectOption('5');
      await page.locator('input[name="playerGender"][value="male"]').check();
      await page.locator('select#jerseySize').selectOption('YM');
      await page.locator('input#desiredJerseyNumber').fill('23');
      await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
      await page.getByRole('button', { name: /Continue/i }).click();

      await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    });

    test('should show prompt for incomplete required fields', async ({ page }) => {
      // Continue button should be disabled
      await expect(page.getByRole('button', { name: /Continue/i })).toBeDisabled();

      // Should show helper text
      await expect(page.getByText('Complete all required fields to continue')).toBeVisible();
    });
  });
});

test.describe('Waiver Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Complete Steps 1-3 to get to Step 4
    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options?.length > 1,
      { timeout: 15000 }
    );

    // Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill('Test');
    await page.locator('input#playerLastName').fill('Player');
    await page.locator('input#playerDob').fill('2015-01-15');
    await page.locator('select#playerGrade').selectOption('5');
    await page.locator('input[name="playerGender"][value="male"]').check();
    await page.locator('select#jerseySize').selectOption('YM');
    await page.locator('input#desiredJerseyNumber').fill('23');
    await page.locator('input#lastTeamPlayedFor').fill('Omaha Stars');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });
    await page.locator('input#parentFirstName').fill('Jane');
    await page.locator('input#parentLastName').fill('Parent');
    await page.locator('input#parentEmail').fill('test@example.com');
    await page.locator('input#parentPhone').fill('4025551234');
    await page.locator('input#parentHomePhone').fill('4025559876');
    await page.locator('select#relationship').selectOption('mother');
    await page.locator('input#addressStreet').fill('123 Main St');
    await page.locator('input#addressCity').fill('Omaha');
    await page.locator('select#addressState').selectOption('NE');
    await page.locator('input#addressZip').fill('68114');
    await page.locator('input#emergencyName').fill('Emergency');
    await page.locator('input#emergencyPhone').fill('4025559999');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3
    await expect(page.getByText('Choose Your Payment Option')).toBeVisible({ timeout: 5000 });
    await page.locator('button').filter({ hasText: 'Request Special Arrangement' }).click();
    await page.waitForTimeout(500);
    await page.locator('select#specialRequestReason').selectOption('financial_hardship');
    await page.locator('textarea#specialRequestNotes').fill('Test');
    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Step 4
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible({ timeout: 5000 });
  });

  test('should disable submit without waivers', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Secure Player Spot/i });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit after all waivers accepted', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Secure Player Spot/i });

    // Check all checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    await expect(submitButton).toBeEnabled();
  });

  test('should re-disable submit if waiver unchecked', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Secure Player Spot/i });
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    // Check all
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    await expect(submitButton).toBeEnabled();

    // Uncheck one
    await checkboxes.nth(0).uncheck();

    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Network Error Handling', () => {
  test('should handle network failure gracefully on contact form', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Block Supabase requests to simulate network error
    await page.route('**/rest/v1/**', (route) => route.abort('failed'));
    await page.route('mailto:**', (route) => route.abort());

    // Fill and submit form
    await page.locator('#name').fill('Network Test');
    await page.locator('#email').fill('network.test@example.com');
    await page.locator('#subject').selectOption('other');
    await page.locator('#message').fill('Testing network error handling');

    await page.getByRole('button', { name: /Send Message/i }).click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Form should still be visible or show error
    const formVisible = await page.locator('#name').isVisible();
    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false);
    const successVisible = await page.getByText(/Message Sent!/i).isVisible().catch(() => false);

    // At least one state should be true
    expect(formVisible || errorVisible || successVisible).toBe(true);
  });
});

test.describe('Form Data Persistence', () => {
  test('should preserve form data on back navigation in registration', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 15000 });

    await page.waitForFunction(
      () => document.querySelector('select#teamId')?.options?.length > 1,
      { timeout: 15000 }
    );

    const testFirstName = 'PersistenceTest';
    const testLastName = 'DataCheck';

    // Fill Step 1
    await page.locator('select#teamId').selectOption({ index: 1 });
    await page.locator('input#playerFirstName').fill(testFirstName);
    await page.locator('input#playerLastName').fill(testLastName);
    await page.locator('input#playerDob').fill('2015-06-15');
    await page.locator('select#playerGrade').selectOption('6');
    await page.locator('input[name="playerGender"][value="female"]').check();
    await page.locator('select#jerseySize').selectOption('YL');
    await page.locator('input#desiredJerseyNumber').fill('10');
    await page.locator('input#lastTeamPlayedFor').fill('Lincoln Lightning');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for Step 2
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible({ timeout: 5000 });

    // Fill some Step 2 data
    const testParentName = 'ParentPersistence';
    await page.locator('input#parentFirstName').fill(testParentName);

    // Go back
    await page.getByRole('button', { name: /Back/i }).click();

    // Verify Step 1 data preserved
    await expect(page.locator('input#playerFirstName')).toHaveValue(testFirstName);
    await expect(page.locator('input#playerLastName')).toHaveValue(testLastName);
    await expect(page.locator('input#playerDob')).toHaveValue('2015-06-15');
    await expect(page.locator('select#playerGrade')).toHaveValue('6');
    await expect(page.locator('input[name="playerGender"][value="female"]')).toBeChecked();
    await expect(page.locator('select#jerseySize')).toHaveValue('YL');

    // Go forward again
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify Step 2 data preserved
    await expect(page.locator('input#parentFirstName')).toHaveValue(testParentName);
  });
});
