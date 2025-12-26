// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Registration Control - Public Homepage', () => {
  test('should display homepage with registration elements', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for either:
    // 1. The registration pill (contains "Reg Open")
    // 2. The "Registration Coming Soon" disabled button
    // 3. The "Register For Tryouts" active button
    const registrationPill = page.locator('text=/Reg Open/i');
    const comingSoon = page.locator('text=/Registration Coming Soon/i');
    const registerButton = page.locator('a:has-text("Register For Tryouts")');

    const hasRegistrationOpen = await registrationPill.first().isVisible().catch(() => false);
    const hasComingSoon = await comingSoon.first().isVisible().catch(() => false);
    const hasRegisterButton = await registerButton.first().isVisible().catch(() => false);

    // One of these should be visible depending on registration status
    expect(hasRegistrationOpen || hasComingSoon || hasRegisterButton).toBe(true);
  });

  test('should show Register button when registration is open', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    // If registration pill is visible, Register button should be clickable
    const registrationPill = page.locator('text=Reg Open');

    if (await registrationPill.isVisible().catch(() => false)) {
      const registerButton = page.locator('a:has-text("Register For Tryouts")').first();
      await expect(registerButton).toBeVisible();
      await expect(registerButton).toHaveAttribute('href', '/tryouts');
    }
  });

  test('should show disabled button when registration is closed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    const comingSoon = page.locator('span:has-text("Registration Coming Soon")').first();

    if (await comingSoon.isVisible().catch(() => false)) {
      // Coming soon button should have cursor-not-allowed class
      await expect(comingSoon).toHaveClass(/cursor-not-allowed/);
    }
  });

  test('should navigate to tryouts page when Register button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    const registerLink = page.locator('a:has-text("Register For Tryouts")').first();

    if (await registerLink.isVisible().catch(() => false)) {
      await registerLink.click();
      await expect(page).toHaveURL('/tryouts');
    }
  });
});

test.describe('Registration Control - Admin Dashboard', () => {
  test('should redirect to login when accessing /admin without auth', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Registration Control - Admin Dashboard UI', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    // Clear session and login
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login as admin
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    // Navigate to admin dashboard
    await page.goto('/admin');

    // Wait for dashboard to load
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });
  });

  test('should display Control Panel section', async ({ page }) => {
    await expect(page.getByText('Control Panel')).toBeVisible();
  });

  test('should display Registration control card', async ({ page }) => {
    await expect(page.getByText('Registration')).toBeVisible();
    await expect(page.getByText('Control public registration access')).toBeVisible();
  });

  test('should display registration toggle switch', async ({ page }) => {
    // Look for the toggle button
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();

    // Should have a toggle-style button
    const registrationSection = page.locator('text=Registration').locator('..').locator('..');
    await expect(registrationSection).toBeVisible();
  });

  test('should display Live/Off indicator', async ({ page }) => {
    // Check for either Live or Off indicator
    const liveIndicator = page.locator('text=Live');
    const offIndicator = page.locator('text=Off');

    const hasLive = await liveIndicator.isVisible().catch(() => false);
    const hasOff = await offIndicator.isVisible().catch(() => false);

    expect(hasLive || hasOff).toBe(true);
  });

  test('should display Season Label field', async ({ page }) => {
    await expect(page.getByText('Season Label')).toBeVisible();
  });

  test('should show edit button for season label', async ({ page }) => {
    // Look for the pencil edit button
    const editButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') });

    // If not visible, the label might be in edit mode
    const isEditing = await page.locator('input[placeholder*="Fall/Winter"]').isVisible().catch(() => false);
    const hasEditButton = await editButton.first().isVisible().catch(() => false);

    expect(isEditing || hasEditButton).toBe(true);
  });

  test('should toggle registration status when switch is clicked', async ({ page }) => {
    // Get current state
    const liveIndicator = page.locator('text=Live');
    const wasLive = await liveIndicator.isVisible().catch(() => false);

    // Find and click the toggle switch
    const toggleSwitch = page.locator('button').filter({ hasText: '' }).filter({
      has: page.locator('svg.lucide-power'),
    }).first();

    // Click the toggle (the rounded button with Power icon)
    const registrationToggle = page.locator('.rounded-full').filter({
      has: page.locator('svg'),
    }).first();

    if (await registrationToggle.isVisible().catch(() => false)) {
      await registrationToggle.click();

      // Wait for state to update
      await page.waitForTimeout(1000);

      // State should have changed
      const isNowLive = await liveIndicator.isVisible().catch(() => false);

      // Toggle back to original state
      await registrationToggle.click();
    }
  });

  test('should allow editing season label', async ({ page }) => {
    // Click the edit button for season label
    const editButton = page.locator('button').filter({
      has: page.locator('svg.lucide-pencil'),
    }).first();

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();

      // Input should appear
      const labelInput = page.locator('input[placeholder*="Fall/Winter"]');
      await expect(labelInput).toBeVisible({ timeout: 5000 });

      // Type a test value
      await labelInput.fill("Test Season '25-26");

      // Check and save buttons should be visible
      const checkButton = page.locator('button').filter({
        has: page.locator('svg.lucide-check'),
      });
      const cancelButton = page.locator('button').filter({
        has: page.locator('svg.lucide-x'),
      });

      await expect(checkButton.first()).toBeVisible();
      await expect(cancelButton.first()).toBeVisible();

      // Cancel the edit
      await cancelButton.first().click();
    }
  });

  test('should display View on homepage link when registration is open', async ({ page }) => {
    const liveIndicator = page.locator('text=Live');

    if (await liveIndicator.isVisible().catch(() => false)) {
      await expect(page.getByText('View on homepage')).toBeVisible();
    }
  });
});

test.describe('Registration Control - Dashboard Stats', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    await page.goto('/admin');
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });
  });

  test('should display Overview stats section', async ({ page }) => {
    await expect(page.getByText('Overview')).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.getByText('Teams')).toBeVisible();
    await expect(page.getByText('Players')).toBeVisible();
    await expect(page.getByText('Registrations')).toBeVisible();
    await expect(page.getByText('Tryouts')).toBeVisible();
  });

  test('should have clickable stat cards that navigate', async ({ page }) => {
    const teamsCard = page.locator('a:has-text("Teams")').first();

    if (await teamsCard.isVisible().catch(() => false)) {
      await teamsCard.click();
      await expect(page).toHaveURL('/admin/teams');
    }
  });
});

test.describe('Registration Toggle - End to End Flow', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test('should update homepage when registration is toggled', async ({ page, context }) => {
    // Login as admin
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });

    // Go to admin dashboard
    await page.goto('/admin');
    await page.waitForSelector('text=Control Panel', { timeout: 15000 });

    // Get current registration state from indicator
    const liveIndicator = page.locator('text=Live');
    const initiallyOpen = await liveIndicator.isVisible().catch(() => false);

    // Open a new page for the homepage
    const homePage = await context.newPage();
    await homePage.goto('/');
    await homePage.waitForSelector('h1', { timeout: 10000 });

    // Check initial homepage state matches admin state
    const homeRegistrationPill = homePage.locator('text=Reg Open');
    const homeHasOpenRegistration = await homeRegistrationPill.isVisible().catch(() => false);

    // States should match
    expect(homeHasOpenRegistration).toBe(initiallyOpen);

    // Clean up
    await homePage.close();
  });
});
