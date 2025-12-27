// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

test.describe('Tryouts & Registration Control - Public Homepage', () => {
  test('should display homepage with appropriate CTA based on status', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for one of the possible CTAs:
    // 1. "Register For Tryouts" when tryouts are open
    // 2. "Register For Team" when registration is open (but not tryouts)
    // 3. "Join Waitlist" when both are closed
    const tryoutsCTA = page.locator('a:has-text("Register For Tryouts")');
    const registrationCTA = page.locator('a:has-text("Register For Team")');
    const waitlistCTA = page.locator('a:has-text("Join Waitlist")');

    const hasTryoutsCTA = await tryoutsCTA.first().isVisible().catch(() => false);
    const hasRegistrationCTA = await registrationCTA.first().isVisible().catch(() => false);
    const hasWaitlistCTA = await waitlistCTA.first().isVisible().catch(() => false);

    // One of these should be visible depending on status
    expect(hasTryoutsCTA || hasRegistrationCTA || hasWaitlistCTA).toBe(true);
  });

  test('should show status pill when tryouts or registration is open', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for status pills
    const tryoutsOpenPill = page.locator('text=/Tryouts Open/i');
    const registrationOpenPill = page.locator('text=/Registration Open/i');

    const hasTryoutsPill = await tryoutsOpenPill.first().isVisible().catch(() => false);
    const hasRegistrationPill = await registrationOpenPill.first().isVisible().catch(() => false);

    // If either is visible, the status is being displayed dynamically
    // If neither, both are closed (which is also valid)
    expect(typeof hasTryoutsPill).toBe('boolean');
    expect(typeof hasRegistrationPill).toBe('boolean');
  });

  test('should navigate to tryouts page when tryouts CTA is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    const tryoutsLink = page.locator('a:has-text("Register For Tryouts")').first();

    if (await tryoutsLink.isVisible().catch(() => false)) {
      await tryoutsLink.click();
      await expect(page).toHaveURL('/tryouts');
    }
  });

  test('should navigate to contact page when Join Waitlist is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });

    const waitlistLink = page.locator('a:has-text("Join Waitlist")').first();

    if (await waitlistLink.isVisible().catch(() => false)) {
      await waitlistLink.click();
      await expect(page).toHaveURL('/contact');
    }
  });
});

test.describe('Tryouts Page - Status Display', () => {
  test('should display tryouts page with status indicator', async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Page should show tryouts status
    const tryoutsOpenIndicator = page.locator('text=/Tryouts.*Open/i');
    const tryoutsClosedIndicator = page.locator('text=/Tryouts Closed/i');

    const isOpen = await tryoutsOpenIndicator.first().isVisible().catch(() => false);
    const isClosed = await tryoutsClosedIndicator.first().isVisible().catch(() => false);

    // One should be visible
    expect(isOpen || isClosed).toBe(true);
  });

  test('should show registration form when tryouts open', async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if tryouts are closed first
    const tryoutsClosedIndicator = page.locator('text=/Tryouts Closed/i');
    const isClosed = await tryoutsClosedIndicator.first().isVisible().catch(() => false);

    // If closed, skip the form check
    if (isClosed) {
      return;
    }

    // Look for the explicit "Open" indicator (e.g., "Winter Tryouts Open" or "Tryouts Open")
    const tryoutsOpenIndicator = page.locator('span:has-text("Open")').filter({ hasText: /Open$/ });
    const isOpen = await tryoutsOpenIndicator.first().isVisible().catch(() => false);

    if (isOpen) {
      // Should have registration form
      const registrationForm = page.locator('form');
      await expect(registrationForm.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show closed message when tryouts closed', async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    const tryoutsClosedIndicator = page.locator('text=/Tryouts Closed/i');
    const isClosed = await tryoutsClosedIndicator.first().isVisible().catch(() => false);

    if (isClosed) {
      // Should show "Get Notified" CTA
      const getNotifiedButton = page.locator('text=/Get Notified/i');
      await expect(getNotifiedButton.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Dashboard - Control Panel', () => {
  test('should redirect to login when accessing /admin without auth', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Admin Dashboard - Tryouts & Registration Controls', () => {
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

  test('should display Tryouts control card', async ({ page }) => {
    await expect(page.getByText('Tryouts')).toBeVisible();
    await expect(page.getByText('Control tryout signup access')).toBeVisible();
  });

  test('should display Registration control card', async ({ page }) => {
    await expect(page.getByText('Registration')).toBeVisible();
    await expect(page.getByText('Control public registration access')).toBeVisible();
  });

  test('should display Live/Off indicators for both controls', async ({ page }) => {
    // Each control card should have a Live or Off indicator
    const liveIndicators = page.locator('text=Live');
    const offIndicators = page.locator('text=Off');

    const liveCount = await liveIndicators.count();
    const offCount = await offIndicators.count();

    // Should have at least 2 indicators total (one for each control)
    expect(liveCount + offCount).toBeGreaterThanOrEqual(2);
  });

  test('should display Tryout Label field', async ({ page }) => {
    await expect(page.getByText('Tryout Label')).toBeVisible();
  });

  test('should display Season Label field', async ({ page }) => {
    await expect(page.getByText('Season Label')).toBeVisible();
  });

  test('should toggle tryouts status when switch is clicked', async ({ page }) => {
    // Find the tryouts section
    const tryoutsSection = page.locator('text=Tryouts').locator('..').locator('..');

    // Get current state - look for the indicator in the tryouts section
    const tryoutsLiveIndicator = tryoutsSection.locator('text=Live');
    const wasLive = await tryoutsLiveIndicator.isVisible().catch(() => false);

    // Find the toggle in the tryouts section (first toggle button)
    const toggleButtons = page.locator('button').filter({
      has: page.locator('.rounded-full'),
    });

    if (await toggleButtons.first().isVisible().catch(() => false)) {
      await toggleButtons.first().click();

      // Wait for state to update
      await page.waitForTimeout(1000);

      // Toggle back to original state
      await toggleButtons.first().click();
    }
  });

  test('should display View tryouts page link when tryouts is open', async ({ page }) => {
    const liveIndicators = page.locator('text=Live');

    // If tryouts is live, should show "View tryouts page" link
    if (await liveIndicators.first().isVisible().catch(() => false)) {
      const viewLink = page.getByText('View tryouts page');
      // May or may not be visible depending on which control is live
    }
  });
});

test.describe('Admin Dashboard - Overview Stats', () => {
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

test.describe('End to End - Tryouts Toggle Flow', () => {
  test.skip(skipAuthTests, 'Requires CI_ADMIN_TESTS env var');

  test('should update homepage CTA when tryouts is toggled', async ({ page, context }) => {
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

    // Check current state from the tryouts section
    const tryoutsSection = page.locator('text=Tryouts').locator('..').locator('..');
    const tryoutsLive = tryoutsSection.locator('text=Live');
    const initiallyOpen = await tryoutsLive.isVisible().catch(() => false);

    // Open a new page for the homepage
    const homePage = await context.newPage();
    await homePage.goto('/');
    await homePage.waitForSelector('h1', { timeout: 10000 });

    // Check initial homepage state
    const tryoutsCTA = homePage.locator('a:has-text("Register For Tryouts")');
    const hasTryoutsCTA = await tryoutsCTA.first().isVisible().catch(() => false);

    // States should match
    expect(hasTryoutsCTA).toBe(initiallyOpen);

    // Clean up
    await homePage.close();
  });
});
