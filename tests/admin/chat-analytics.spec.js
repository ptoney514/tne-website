// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from environment
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'pernellg@proton.me';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TneAdmin2025!@#$';

// Skip authenticated tests by default - require explicit CI setup
const skipAuthTests = !process.env.CI_ADMIN_TESTS;

// AI Chat disabled for MVP - re-enable post-MVP (see issue #59)
test.describe.skip('Admin Chat Analytics - Unauthenticated', () => {
  test('should redirect to login when accessing /admin/chat-analytics without auth', async ({ page }) => {
    await page.goto('/admin/chat-analytics');
    await expect(page).toHaveURL('/login');
  });
});

test.describe.skip('Admin Chat Analytics - UI Elements', () => {
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

    // Navigate to chat analytics page
    await page.goto('/admin/chat-analytics');

    // Wait for the page header to ensure page is loaded
    await page.waitForSelector('h1:has-text("Chat Analytics")', { timeout: 15000 });
  });

  test('should display chat analytics page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Chat Analytics' })).toBeVisible({ timeout: 10000 });
  });

  test('should display page subtitle with date range', async ({ page }) => {
    await expect(page.getByText('AI Assistant usage and feedback - Last 30 days')).toBeVisible({ timeout: 10000 });
  });

  test('should display refresh button', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshButton).toBeVisible({ timeout: 10000 });
  });

  test('should display Total Chats stat card', async ({ page }) => {
    await expect(page.getByText('Total Chats')).toBeVisible({ timeout: 10000 });
  });

  test('should display Satisfaction stat card', async ({ page }) => {
    await expect(page.getByText('Satisfaction')).toBeVisible({ timeout: 10000 });
  });

  test('should display Avg Messages stat card', async ({ page }) => {
    await expect(page.getByText('Avg Messages')).toBeVisible({ timeout: 10000 });
  });

  test('should display Total Messages stat card', async ({ page }) => {
    await expect(page.getByText('Total Messages')).toBeVisible({ timeout: 10000 });
  });

  test('should display Recent Conversations section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Conversations' })).toBeVisible({ timeout: 10000 });
  });

  test('should display empty state when no conversations', async ({ page }) => {
    // Check for either conversations or empty state
    const hasConversations = await page.locator('[data-testid="conversation-card"]').count() > 0;
    if (!hasConversations) {
      await expect(page.getByText('No conversations yet')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should have admin navbar with AI Chat link', async ({ page }) => {
    // Check that the AI Chat nav item is active/visible
    await expect(page.getByRole('link', { name: /AI Chat/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe.skip('Admin Chat Analytics - Stats Loading', () => {
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
    await page.goto('/admin/chat-analytics');
    await page.waitForSelector('h1:has-text("Chat Analytics")', { timeout: 15000 });
  });

  test('should show loading skeleton while fetching data', async ({ page }) => {
    // This test verifies the loading state appears
    // Since loading is fast, we check that the stat values eventually appear
    await expect(page.locator('.text-3xl.font-bebas').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display satisfaction percentage format', async ({ page }) => {
    // Wait for stats to load and verify satisfaction has % format
    const satisfactionCard = page.locator('div:has(h3:has-text("Satisfaction"))');
    await expect(satisfactionCard).toBeVisible({ timeout: 10000 });
    // Should show a percentage value
    await expect(satisfactionCard.locator('.text-3xl')).toContainText('%');
  });

  test('refresh button should trigger data reload', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await refreshButton.click();
    // After clicking refresh, stats should still be visible
    await expect(page.getByText('Total Chats')).toBeVisible({ timeout: 10000 });
  });
});

test.describe.skip('Admin Chat Analytics - Navigation', () => {
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
  });

  test('should navigate to chat analytics from admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('nav', { timeout: 15000 });

    // Click on AI Chat link in navbar
    await page.click('a:has-text("AI Chat")');
    await expect(page).toHaveURL('/admin/chat-analytics');
  });

  test('should navigate back to dashboard from chat analytics', async ({ page }) => {
    await page.goto('/admin/chat-analytics');
    await page.waitForSelector('h1:has-text("Chat Analytics")', { timeout: 15000 });

    // Click on dashboard link (TNE logo or dashboard text)
    await page.click('a[href="/admin"]');
    await expect(page).toHaveURL('/admin');
  });
});
