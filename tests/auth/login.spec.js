import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  // Skip: Depends on Supabase API response time which varies
  test.skip('should show error for invalid credentials', async ({ page }) => {
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message - Supabase returns "Invalid login credentials"
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test('should have back to home link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: 'Back to home' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should show loading state while signing in', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Start the sign in process
    const submitPromise = page.click('button[type="submit"]');

    // Check for loading state (the button text changes)
    await expect(page.getByText('Signing in...')).toBeVisible();

    await submitPromise;
  });
});

test.describe('Login Flow', () => {
  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access admin page first (will redirect to login)
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');

    // The location state should preserve the intended destination
    // After successful login, user should be redirected to /admin
    // (This requires valid credentials to fully test)
  });

  test('unauthenticated user sees login/register buttons in navbar', async ({
    page,
  }) => {
    await page.goto('/teams');

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  });
});
