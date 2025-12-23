import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login when accessing /admin', async ({
    page,
  }) => {
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should show login page with sign in form after redirect', async ({
    page,
  }) => {
    await page.goto('/admin');

    // After redirect, should see login form
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});

test.describe('Public Routes', () => {
  test('home page should be accessible without auth', async ({ page }) => {
    await page.goto('/');

    // Should not redirect
    await expect(page).toHaveURL('/');
  });

  test('teams page should be accessible without auth', async ({ page }) => {
    await page.goto('/teams');

    // Should not redirect
    await expect(page).toHaveURL('/teams');
  });

  test('login page should be accessible without auth', async ({ page }) => {
    await page.goto('/login');

    // Should not redirect
    await expect(page).toHaveURL('/login');
  });
});
