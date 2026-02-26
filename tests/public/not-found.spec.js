// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Custom 404 Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display custom 404 page on nonexistent routes', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Page Not Found');
  });

  test('should display basketball visual element', async ({ page }) => {
    await expect(page.locator('[data-testid="basketball-visual"]')).toBeVisible();
    await expect(page.locator('[data-testid="basketball-visual"] svg')).toBeVisible();
  });

  test('should display Out of Bounds label', async ({ page }) => {
    await expect(page.locator('[data-testid="out-of-bounds-label"]')).toBeVisible();
  });

  test('should have link to homepage', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /Back to Home Court/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('should have link to contact page', async ({ page }) => {
    const contactLink = page.getByRole('link', { name: /Contact Us/i });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', '/contact');
  });

  test('should navigate to homepage when clicking home button', async ({ page }) => {
    await page.getByRole('link', { name: /Back to Home Court/i }).click();
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test('should navigate to contact page when clicking contact button', async ({ page }) => {
    await page.getByRole('link', { name: /Contact Us/i }).click();
    await page.waitForURL('/contact', { timeout: 5000 });
    expect(page.url()).toMatch(/\/contact$/);
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/another-nonexistent-page');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error promise rejection')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
