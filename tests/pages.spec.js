import { test, expect } from '@playwright/test';
import path from 'path';

const PAGES = [
  { name: 'Homepage', file: 'index.html' },
  { name: 'Teams', file: 'teams.html' },
  { name: 'Schedule', file: 'schedule.html' },
  { name: 'Tournaments', file: 'tournaments.html' },
  { name: 'Tryouts', file: 'tryouts.html' },
  { name: 'About', file: 'about.html' },
  { name: 'Contact', file: 'contact.html' },
];

for (const page of PAGES) {
  test.describe(`${page.name} Page`, () => {
    test.beforeEach(async ({ page: browserPage }) => {
      const filePath = path.resolve(process.cwd(), 'src/pages', page.file);
      await browserPage.goto(`file://${filePath}`);
    });

    test('should load without console errors', async ({ page: browserPage }) => {
      const errors = [];
      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait for page to fully load
      await browserPage.waitForLoadState('networkidle');

      // Filter out known non-critical errors (like font loading issues)
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should have correct page title', async ({ page: browserPage }) => {
      const title = await browserPage.title();
      expect(title).toContain('TNE United Express');
    });

    test('should display navbar', async ({ page: browserPage }) => {
      // Use first() to handle mobile menu drawer which adds a second nav element
      const nav = browserPage.locator('nav').first();
      await expect(nav).toBeVisible();
    });

    test('should display footer', async ({ page: browserPage }) => {
      const footer = browserPage.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have working navigation links', async ({ page: browserPage }) => {
      const navLinks = browserPage.locator('nav a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });
}

// Schedule page specific tests
test.describe('Schedule Page - Specific', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/schedule.html');
    await page.goto(`file://${filePath}`);
  });

  test('should display filter controls', async ({ page }) => {
    // View toggle
    await expect(page.getByRole('button', { name: /list/i })).toBeVisible();

    // Event type filters
    await expect(page.getByRole('button', { name: /all events/i })).toBeVisible();

    // Team dropdown
    await expect(page.locator('select')).toBeVisible();

    // Search input
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should display schedule events grouped by day', async ({ page }) => {
    // Check for day headers
    const dayHeaders = page.locator('.bg-neutral-100');
    const count = await dayHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display event type badges', async ({ page }) => {
    // Practice badges
    const practiceBadges = page.getByText('Practice', { exact: true });
    await expect(practiceBadges.first()).toBeVisible();

    // Game badges
    const gameBadges = page.getByText('Game', { exact: true });
    await expect(gameBadges.first()).toBeVisible();
  });

  test('should display tournament preview card', async ({ page }) => {
    const tournamentCard = page.getByText('Tournament', { exact: true });
    await expect(tournamentCard.first()).toBeVisible();
  });

  test('should have game day highlighting', async ({ page }) => {
    // Saturday game day should have red accent
    const gameDay = page.locator('.bg-tne-red').first();
    await expect(gameDay).toBeVisible();
  });
});

// Tryouts page specific tests
test.describe('Tryouts Page - Specific', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/tryouts.html');
    await page.goto(`file://${filePath}`);
  });

  test('should display upcoming tryout dates', async ({ page }) => {
    // Check for tryout cards
    const tryoutCards = page.locator('.rounded-3xl').filter({ hasText: /Grade Tryouts/i });
    const count = await tryoutCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display registration form', async ({ page }) => {
    // Check for form fields
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#grade')).toBeVisible();
  });

  test('should display FAQ accordion', async ({ page }) => {
    // Check for FAQ section
    const faqItems = page.locator('details');
    const count = await faqItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display what to expect section', async ({ page }) => {
    await expect(page.getByText('What to Expect')).toBeVisible();
    await expect(page.getByText('Skills Evaluation')).toBeVisible();
  });

  test('should display what to bring checklist', async ({ page }) => {
    await expect(page.getByText('What to Bring')).toBeVisible();
    await expect(page.getByText('Basketball shoes')).toBeVisible();
  });

  test('should have form validation attributes', async ({ page }) => {
    // Check required fields have required attribute
    const firstNameInput = page.locator('#firstName');
    await expect(firstNameInput).toHaveAttribute('required', '');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});

// Tournaments page specific tests
test.describe('Tournaments Page - Specific', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/tournaments.html');
    await page.goto(`file://${filePath}`);
  });

  test('should display filter controls', async ({ page }) => {
    // Check for filter buttons
    await expect(page.getByRole('button', { name: /all tournaments/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /upcoming/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /past results/i })).toBeVisible();

    // Grade dropdown
    await expect(page.locator('select')).toBeVisible();

    // Search input
    await expect(page.getByPlaceholder(/search tournaments/i)).toBeVisible();
  });

  test('should display featured tournament card', async ({ page }) => {
    // Check for featured badge
    await expect(page.getByText('Featured')).toBeVisible();
    // Check for tournament name
    await expect(page.getByText('New Year Classic Invitational')).toBeVisible();
  });

  test('should display upcoming tournaments section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Upcoming Tournaments' })).toBeVisible();
    // Check for multiple tournament cards
    const tournamentCards = page.locator('article.rounded-3xl');
    const count = await tournamentCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display past results section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Past Results' })).toBeVisible();
    // Check for champions badges
    const championBadges = page.getByText('Champions');
    const count = await championBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display season stats summary', async ({ page }) => {
    await expect(page.getByText('2024-25 Season Highlights')).toBeVisible();
    // Check for stat numbers using the specific stats section
    const statsSection = page.locator('.grid.grid-cols-2');
    await expect(statsSection).toBeVisible();
    await expect(page.getByText('Championships')).toBeVisible();
  });

  test('should have registration CTAs', async ({ page }) => {
    const registerButtons = page.getByRole('link', { name: /register/i });
    const count = await registerButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

// Mobile responsiveness tests
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('schedule page should be usable on mobile', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/schedule.html');
    await page.goto(`file://${filePath}`);

    // Mobile menu button should be visible
    const menuButton = page.locator('button[class*="md:hidden"]');
    await expect(menuButton).toBeVisible();

    // Page content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Filter controls should be visible
    await expect(page.getByRole('button', { name: /all events/i }).first()).toBeVisible();
  });

  test('tryouts page should be usable on mobile', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/tryouts.html');
    await page.goto(`file://${filePath}`);

    // Mobile menu button should be visible
    const menuButton = page.locator('button[class*="md:hidden"]');
    await expect(menuButton).toBeVisible();

    // Page content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Registration form should be visible
    await expect(page.locator('#firstName')).toBeVisible();
  });

  test('tournaments page should be usable on mobile', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/tournaments.html');
    await page.goto(`file://${filePath}`);

    // Mobile menu button should be visible
    const menuButton = page.locator('button[class*="md:hidden"]');
    await expect(menuButton).toBeVisible();

    // Page content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Filter controls should be visible
    await expect(page.getByRole('button', { name: /all tournaments/i })).toBeVisible();
  });

  test('contact page should be usable on mobile', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/contact.html');
    await page.goto(`file://${filePath}`);

    // Mobile menu button should be visible
    const menuButton = page.locator('button[class*="md:hidden"]');
    await expect(menuButton).toBeVisible();

    // Page content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Contact form should be visible
    await expect(page.locator('#contactForm')).toBeVisible();
  });
});

// Contact page specific tests
test.describe('Contact Page - Specific', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/pages/contact.html');
    await page.goto(`file://${filePath}`);
  });

  test('should display contact form with all fields', async ({ page }) => {
    // Check for form fields
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('should have form validation attributes', async ({ page }) => {
    // Check required fields have required attribute
    const firstNameInput = page.locator('#firstName');
    await expect(firstNameInput).toHaveAttribute('required', '');

    const lastNameInput = page.locator('#lastName');
    await expect(lastNameInput).toHaveAttribute('required', '');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required', '');

    const subjectSelect = page.locator('#subject');
    await expect(subjectSelect).toHaveAttribute('required', '');

    const messageTextarea = page.locator('#message');
    await expect(messageTextarea).toHaveAttribute('required', '');
  });

  test('should display subject dropdown with options', async ({ page }) => {
    const subjectSelect = page.locator('#subject');
    await expect(subjectSelect).toBeVisible();

    // Check for options
    const options = subjectSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(3);
  });

  test('should display contact info sidebar', async ({ page }) => {
    // Check for contact info sections
    await expect(page.getByText('info@tneexpress.com')).toBeVisible();
    await expect(page.getByText('(402) 555-0123')).toBeVisible();
    await expect(page.getByText('Omaha, Nebraska')).toBeVisible();
  });

  test('should display social links', async ({ page }) => {
    // Check for social links section
    await expect(page.getByRole('heading', { name: 'Follow Us' })).toBeVisible();
    // Check for social link icons
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display quick links section', async ({ page }) => {
    await expect(page.getByText('Looking for something specific?')).toBeVisible();
    // Check for quick link buttons
    await expect(page.getByRole('link', { name: 'Tryouts & Registration' })).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /send message/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveAttribute('type', 'submit');
  });
});
