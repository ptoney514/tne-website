// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Login Page Navigation Tests
 *
 * Lightweight navigation tests for the login page. No credentials required.
 * Designed to run against Vercel preview deployments in CI.
 */

test.describe('Login Page Navigation', () => {
  test('navbar links on login page all have valid hrefs', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const navLinks = page.locator('nav a');
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute('href');
      expect(href, `nav link at index ${i} should have an href`).not.toBeUndefined();
      expect(href, `nav link at index ${i} should not be empty`).not.toBe('');
    }
  });

  test('back to home link works', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // The logo link in the navbar has href="/"
    const logoLink = page.locator('nav a[href="/"]').first();
    await logoLink.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('sign up link is visible and points to /signup', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const signUpLink = page.locator('a[href="/signup"]', { hasText: /Sign up|Create account/i });
    await expect(signUpLink).toBeVisible();

    const href = await signUpLink.getAttribute('href');
    expect(href).toBe('/signup');
  });

  test('forgot password link is visible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const forgotLink = page.getByRole('link', { name: /Forgot password/i });
    await expect(forgotLink).toBeVisible();
  });

  test('empty form submission is blocked', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const signInButton = page.getByRole('button', { name: /Sign In/i });
    await signInButton.click();

    // HTML5 required validation prevents submission; URL stays on /login
    await expect(page).toHaveURL(/\/login/);
  });
});
