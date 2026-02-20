// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Winter 2025 Teams Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    // Clear cache to ensure fresh data
    await page.evaluate(() => localStorage.removeItem('tne_teams_cache'));
    await page.reload();
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('should display 9 team cards total', async ({ page }) => {
    const teamCards = page.locator('[data-testid="team-card"]');
    await expect(teamCards).toHaveCount(9);
  });

  test('should display correct grade groupings', async ({ page }) => {
    const gradeHeadings = page.locator('h2').filter({ hasText: /Grade/i });
    const texts = await gradeHeadings.allTextContents();
    // Should have 5 groups: 4th, 5th, 6th, 7th, 8th
    expect(texts).toHaveLength(5);
    expect(texts[0]).toContain('4th');
    expect(texts[1]).toContain('5th');
    expect(texts[2]).toContain('6th');
    expect(texts[3]).toContain('7th');
    expect(texts[4]).toContain('8th');
  });

  test('should have 2 teams in 4th grade group', async ({ page }) => {
    // Find the 4th Grade section and count its team cards
    // The structure is: h2 "4th Grade" followed by a grid with team cards
    const fourthGradeCards = page.locator('[data-testid="team-card"]').filter({ hasText: /4th/i });
    // We need a different approach - filter team cards by grade text
    const allCards = page.locator('[data-testid="team-card"]');
    const count = await allCards.count();
    let fourthGradeCount = 0;
    for (let i = 0; i < count; i++) {
      const text = await allCards.nth(i).textContent();
      if (text.includes('4th Grade')) fourthGradeCount++;
    }
    expect(fourthGradeCount).toBe(2);
  });

  test('should show Coach Foster for the 4th Foster team', async ({ page }) => {
    const fosterCard = page.locator('[data-testid="team-card"]').filter({ hasText: /Foster/ });
    await expect(fosterCard.first()).toContainText('Coach: Foster');
  });

  test('should show correct player counts', async ({ page }) => {
    // Check Perry team has 11 players
    const perryCard = page.locator('[data-testid="team-card"]').filter({ hasText: /Perry/ });
    await expect(perryCard).toContainText('11 players');

    // Check Mitchell 8th has 8 players
    const mitchell8thCard = page.locator('[data-testid="team-card"]').filter({ hasText: /8th - Mitchell/ });
    await expect(mitchell8thCard).toContainText('8 players');
  });

  test('search "Mitchell" should return 2 teams', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('Mitchell');
    await page.waitForTimeout(300);

    const teamCards = page.locator('[data-testid="team-card"]');
    await expect(teamCards).toHaveCount(2);
  });

  test('search "Foster" should return 1 team', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search team or player/i);
    await searchInput.fill('Foster');
    await page.waitForTimeout(300);

    const teamCards = page.locator('[data-testid="team-card"]');
    await expect(teamCards).toHaveCount(1);
  });
});

test.describe('Girls Program Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.evaluate(() => localStorage.removeItem('tne_teams_cache'));
    await page.reload();
    await page.waitForSelector('[data-testid="teams-grid"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('should show friendly message when Girls Program filter is active', async ({ page }) => {
    await page.getByLabel(/Program filter/i).selectOption('girls');
    await page.waitForTimeout(300);

    await expect(page.getByText(/Girls teams are being formed/i)).toBeVisible();
    await expect(page.getByText(/Check back soon/i)).toBeVisible();
  });

  test('should show Clear button with Girls Program empty state', async ({ page }) => {
    await page.getByLabel(/Program filter/i).selectOption('girls');
    await page.waitForTimeout(300);

    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  test('should NOT show generic "No teams found" for Girls Program', async ({ page }) => {
    await page.getByLabel(/Program filter/i).selectOption('girls');
    await page.waitForTimeout(300);

    await expect(page.getByText(/No teams found/i)).not.toBeVisible();
  });
});
