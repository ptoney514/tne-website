// @ts-check
import { test, expect } from '@playwright/test';
import { generateTryoutData } from '../../fixtures/mockData.js';

/**
 * Tryout Form Submission Tests
 *
 * Tests submitting 12 varied entries through the tryout registration form.
 * Uses API mocking to simulate Supabase responses.
 */

// Mock tryout sessions data (Neon API shape)
function getMockSessions() {
  const today = new Date();
  const formatDate = (daysOffset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: 'session-1',
      date: formatDate(14),
      start_time: '09:00',
      end_time: '12:00',
      location: 'Central Recreation Center',
      grade_levels: '4th-5th',
      description: '4th-5th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      registration_open: true,
      max_participants: 30,
      spots_remaining: 30,
    },
    {
      id: 'session-2',
      date: formatDate(15),
      start_time: '13:00',
      end_time: '16:00',
      location: 'Central Recreation Center',
      grade_levels: '6th-7th',
      description: '6th-7th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      registration_open: true,
      max_participants: 25,
      spots_remaining: 25,
    },
    {
      id: 'session-3',
      date: formatDate(21),
      start_time: '09:00',
      end_time: '12:00',
      location: 'Gateway High School Gym',
      grade_levels: '8th',
      description: '8th Grade Tryouts',
      notes: 'Boys & Girls divisions',
      registration_open: true,
      max_participants: 20,
      spots_remaining: 20,
    },
  ];
}

/**
 * Setup API mocking for tryout tests (Neon API routes)
 */
async function setupTryoutApiMocks(page) {
  // Mock the config.json to enable tryouts
  await page.route('**/data/json/config.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        season: {
          id: '2024-25-winter',
          name: '2024-25 Winter',
          is_active: true,
        },
        registration: {
          is_open: true,
          label: 'Winter 2024-25',
        },
        tryouts: {
          is_open: true, // Enable tryouts for tests
          label: 'Winter 25-26 Tryouts',
        },
        payment: {
          paypal_enabled: true,
          venmo_enabled: true,
        },
      }),
    });
  });

  // Mock tryout sessions GET request
  await page.route('**/api/public/tryouts*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockSessions()),
      });
    } else {
      await route.continue();
    }
  });

  // Mock tryout signup POST request
  await page.route('**/api/public/tryout-signup*', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      // Mirror the Neon API success shape
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Successfully registered for tryout',
          signup_id: 'signup-123',
        }),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Tryout Form Submissions', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking before navigating
    await setupTryoutApiMocks(page);

    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  // Generate 12 test cases
  for (let i = 0; i < 12; i++) {
    test(`should submit tryout registration ${i + 1} of 12`, async ({ page }) => {
      const testData = generateTryoutData(i);

      // Wait for sessions to load (mocked)
      await page.waitForTimeout(1000);

      // Scroll to registration form
      const registrationForm = page.locator('#registration').first();
      await registrationForm.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Fill session selection (first available session)
      const sessionSelect = page.locator('#sessionId');
      await expect(sessionSelect).toBeVisible({ timeout: 5000 });

      // Wait for options to load
      await page.waitForFunction(
        () => document.querySelector('#sessionId')?.options?.length > 1,
        { timeout: 10000 }
      );

      // Select the first available session
      await sessionSelect.selectOption({ index: 1 });

      // Fill player information
      await page.locator('#playerFirstName').fill(testData.playerFirstName);
      await page.locator('#playerLastName').fill(testData.playerLastName);
      await page.locator('#playerDob').fill(testData.playerDob);
      await page.locator('#playerGrade').selectOption(testData.playerGrade);

      // Select gender
      await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();

      // Fill optional school field if provided
      if (testData.playerSchool) {
        await page.locator('#playerSchool').fill(testData.playerSchool);
      }

      // Fill parent/guardian information
      await page.locator('#parentFirstName').fill(testData.parentFirstName);
      await page.locator('#parentLastName').fill(testData.parentLastName);
      await page.locator('#parentEmail').fill(testData.parentEmail);
      await page.locator('#parentPhone').fill(testData.parentPhone);
      await page.locator('#relationship').selectOption(testData.relationship);

      // Submit the form
      const submitButton = page.getByRole('button', { name: /Complete Registration/i });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for success message
      await expect(page.getByText(/Registration Complete/i)).toBeVisible({ timeout: 15000 });

      console.log(`Tryout registration ${i + 1}: submitted successfully`);
    });
  }
});

test.describe('Tryout Form - Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTryoutApiMocks(page);
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  test('should show error for empty required fields', async ({ page }) => {
    // Scroll to registration form
    const registrationForm = page.locator('#registration').first();
    await registrationForm.scrollIntoViewIfNeeded();

    // Wait for form to be ready
    await page.waitForTimeout(1000);

    // Try to submit without filling any fields
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Browser validation should prevent submission - form should still be visible
    await expect(registrationForm).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Scroll to registration form
    const registrationForm = page.locator('#registration').first();
    await registrationForm.scrollIntoViewIfNeeded();

    // Wait for session options
    const sessionSelect = page.locator('#sessionId');
    await expect(sessionSelect).toBeVisible({ timeout: 5000 });

    await page.waitForFunction(
      () => document.querySelector('#sessionId')?.options?.length > 1,
      { timeout: 10000 }
    );

    await sessionSelect.selectOption({ index: 1 });

    // Fill all required fields with an invalid email
    const testData = generateTryoutData(0);
    await page.locator('#playerFirstName').fill(testData.playerFirstName);
    await page.locator('#playerLastName').fill(testData.playerLastName);
    await page.locator('#playerDob').fill(testData.playerDob);
    await page.locator('#playerGrade').selectOption(testData.playerGrade);
    await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();
    await page.locator('#parentFirstName').fill(testData.parentFirstName);
    await page.locator('#parentLastName').fill(testData.parentLastName);
    await page.locator('#parentEmail').fill('invalid-email'); // Invalid email
    await page.locator('#parentPhone').fill(testData.parentPhone);
    await page.locator('#relationship').selectOption(testData.relationship);

    // Try to submit
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Email field should show validation error
    const emailInput = page.locator('#parentEmail');
    const isInvalid = await emailInput.evaluate(
      (el) => !el.checkValidity()
    );

    expect(isInvalid).toBe(true);
  });
});

test.describe('Tryout Form - Data Persistence', () => {
  test('should maintain form data on page interactions', async ({ page }) => {
    await setupTryoutApiMocks(page);
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Scroll to registration form
    const registrationForm = page.locator('#registration').first();
    await registrationForm.scrollIntoViewIfNeeded();

    const sessionSelect = page.locator('#sessionId');
    await expect(sessionSelect).toBeVisible({ timeout: 5000 });

    await page.waitForFunction(
      () => document.querySelector('#sessionId')?.options?.length > 1,
      { timeout: 10000 }
    );

    // Fill some fields
    const testData = generateTryoutData(0);
    await sessionSelect.selectOption({ index: 1 });
    await page.locator('#playerFirstName').fill(testData.playerFirstName);
    await page.locator('#playerLastName').fill(testData.playerLastName);

    // Scroll away and back
    await page.locator('h1').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await registrationForm.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify data is still there
    await expect(page.locator('#playerFirstName')).toHaveValue(testData.playerFirstName);
    await expect(page.locator('#playerLastName')).toHaveValue(testData.playerLastName);
  });
});

test.describe('Tryout Form - Grade Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupTryoutApiMocks(page);
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });
  });

  const grades = ['4', '5', '6', '7', '8'];

  for (const grade of grades) {
    test(`should register player in grade ${grade}`, async ({ page }) => {
      const testData = generateTryoutData(parseInt(grade) - 4);
      testData.playerGrade = grade;

      // Scroll to registration form
      const registrationForm = page.locator('#registration').first();
      await registrationForm.scrollIntoViewIfNeeded();

      // Wait for session options
      const sessionSelect = page.locator('#sessionId');
      await expect(sessionSelect).toBeVisible({ timeout: 5000 });

      await page.waitForFunction(
        () => document.querySelector('#sessionId')?.options?.length > 1,
        { timeout: 10000 }
      );

      // Select session
      await sessionSelect.selectOption({ index: 1 });

      // Fill form
      await page.locator('#playerFirstName').fill(testData.playerFirstName);
      await page.locator('#playerLastName').fill(testData.playerLastName);
      await page.locator('#playerDob').fill(testData.playerDob);
      await page.locator('#playerGrade').selectOption(grade);
      await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();
      await page.locator('#parentFirstName').fill(testData.parentFirstName);
      await page.locator('#parentLastName').fill(testData.parentLastName);
      await page.locator('#parentEmail').fill(testData.parentEmail);
      await page.locator('#parentPhone').fill(testData.parentPhone);
      await page.locator('#relationship').selectOption(testData.relationship);

      // Verify grade is selected
      await expect(page.locator('#playerGrade')).toHaveValue(grade);

      // Submit
      const submitButton = page.getByRole('button', { name: /Complete Registration/i });
      await submitButton.click();

      // Wait for success
      await expect(page.getByText(/Registration Complete/i)).toBeVisible({ timeout: 15000 });
    });
  }
});

test.describe('Tryout Form - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should display correctly on mobile', async ({ page }) => {
    await setupTryoutApiMocks(page);
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Scroll to registration form
    const registrationForm = page.locator('#registration').first();
    await registrationForm.scrollIntoViewIfNeeded();

    // Form should be visible and usable
    await expect(page.locator('#sessionId')).toBeVisible();
    await expect(page.locator('#playerFirstName')).toBeVisible();
    await expect(page.getByRole('button', { name: /Complete Registration/i })).toBeVisible();
  });
});
