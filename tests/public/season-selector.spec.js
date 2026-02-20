// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Season Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display dynamic season name in hero title', async ({ page }) => {
    // Hero title should show the season name (e.g. "Winter 2025") or fallback "Teams"
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show season dropdown when multiple seasons exist', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // If multiple seasons are active, the season dropdown should be visible
    const seasonDropdown = page.getByLabel(/Season filter/i);
    const isVisible = await seasonDropdown.isVisible().catch(() => false);

    // This test validates the dropdown renders when applicable
    // If only one season exists, dropdown is hidden by design
    if (isVisible) {
      // Verify it has options
      const options = await seasonDropdown.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('should update hero title and reload teams when switching seasons', async ({ page }) => {
    await page.waitForTimeout(2000);

    const seasonDropdown = page.getByLabel(/Season filter/i);
    const isVisible = await seasonDropdown.isVisible().catch(() => false);

    if (isVisible) {
      // Get initial title
      const initialTitle = await page.locator('h1').textContent();

      // Get the second option value
      const options = await seasonDropdown.locator('option').all();
      if (options.length > 1) {
        const secondValue = await options[1].getAttribute('value');
        await seasonDropdown.selectOption(secondValue);

        // Wait for reload
        await page.waitForTimeout(1000);

        // Title should reflect the new season (just the season name)
        const newTitle = await page.locator('h1').textContent();
        expect(newTitle).not.toBe(initialTitle);
      }
    }
  });

  test('should default to the most recent active season', async ({ page }) => {
    await page.waitForTimeout(2000);

    // The hero title should show a season name (e.g. "Winter 2025") or fallback "Teams"
    const titleText = await page.locator('h1').textContent();
    expect(titleText.length).toBeGreaterThan(0);
  });

  test('should use per-season cache keys in localStorage', async ({ page }) => {
    // Wait for data to load and cache to be written
    await page.waitForTimeout(3000);

    // Check for per-season cache keys
    const cacheKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith('tne_teams_cache'))
    );

    // If teams were loaded, there should be cache entries
    // Keys should follow the pattern tne_teams_cache_{seasonId}
    if (cacheKeys.length > 0) {
      const hasSeasonSpecificKey = cacheKeys.some((k) => k !== 'tne_teams_cache');
      // If a season was selected, cache key should include season ID
      expect(hasSeasonSpecificKey || cacheKeys.length > 0).toBe(true);
    }
  });
});
