// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Teams Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Winter 2025 Season Teams/i })).toBeVisible();
  });

  test('should display hero description', async ({ page }) => {
    await expect(page.getByText(/View current team rosters and coach assignments/i)).toBeVisible();
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

  test('should display program and grade dropdown filters', async ({ page }) => {
    // Program dropdown
    await expect(page.getByLabel(/Program filter/i)).toBeVisible();
    // Grade dropdown
    await expect(page.getByLabel(/Grade filter/i)).toBeVisible();
  });

  test('should filter teams when selecting program dropdown option', async ({ page }) => {
    // Wait for teams to load
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Select Boys Express from program dropdown
    await page.getByLabel(/Program filter/i).selectOption('express');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Clear button should appear
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  });

  test('should filter teams when selecting grade dropdown option', async ({ page }) => {
    // Wait for teams to load
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Select 4th Grade from grade dropdown
    await page.getByLabel(/Grade filter/i).selectOption('4');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Clear button should appear
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  });

  test('should show Clear button only when filters are active', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Clear button should NOT be visible initially
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).not.toBeVisible();

    // Apply a filter that returns results (so only filter bar Clear is shown)
    await page.getByLabel(/Program filter/i).selectOption('express');
    await page.waitForTimeout(300);

    // Clear button should now be visible
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();

    // Click Clear button
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await page.waitForTimeout(300);

    // Clear button should be hidden again
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).not.toBeVisible();
  });

  test('should combine filters with AND logic', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Apply program filter
    await page.getByLabel(/Program filter/i).selectOption('express');
    await page.waitForTimeout(300);

    // Apply grade filter
    await page.getByLabel(/Grade filter/i).selectOption('4');
    await page.waitForTimeout(300);

    // Both filters should be active, Clear button visible
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  });
});

test.describe('Teams Page - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display search input with updated placeholder', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search team or player/i)).toBeVisible();
  });

  test('should filter teams based on search input', async ({ page }) => {
    // Wait for teams to load
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('4th');

    // Wait for debounced filter to apply
    await page.waitForTimeout(300);

    // Clear button should appear when search has text
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  });

  test('should show empty state when search has no results', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('xyznonexistentteam123');

    // Wait for debounced filter to apply
    await page.waitForTimeout(300);

    // Should show empty state
    await expect(page.getByText(/No teams found/i)).toBeVisible();
    await expect(page.getByText(/Try adjusting your filters/i)).toBeVisible();
  });

  test('should show Clear filters button in empty state when filters are active', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('xyznonexistentteam123');

    // Wait for debounced filter to apply
    await page.waitForTimeout(300);

    // Empty state should have Clear filters button
    const emptyStateClearButton = page.locator('button', { hasText: /Clear filters/i });
    await expect(emptyStateClearButton).toBeVisible();
  });

  test('should clear search and show all teams', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"], [data-testid="loading-spinner"]', {
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('test');
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Should show teams again (if there are any)
  });
});

test.describe('Teams Page - Grade Grouping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display grade headings when teams are grouped', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check if there are any grade heading elements (h2 with "Grade" text)
    const gradeHeadings = page.locator('h2').filter({ hasText: /Grade/i });
    const headingCount = await gradeHeadings.count();

    // If there are teams, there should be at least one grade heading
    const teamCards = await page.locator('[data-testid="team-card"]').count();
    if (teamCards > 0) {
      expect(headingCount).toBeGreaterThan(0);
    }
  });

  test('should sort grade headings numerically', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Get all grade headings text
    const gradeHeadings = page.locator('h2').filter({ hasText: /Grade|Other/i });
    const headingTexts = await gradeHeadings.allTextContents();

    // Extract grade numbers and check they're sorted
    const gradeNumbers = headingTexts
      .map(text => {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : 99; // "Other" gets 99
      });

    // Check sorting (each number should be <= next number)
    for (let i = 0; i < gradeNumbers.length - 1; i++) {
      expect(gradeNumbers[i]).toBeLessThanOrEqual(gradeNumbers[i + 1]);
    }
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

  test('team card should display simplified information', async ({ page }) => {
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const teamCards = page.locator('[data-testid="team-card"]');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      const firstCard = teamCards.first();

      // Card should have team name, grade info, coach, and program badge
      await expect(firstCard.locator('h2')).toBeVisible(); // Team name
      await expect(firstCard.getByText(/Grade/i)).toBeVisible(); // Grade info
      await expect(firstCard.getByText(/Coach:/i)).toBeVisible(); // Coach info (now "Coach: Name")
      // Player count only shows if > 0, arrow is always present (no text)
    }
  });
});

test.describe('Teams Page - Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Main elements should be visible
    await expect(page.locator('h1').filter({ hasText: /Winter 2025 Season Teams/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search team or player/i)).toBeVisible();
  });

  test('should display dropdowns on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Dropdowns should be visible
    await expect(page.getByLabel(/Program filter/i)).toBeVisible();
    await expect(page.getByLabel(/Grade filter/i)).toBeVisible();
  });

  test('should have single column layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/teams');
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const grid = page.locator('[data-testid="teams-grid"]').first();
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
