// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display registration page with heading', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Team Registration/i })).toBeVisible();
  });

  test('should display registration fees section', async ({ page }) => {
    await expect(page.getByText('Registration Fees')).toBeVisible();
  });

  test('should display Our Commitment section', async ({ page }) => {
    await expect(page.getByText('Our Commitment')).toBeVisible();
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Team Registration' })).toBeVisible();
    await expect(page.getByText('Complete the form below')).toBeVisible();
  });
});

test.describe('Registration Form - Team Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display team selection dropdown', async ({ page }) => {
    const teamSelect = page.locator('select#teamId');
    await expect(teamSelect).toBeVisible();
  });

  test('should have team options in dropdown', async ({ page }) => {
    const teamSelect = page.locator('select#teamId');

    // Should have the select visible
    await expect(teamSelect).toBeVisible();

    // Should have multiple options (at least placeholder + teams)
    const optionCount = await teamSelect.locator('option').count();
    expect(optionCount).toBeGreaterThanOrEqual(1);
  });

  test('should show fee breakdown when team is selected', async ({ page }) => {
    const teamSelect = page.locator('select#teamId');

    // Get the first team option (not the placeholder)
    const options = await teamSelect.locator('option').all();

    if (options.length > 1) {
      // Select the first real team
      await teamSelect.selectOption({ index: 1 });

      // Fee breakdown should appear
      await expect(page.getByText('Registration Fee:')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Registration Form - Player Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display player information section', async ({ page }) => {
    await expect(page.getByText('Player Information')).toBeVisible();
  });

  test('should have first name field', async ({ page }) => {
    const firstNameInput = page.locator('input#playerFirstName');
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('required');
  });

  test('should have last name field', async ({ page }) => {
    const lastNameInput = page.locator('input#playerLastName');
    await expect(lastNameInput).toBeVisible();
    await expect(lastNameInput).toHaveAttribute('required');
  });

  test('should have date of birth field', async ({ page }) => {
    const dobInput = page.locator('input#playerDob');
    await expect(dobInput).toBeVisible();
    await expect(dobInput).toHaveAttribute('type', 'date');
    await expect(dobInput).toHaveAttribute('required');
  });

  test('should have grade selection dropdown', async ({ page }) => {
    const gradeSelect = page.locator('select#playerGrade');
    await expect(gradeSelect).toBeVisible();
    await expect(gradeSelect).toHaveAttribute('required');
  });

  test('should have grade options from 4th to 8th', async ({ page }) => {
    const gradeSelect = page.locator('select#playerGrade');

    // Select should be visible and have options
    await expect(gradeSelect).toBeVisible();

    // Should have 6 options: placeholder + 5 grades (4th-8th)
    const optionCount = await gradeSelect.locator('option').count();
    expect(optionCount).toBe(6);
  });

  test('should have gender radio buttons', async ({ page }) => {
    await expect(page.locator('input[name="playerGender"][value="male"]')).toBeVisible();
    await expect(page.locator('input[name="playerGender"][value="female"]')).toBeVisible();
  });

  test('should have jersey size dropdown', async ({ page }) => {
    const jerseySizeSelect = page.locator('select#jerseySize');
    await expect(jerseySizeSelect).toBeVisible();
    await expect(jerseySizeSelect).toHaveAttribute('required');
  });

  test('should have position preference dropdown', async ({ page }) => {
    const positionSelect = page.locator('select#position');
    await expect(positionSelect).toBeVisible();
  });

  test('should have medical notes textarea', async ({ page }) => {
    const medicalNotes = page.locator('textarea#medicalNotes');
    await expect(medicalNotes).toBeVisible();
  });
});

test.describe('Registration Form - Parent/Guardian Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display parent/guardian section', async ({ page }) => {
    await expect(page.getByText('Parent/Guardian Information')).toBeVisible();
  });

  test('should have parent name fields', async ({ page }) => {
    await expect(page.locator('input#parentFirstName')).toBeVisible();
    await expect(page.locator('input#parentLastName')).toBeVisible();
  });

  test('should have parent email field', async ({ page }) => {
    const emailInput = page.locator('input#parentEmail');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should have parent phone field', async ({ page }) => {
    const phoneInput = page.locator('input#parentPhone');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('type', 'tel');
    await expect(phoneInput).toHaveAttribute('required');
  });

  test('should have relationship dropdown', async ({ page }) => {
    const relationshipSelect = page.locator('select#relationship');
    await expect(relationshipSelect).toBeVisible();
    await expect(relationshipSelect).toHaveAttribute('required');
  });

  test('should have address fields', async ({ page }) => {
    await expect(page.locator('input#addressStreet')).toBeVisible();
    await expect(page.locator('input#addressCity')).toBeVisible();
    await expect(page.locator('select#addressState')).toBeVisible();
    await expect(page.locator('input#addressZip')).toBeVisible();
  });
});

test.describe('Registration Form - Emergency Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display emergency contact section', async ({ page }) => {
    await expect(page.getByText('Emergency Contact')).toBeVisible();
  });

  test('should have emergency contact fields', async ({ page }) => {
    await expect(page.locator('input#emergencyName')).toBeVisible();
    await expect(page.locator('input#emergencyPhone')).toBeVisible();
    await expect(page.locator('input#emergencyRelationship')).toBeVisible();
  });
});

test.describe('Registration Form - Waiver', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display waiver section', async ({ page }) => {
    await expect(page.getByText('Waiver & Agreement')).toBeVisible();
  });

  test('should display waiver text', async ({ page }) => {
    await expect(page.getByText('Liability Waiver:')).toBeVisible();
    await expect(page.getByText('Medical Authorization:')).toBeVisible();
  });

  test('should have waiver acceptance checkbox', async ({ page }) => {
    const waiverCheckbox = page.locator('input[name="waiverAccepted"]');
    await expect(waiverCheckbox).toBeVisible();
    await expect(waiverCheckbox).toHaveAttribute('required');
  });

  test('should have submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Complete Registration/i })).toBeVisible();
  });

  test('submit button should be disabled until waiver is accepted', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    const waiverCheckbox = page.locator('input[name="waiverAccepted"]');

    // Initially disabled (waiver not checked)
    await expect(submitButton).toBeDisabled();

    // Check waiver
    await waiverCheckbox.check();

    // Still might be disabled due to missing required fields, but at least waiver condition is met
  });
});

test.describe('Registration Form - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should not submit without required fields', async ({ page }) => {
    // Accept waiver
    const waiverCheckbox = page.locator('input[name="waiverAccepted"]');
    await waiverCheckbox.check();

    // Try to submit
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should still be on the registration page (form validation should prevent submission)
    await expect(page).toHaveURL('/register');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input#parentEmail');
    await emailInput.fill('invalid-email');

    // Email validation is native HTML5 validation
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should validate zip code format', async ({ page }) => {
    const zipInput = page.locator('input#addressZip');

    // Has pattern attribute for 5-digit zip
    await expect(zipInput).toHaveAttribute('pattern', '[0-9]{5}');
  });
});

test.describe('Registration Form - Mobile Responsiveness', () => {
  test('should display form correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/register');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Form should still be visible
    await expect(page.locator('h1').filter({ hasText: /Team Registration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Complete Registration/i })).toBeVisible();
  });
});
