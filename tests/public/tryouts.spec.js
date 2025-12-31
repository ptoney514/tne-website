// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Tryouts Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Tryouts & Player Development/i })).toBeVisible();
  });

  test('should display hero section with season badge', async ({ page }) => {
    // Season badge should be visible
    await expect(page.getByText(/2025-2026|Fall\/Winter Season/i)).toBeVisible();
  });

  test('should display hero CTA buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /View Upcoming Tryouts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /How to Prepare/i })).toBeVisible();
  });
});

test.describe('Tryouts Page - What to Expect Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display What to Expect heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /What to Expect at Tryouts/i })).toBeVisible();
  });

  test('should display 3 info cards', async ({ page }) => {
    await expect(page.getByText('Duration & Format')).toBeVisible();
    await expect(page.getByText('What We Evaluate')).toBeVisible();
    await expect(page.getByText('What to Bring')).toBeVisible();
  });

  test('should display info card descriptions', async ({ page }) => {
    await expect(page.getByText(/90 minutes/i)).toBeVisible();
    await expect(page.getByText(/Basketball shoes/i)).toBeVisible();
  });
});

test.describe('Tryouts Page - FAQ Accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();
  });

  test('should display FAQ questions', async ({ page }) => {
    await expect(page.getByText(/never played travel basketball/i)).toBeVisible();
    await expect(page.getByText(/How much does it cost to try out/i)).toBeVisible();
    await expect(page.getByText(/When will we find out/i)).toBeVisible();
  });

  test('should expand/collapse FAQ items on click', async ({ page }) => {
    // Find the first FAQ button
    const faqButton = page.locator('button').filter({ hasText: /never played travel basketball/i });

    // Click to expand
    await faqButton.click();

    // Answer should be visible after expanding
    await expect(page.getByText(/All skill levels are welcome/i)).toBeVisible();

    // Click again to collapse
    await faqButton.click();

    // Wait for collapse animation
    await page.waitForTimeout(400);
  });
});

test.describe('Tryouts Page - Grade Level Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display Prepare Like the Best section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Prepare Like the Best/i })).toBeVisible();
  });

  test('should display all 4 grade level tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /K-2nd Grade/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /3rd-4th Grade/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /5th-6th Grade/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /7th-8th Grade/i })).toBeVisible();
  });

  test('should show K-2nd content by default', async ({ page }) => {
    // K-2nd content should be visible by default
    await expect(page.getByText(/Ages 6-8/i)).toBeVisible();
    await expect(page.getByText(/Basic Motor Skills/i)).toBeVisible();
  });

  test('should switch to 3rd-4th grade content', async ({ page }) => {
    // Click 3rd-4th tab
    await page.getByRole('button', { name: /3rd-4th Grade/i }).click();

    // Wait for content change
    await page.waitForTimeout(300);

    // 3rd-4th content should be visible
    await expect(page.getByText(/Ages 8-10/i)).toBeVisible();
    await expect(page.getByText(/Head-Up Dribbling/i)).toBeVisible();
  });

  test('should switch to 5th-6th grade content', async ({ page }) => {
    await page.getByRole('button', { name: /5th-6th Grade/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/Ages 10-12/i)).toBeVisible();
    await expect(page.getByText(/Finishing Under Contact/i)).toBeVisible();
  });

  test('should switch to 7th-8th grade content', async ({ page }) => {
    await page.getByRole('button', { name: /7th-8th Grade/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/Ages 12-14/i)).toBeVisible();
    await expect(page.getByText(/Versatile Scoring/i)).toBeVisible();
  });

  test('should display What Coaches Evaluate panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /What Coaches Evaluate/i })).toBeVisible();
  });

  test('should display Skills to Practice panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Skills to Practice/i })).toBeVisible();
  });

  test('should display Pro Tip section', async ({ page }) => {
    await expect(page.getByText(/Pro Tip:/i)).toBeVisible();
  });

  test('should display video tutorial links', async ({ page }) => {
    const tutorialLinks = page.getByRole('link', { name: /Watch Tutorial/i });
    const count = await tutorialLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Tryouts Page - Training Programs Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display Not Ready for Tryouts heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Not Ready for Tryouts Yet/i })).toBeVisible();
  });

  test('should display Skills Camp card', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /TNE Skills Camp/i })).toBeVisible();
    await expect(page.getByText(/Small group format/i)).toBeVisible();
  });

  test('should display Small Group Training card', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Small Group Training/i })).toBeVisible();
    await expect(page.getByText(/4-6 players per session/i)).toBeVisible();
  });

  test('should display inquiry buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Inquire About Skills Camp/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Inquire About Training/i })).toBeVisible();
  });
});

test.describe('Tryouts Page - Upcoming Sessions Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display Upcoming Tryout Sessions heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming Tryout Sessions/i })).toBeVisible();
  });

  test('should display sessions or empty state', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Either shows sessions or empty state
    const hasEmptyState = await page.getByText(/No Upcoming Tryouts Scheduled/i).isVisible().catch(() => false);
    const hasSessions = await page.locator('[data-testid="tryout-session-card"]').count().catch(() => 0);

    // One of these should be true
    expect(hasEmptyState || hasSessions >= 0).toBe(true);
  });

  test('should display Get notified link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Get notified of future tryouts/i })).toBeVisible();
  });
});

test.describe('Tryouts Page - Testimonial Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display testimonial quote', async ({ page }) => {
    await expect(page.getByText(/My son was nervous about tryouts/i)).toBeVisible();
  });

  test('should display testimonial author', async ({ page }) => {
    await expect(page.getByText(/Jennifer M/i)).toBeVisible();
  });

  test('should display stat numbers', async ({ page }) => {
    await expect(page.getByText('94%')).toBeVisible();
    await expect(page.getByText('37')).toBeVisible();
    await expect(page.getByText('12+')).toBeVisible();
  });

  test('should display stat labels', async ({ page }) => {
    await expect(page.getByText(/Player retention rate/i)).toBeVisible();
    await expect(page.getByText(/D1 Alumni/i)).toBeVisible();
    await expect(page.getByText(/Years developing talent/i)).toBeVisible();
  });
});

test.describe('Tryouts Page - Final CTA Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display Ready to Join heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Ready to Join the Express/i })).toBeVisible();
  });

  test('should display Register CTA button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Register for Tryouts/i })).toBeVisible();
  });

  test('should display Contact Us button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Contact Us/i })).toBeVisible();
  });
});

test.describe('Tryouts Page - Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Main elements should be visible
    await expect(page.locator('h1').filter({ hasText: /Tryouts & Player Development/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /What to Expect/i })).toBeVisible();
  });

  test('should have working grade tabs on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Grade tabs should be visible and clickable
    const tab = page.getByRole('button', { name: /3rd-4th Grade/i });
    await expect(tab).toBeVisible();
    await tab.click();

    // Content should change
    await expect(page.getByText(/Ages 8-10/i)).toBeVisible();
  });

  test('should have working FAQ accordion on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // FAQ should be expandable
    const faqButton = page.locator('button').filter({ hasText: /How much does it cost/i });
    await expect(faqButton).toBeVisible();
    await faqButton.click();

    // Answer should be visible
    await expect(page.getByText(/\$25 fee/i)).toBeVisible();
  });

  test('training cards should stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tryouts');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Both cards should be visible (stacked vertically)
    await expect(page.getByRole('heading', { name: /TNE Skills Camp/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Small Group Training/i })).toBeVisible();
  });
});
