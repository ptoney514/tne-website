// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should display page header with title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Get in Touch/i })
    ).toBeVisible();
  });

  test('should display hero description for formal inquiries', async ({
    page,
  }) => {
    await expect(
      page.getByText(/sponsorship, media inquiries, or partnership/i)
    ).toBeVisible();
  });

});
// Note: Breadcrumb navigation removed from current design

test.describe('Contact Page - Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display contact form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Send Us a Message/i })
    ).toBeVisible();
  });

  test('should display simplified subject options', async ({ page }) => {
    const subjectSelect = page.locator('#subject');
    await expect(subjectSelect).toBeVisible();

    // Click to open dropdown and check options
    await expect(subjectSelect).toContainText('Select a topic...');

    // Verify formal inquiry options are present
    const options = await subjectSelect.locator('option').allTextContents();
    expect(options).toContain('Sponsorship Inquiry');
    expect(options).toContain('Employment / Coaching');
    expect(options).toContain('Media / Press');
    expect(options).toContain('Partnership');
    expect(options).toContain('Other');

    // Verify old general inquiry options are NOT present
    expect(options).not.toContain('General Inquiry');
    expect(options).not.toContain('Registration Question');
    expect(options).not.toContain('Schedule Question');
  });

  test('should have required fields', async ({ page }) => {
    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const subjectSelect = page.locator('#subject');
    const messageTextarea = page.locator('#message');

    await expect(nameInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(subjectSelect).toHaveAttribute('required', '');
    await expect(messageTextarea).toHaveAttribute('required', '');
  });

  test('should have single name field instead of first/last', async ({
    page,
  }) => {
    // Should have single name field
    await expect(page.locator('#name')).toBeVisible();

    // Should NOT have separate first/last name fields
    await expect(page.locator('#firstName')).not.toBeVisible();
    await expect(page.locator('#lastName')).not.toBeVisible();
  });

  test('should NOT have phone field', async ({ page }) => {
    await expect(page.locator('#phone')).not.toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Send Message/i });
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Contact Page - Contact Info Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display contact information section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Contact Information/i })
    ).toBeVisible();
  });

  test('should display email link', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: /amitch2am@gmail.com/i });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:amitch2am@gmail.com');
  });

  test('should display phone link', async ({ page }) => {
    const phoneLink = page.getByRole('link', { name: /510-4919/i });
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:+14025104919');
  });

  test('should display location', async ({ page }) => {
    await expect(page.getByText(/Omaha, Nebraska/i)).toBeVisible();
  });

  test('should display social links section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Follow Us/i })
    ).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    const facebookLink = page.getByRole('link', { name: /facebook/i });
    const twitterLink = page.getByRole('link', { name: /twitter/i });
    const instagramLink = page.getByRole('link', { name: /instagram/i });

    await expect(facebookLink).toBeVisible();
    await expect(twitterLink).toBeVisible();
    await expect(instagramLink).toBeVisible();
  });
});

test.describe('Contact Page - AI Assistant CTA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display AI assistant CTA card', async ({ page }) => {
    const ctaCard = page.getByTestId('ai-assistant-cta');
    await expect(ctaCard).toBeVisible();
  });

  test('should display Need Quick Answers heading', async ({ page }) => {
    await expect(page.getByText(/Need Quick Answers/i)).toBeVisible();
  });

  test('should display AI Assistant description', async ({ page }) => {
    await expect(
      page.getByText(/Get instant help with schedules, registration, and program info/i)
    ).toBeVisible();
  });

  test('should display Chat with AI Coach button', async ({ page }) => {
    const chatButton = page.getByTestId('open-chat-button');
    await expect(chatButton).toBeVisible();
    await expect(chatButton).toContainText('Chat with AI Coach');
  });

  test('should show feature coming soon indicator', async ({ page }) => {
    // The AI chat feature is coming soon
    await expect(page.getByText(/Feature coming soon/i)).toBeVisible();
  });
});

test.describe('Contact Page - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be usable on mobile', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    // Main content should be visible
    await expect(
      page.getByRole('heading', { name: /Get in Touch/i })
    ).toBeVisible();

    // Form should be visible
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();

    // AI assistant CTA should be visible
    await expect(page.getByTestId('ai-assistant-cta')).toBeVisible();
  });
});

test.describe('Contact Page - Navigation', () => {
  test('should display navbar', async ({ page }) => {
    await page.goto('/contact');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/contact');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have working logo link to home', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Click the navbar logo link to go home (first match, not footer)
    await page.getByRole('link', { name: /TNE United Express/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});
