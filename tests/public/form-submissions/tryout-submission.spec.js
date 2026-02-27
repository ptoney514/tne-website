// @ts-check
import { test, expect } from '@playwright/test';
import { generateTryoutData } from '../../fixtures/mockData.js';

/**
 * Tryout Form Submission Tests
 *
 * Tests submitting 12 varied entries through the tryout registration form.
 * The form now opens inside a modal when a session row is clicked.
 * Uses API mocking to simulate Neon API responses.
 */

// Mock tryout sessions data (Neon API shape)
function getMockSessions() {
  return [
    {
      id: 'session-1',
      date: '2026-03-02',
      start_time: '18:00',
      end_time: '19:30',
      location: 'Monroe MS',
      grade_levels: ['3rd', '4th'],
      gender: 'male',
      description: 'Boys Spring Tryouts - 3rd/4th',
      notes: 'Boys division',
      registration_open: true,
      max_participants: 30,
      spots_remaining: 30,
    },
    {
      id: 'session-2',
      date: '2026-03-03',
      start_time: '18:00',
      end_time: '19:30',
      location: 'Monroe MS',
      grade_levels: ['5th'],
      gender: 'male',
      description: 'Boys Spring Tryouts - 5th Grade',
      notes: 'Boys division',
      registration_open: true,
      max_participants: 25,
      spots_remaining: 25,
    },
    {
      id: 'session-3',
      date: '2026-03-03',
      start_time: '18:00',
      end_time: '19:30',
      location: 'McMillan MS',
      grade_levels: ['6th'],
      gender: 'male',
      description: 'Boys Spring Tryouts - 6th Grade',
      notes: 'Boys division',
      registration_open: true,
      max_participants: 25,
      spots_remaining: 25,
    },
    {
      id: 'session-4',
      date: '2026-03-04',
      start_time: '18:00',
      end_time: '19:30',
      location: 'North HS',
      grade_levels: ['7th', '8th'],
      gender: 'male',
      description: 'Boys Spring Tryouts - 7th/8th Grade',
      notes: 'Boys division',
      registration_open: true,
      max_participants: 25,
      spots_remaining: 25,
    },
    {
      id: 'session-5',
      date: '2026-03-15',
      start_time: '15:00',
      end_time: '16:00',
      location: 'Girls Inc.',
      grade_levels: ['3rd', '4th', '5th', '6th', '7th', '8th'],
      gender: 'female',
      description: 'Girls Spring Tryouts - 3rd-8th Grade',
      notes: 'Girls division',
      registration_open: true,
      max_participants: 30,
      spots_remaining: 30,
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
          label: 'Spring 2026 Tryouts',
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

  // Mock seasons GET request (needed for page to render)
  await page.route('**/api/public/seasons*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'a2b33e21-72e8-4bfa-b7dd-f824436ed2f9',
          name: '2024-25 Winter',
          start_date: '2024-11-01',
          end_date: '2025-03-31',
          is_active: true,
          tryouts_open: true,
          tryouts_label: 'Spring 2026 Tryouts',
          registration_open: true,
          registration_label: 'Spring 2026',
        },
      ]),
    });
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

/**
 * Click the first visible session row to open the registration modal,
 * then wait for the form to appear.
 */
async function openRegistrationModal(page) {
  // Wait for session rows to render
  const sessionRow = page.locator('[role="button"]').filter({ hasText: /Register/ }).first();
  await expect(sessionRow).toBeVisible({ timeout: 10000 });

  // Click to open the modal
  await sessionRow.click();

  // Wait for the modal form to appear
  await expect(page.locator('#playerFirstName')).toBeVisible({ timeout: 5000 });
}

/**
 * Fill the registration form inside the modal with test data.
 */
async function fillRegistrationForm(page, testData) {
  // Fill player information
  await page.locator('#playerFirstName').fill(testData.playerFirstName);
  await page.locator('#playerLastName').fill(testData.playerLastName);
  await page.locator('#playerDob').fill(testData.playerDob);
  await page.locator('#playerGrade').selectOption(testData.playerGrade);
  await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();

  // Fill optional school field if provided
  if (testData.playerSchool) {
    await page.locator('#playerSchool').fill(testData.playerSchool);
  }

  // Fill contact info (required)
  await page.locator('#parentEmail').fill(testData.parentEmail);
  await page.locator('#parentPhone').fill(testData.parentPhone);

  // Fill optional parent/guardian info
  if (testData.parentFirstName) {
    await page.locator('#parentFirstName').fill(testData.parentFirstName);
  }
  if (testData.parentLastName) {
    await page.locator('#parentLastName').fill(testData.parentLastName);
  }
  if (testData.relationship) {
    await page.locator('#relationship').selectOption(testData.relationship);
  }
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

      // Click a session row to open the registration modal
      await openRegistrationModal(page);

      // Fill the form
      await fillRegistrationForm(page, testData);

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
    // Open the modal
    await openRegistrationModal(page);

    // Try to submit without filling any fields
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Browser validation should prevent submission - form should still be visible
    await expect(page.locator('#playerFirstName')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Open the modal
    await openRegistrationModal(page);

    // Fill all required fields with an invalid email
    const testData = generateTryoutData(0);
    await page.locator('#playerFirstName').fill(testData.playerFirstName);
    await page.locator('#playerLastName').fill(testData.playerLastName);
    await page.locator('#playerDob').fill(testData.playerDob);
    await page.locator('#playerGrade').selectOption(testData.playerGrade);
    await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();
    await page.locator('#parentEmail').fill('invalid-email'); // Invalid email
    await page.locator('#parentPhone').fill(testData.parentPhone);

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
  test('should maintain form data within modal', async ({ page }) => {
    await setupTryoutApiMocks(page);
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Open the modal
    await openRegistrationModal(page);

    // Fill some fields
    const testData = generateTryoutData(0);
    await page.locator('#playerFirstName').fill(testData.playerFirstName);
    await page.locator('#playerLastName').fill(testData.playerLastName);
    await page.locator('#parentEmail').fill(testData.parentEmail);

    // Verify data is still there
    await expect(page.locator('#playerFirstName')).toHaveValue(testData.playerFirstName);
    await expect(page.locator('#playerLastName')).toHaveValue(testData.playerLastName);
    await expect(page.locator('#parentEmail')).toHaveValue(testData.parentEmail);
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

      // Open the modal
      await openRegistrationModal(page);

      // Fill form
      await page.locator('#playerFirstName').fill(testData.playerFirstName);
      await page.locator('#playerLastName').fill(testData.playerLastName);
      await page.locator('#playerDob').fill(testData.playerDob);
      await page.locator('#playerGrade').selectOption(grade);
      await page.locator(`input[name="playerGender"][value="${testData.playerGender}"]`).check();
      await page.locator('#parentEmail').fill(testData.parentEmail);
      await page.locator('#parentPhone').fill(testData.parentPhone);

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

    // Open the modal
    await openRegistrationModal(page);

    // Form should be visible and usable inside the modal
    await expect(page.locator('#playerFirstName')).toBeVisible();
    await expect(page.locator('#parentEmail')).toBeVisible();
    await expect(page.getByRole('button', { name: /Complete Registration/i })).toBeVisible();
  });
});
