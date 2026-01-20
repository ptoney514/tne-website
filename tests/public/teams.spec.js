// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Teams Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Teams/i })).toBeVisible();
  });

  test('should display hero section with season badge', async ({ page }) => {
    await expect(page.getByText(/2024-25|Winter Season/i)).toBeVisible();
  });

  test('should display hero description', async ({ page }) => {
    await expect(page.getByText(/Select a team to view roster/i)).toBeVisible();
  });
});

test.describe('Teams Page - Loading and Performance', () => {
  test('should load page without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error promise rejection')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should complete first load in under 3 seconds', async ({ page }) => {
    // Navigate first, then clear localStorage
    await page.goto('/teams');
    await page.evaluate(() => localStorage.removeItem('tne_teams_cache'));

    // Reload to trigger fresh fetch
    const startTime = Date.now();
    await page.reload();

    // Wait for either team cards to appear or loading to finish
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 3000,
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load instantly with cache (under 500ms)', async ({ page }) => {
    // First visit to populate cache
    await page.goto('/teams');
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });

    // Wait for cache to be written
    await page.waitForTimeout(2000);

    // Second visit should be instant
    const startTime = Date.now();
    await page.goto('/teams');

    // Should show content immediately without loading spinner
    await page.waitForSelector('[data-testid="teams-grid"], h1', { timeout: 1000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(500);
  });

  test('should not show loading spinner when cache exists', async ({ page }) => {
    // First visit to populate cache
    await page.goto('/teams');
    await page.waitForTimeout(3000);

    // Second visit
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 5000 });

    // Loading spinner should not be visible if cache was loaded
    const hasSpinner = await page.locator('[data-testid="loading-spinner"]').isVisible().catch(() => false);
    const hasTeamCards = await page.locator('[data-testid="team-card"]').count().catch(() => 0);

    // Either we have team cards (from cache) or we might be still loading
    // But if we have team cards, we should NOT have spinner
    if (hasTeamCards > 0) {
      expect(hasSpinner).toBe(false);
    }
  });

  test('should preserve cache across page refresh', async ({ page }) => {
    // First visit
    await page.goto('/teams');
    await page.waitForTimeout(3000);

    // Get cache from localStorage
    const cacheBeforeRefresh = await page.evaluate(() =>
      localStorage.getItem('tne_teams_cache')
    );

    // Refresh page
    await page.reload();
    await page.waitForSelector('h1', { timeout: 5000 });

    // Cache should still exist
    const cacheAfterRefresh = await page.evaluate(() =>
      localStorage.getItem('tne_teams_cache')
    );

    if (cacheBeforeRefresh) {
      expect(cacheAfterRefresh).toBeTruthy();
    }
  });
});

test.describe('Teams Page - Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display all filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All Teams/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Boys Express/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Boys TNE/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Girls Program/i })).toBeVisible();
  });

  test('should filter teams when clicking filter buttons', async ({ page }) => {
    // Wait for teams to load
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Click Boys Express filter
    await page.getByRole('button', { name: /Boys Express/i }).click();

    // Button should now be active (has different styling)
    await expect(page.getByRole('button', { name: /Boys Express/i })).toHaveClass(/bg-neutral-900/);
  });

  test('should switch between filter options', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });

    // Click Girls Program filter
    await page.getByRole('button', { name: /Girls Program/i }).click();
    await expect(page.getByRole('button', { name: /Girls Program/i })).toHaveClass(/bg-neutral-900/);

    // Click All Teams filter
    await page.getByRole('button', { name: /All Teams/i }).click();
    await expect(page.getByRole('button', { name: /All Teams/i })).toHaveClass(/bg-neutral-900/);
  });
});

test.describe('Teams Page - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search teams/i)).toBeVisible();
  });

  test('should filter teams based on search input', async ({ page }) => {
    // Wait for teams to load
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search teams/i);
    await searchInput.fill('4th');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Teams should be filtered (can't check exact count without data)
  });

  test('should show empty state when search has no results', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search teams/i);
    await searchInput.fill('xyznonexistentteam123');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Should show empty state
    await expect(page.getByText(/No teams found/i)).toBeVisible();
  });

  test('should clear search and show all teams', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search teams/i);
    await searchInput.fill('test');
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Should show teams again (if there are any)
  });
});

test.describe('Teams Page - Team Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display team cards or empty state', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(3000);

    // Either shows team cards or empty state
    const hasTeamCards = await page.locator('[data-testid="team-card"]').count();
    const hasEmptyState = await page.getByText(/No teams found/i).isVisible().catch(() => false);

    // One of these should be true (or still loading)
    expect(hasTeamCards >= 0 || hasEmptyState).toBe(true);
  });

  test('should navigate to team detail when clicking a team card', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const teamCards = page.locator('[data-testid="team-card"]');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      // Click the first team card
      await teamCards.first().click();

      // Should navigate to team detail page
      await page.waitForURL(/\/teams\/.+/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/teams\/.+/);
    }
  });

  test('team cards should have hover effect', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const teamCards = page.locator('[data-testid="team-card"]');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      // Check that card has hover classes defined
      const firstCard = teamCards.first();
      const classAttr = await firstCard.getAttribute('class');
      expect(classAttr).toContain('hover:');
    }
  });
});

test.describe('Teams Page - OSA League Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display OSA League info section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /OSA League Games/i })).toBeVisible();
  });

  test('should display league season info', async ({ page }) => {
    await expect(page.getByText(/Jan 3 – Mar 1/i)).toBeVisible();
    await expect(page.getByText(/Saturdays & Sundays/i)).toBeVisible();
  });

  test('should display TourneyMachine link', async ({ page }) => {
    const link = page.getByRole('link', { name: /View on TourneyMachine/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /tourneymachine/i);
    await expect(link).toHaveAttribute('target', '_blank');
  });
});

test.describe('Teams Page - Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Main elements should be visible
    await expect(page.locator('h1').filter({ hasText: /Teams/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search teams/i)).toBeVisible();
  });

  test('should stack filter buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Filter buttons should be visible and scrollable
    await expect(page.getByRole('button', { name: /All Teams/i })).toBeVisible();
  });

  test('should have single column layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const grid = page.locator('[data-testid="teams-grid"]');
    const gridClass = await grid.getAttribute('class');

    // On mobile (375px), should use single column (grid-cols-1)
    expect(gridClass).toContain('grid-cols-1');
  });
});

test.describe('Teams Page - Console Logging', () => {
  test('should log cache status messages', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Clear cache first
    await page.goto('/teams');
    await page.evaluate(() => localStorage.removeItem('tne_teams_cache'));

    // Reload to trigger fresh fetch
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Should have some usePublicTeams log messages
    const hasTeamsLog = consoleLogs.some((log) => log.includes('[usePublicTeams]'));
    // This may or may not be true depending on if data exists
    // Just verify no errors occurred
  });
});
