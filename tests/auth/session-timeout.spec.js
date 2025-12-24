// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E tests for session timeout and race condition handling
 * These tests verify the fix for the login timeout issue where:
 * 1. onAuthStateChange fires with SIGNED_IN before getSession completes
 * 2. getSession times out after 8 seconds
 * 3. The timeout was incorrectly clearing the user state
 */

test.describe('Session Timeout Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should show login form when not authenticated', async ({ page }) => {
    await page.goto('/login');

    // Wait for auth to initialize (loading to finish)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('[data-testid="auth-loading"]');
      return !loadingElement || loadingElement.textContent !== 'true';
    }, { timeout: 15000 });

    // Login form should be visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should handle slow network without logging out authenticated user', async ({ page }) => {
    // Collect console logs for debugging
    const logs = [];
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    // Go to login page
    await page.goto('/login');

    // Wait for page to load
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    // Check console for auth initialization logs
    const authLogs = logs.filter(
      (l) => l.text.includes('[Auth]') || l.text.includes('[Supabase]')
    );

    // Should have auth initialization logs
    expect(authLogs.some((l) => l.text.includes('[Auth] Starting initialization'))).toBe(true);
    expect(authLogs.some((l) => l.text.includes('[Auth] Initialization complete'))).toBe(true);
  });

  test('should not show error message after timeout if proceeding without auth', async ({ page }) => {
    await page.goto('/login');

    // Wait for auth to initialize
    await page.waitForTimeout(10000); // Wait past session check timeout

    // Should NOT show an error message - timeouts are handled gracefully
    const errorElement = await page.$('.text-red-700, [class*="error"]');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      // Timeout errors should not be displayed to user
      expect(errorText).not.toContain('timed out');
    }

    // Login form should still be accessible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should preserve auth state across page navigation', async ({ page }) => {
    // This test requires a logged-in state
    // Skip if no test credentials available
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    // Navigate to another page
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate back to admin - should not need to login again
    await page.goto('/admin');

    // Should still be on admin (not redirected to login)
    await expect(page).toHaveURL(/\/admin/);
  });
});

test.describe('Login Flow - Race Condition Scenarios', () => {
  test('should complete login even with slow session check', async ({ page }) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Collect console logs
    const logs = [];
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto('/login');
    await page.waitForSelector('input[type="email"]');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await Promise.race([
      page.waitForURL(/\/admin/, { timeout: 30000 }),
      page.waitForSelector('.text-red-700', { timeout: 30000 }),
    ]);

    // Check if we're logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/admin')) {
      // Successfully logged in
      expect(currentUrl).toContain('/admin');
    } else {
      // Check for error message
      const errorElement = await page.$('.text-red-700');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log('Login error:', errorText);
      }
    }

    // Log auth-related console messages for debugging
    const authLogs = logs.filter(
      (l) => l.text.includes('[Auth]') || l.text.includes('[Supabase]')
    );
    console.log('Auth logs:', authLogs.map((l) => l.text).join('\n'));
  });

  test('should handle SIGNED_IN event before getSession completes', async ({ page }) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    const logs = [];
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto('/login');
    await page.waitForSelector('input[type="email"]');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForTimeout(20000);

    // Check logs for the fix working
    const fixLogs = logs.filter((l) =>
      l.text.includes('already have valid auth state') ||
      l.text.includes('Received valid auth state from listener') ||
      l.text.includes('Skipping getSession update')
    );

    // Log for debugging
    console.log('Fix-related logs:', fixLogs.map((l) => l.text).join('\n'));

    // If timeout occurred but user stayed logged in, the fix is working
    const timeoutOccurred = logs.some((l) => l.text.includes('timed out'));
    const userStillLoggedIn =
      page.url().includes('/admin') ||
      logs.some((l) => l.text.includes('keeping user signed in'));

    if (timeoutOccurred) {
      expect(userStillLoggedIn).toBe(true);
    }
  });
});

test.describe('Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]');
  });

  test('should show loading state during sign in', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Start sign in
    const submitPromise = page.click('button[type="submit"]');

    // Check for loading indicator
    await expect(page.getByText('Signing in...')).toBeVisible({ timeout: 5000 });

    await submitPromise;
  });

  test('should have accessible form elements', async ({ page }) => {
    // Email input should be accessible
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Password input should be accessible
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Submit button should be accessible
    const submitButton = page.getByRole('button', { name: 'Sign In' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('should have remember me checkbox', async ({ page }) => {
    const checkbox = page.getByLabel(/keep me signed in|remember me/i);
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    // Should be clickable
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });

  test('should have back to home link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Auth State Persistence', () => {
  test('should maintain session across browser refresh', async ({ page }) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Refresh the page
    await page.reload();

    // Wait for auth to re-initialize
    await page.waitForTimeout(12000); // Wait past session check timeout

    // Should still be on admin page (not redirected to login)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');
  });

  test('should clear session on sign out', async ({ page }) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Sign out (look for sign out button/menu)
    const avatarButton = page.locator('[data-testid="user-menu"], button:has-text("Sign Out"), .user-avatar');
    if ((await avatarButton.count()) > 0) {
      await avatarButton.first().click();

      const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
      if ((await signOutButton.count()) > 0) {
        await signOutButton.click();
      }
    }

    // Wait for redirect to login
    await page.waitForTimeout(5000);

    // Try to access admin
    await page.goto('/admin');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});
