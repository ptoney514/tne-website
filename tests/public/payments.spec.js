// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Payments Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload to catch any console errors
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should display page header with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Payments/i })).toBeVisible();
  });

  test('should display page navigation', async ({ page }) => {
    // Check that navigation elements exist
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should have working logo link to home', async ({ page }) => {
    // Click the navbar logo link to go home (first match, not footer)
    await page.getByRole('link', { name: /TNE United Express/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Payments Page - Fee Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display fee schedule section', async ({ page }) => {
    await expect(page.getByTestId('fee-schedule')).toBeVisible();
  });

  test('should display a season indicator', async ({ page }) => {
    // Season name is now dynamic from API — verify the indicator element exists
    await expect(page.getByTestId('season-indicator')).toBeVisible();
    const text = await page.getByTestId('season-indicator').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should display Fee Schedule heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Fee Schedule' })).toBeVisible();
  });

  test('should display fee items or empty state', async ({ page }) => {
    const feeList = page.getByTestId('fee-list');
    await expect(feeList).toBeVisible();

    // Dynamic fees: either fee items are present or empty state shows
    const hasFeeItems = await feeList.locator('[data-testid^="fee-item-"]').count();
    const hasEmptyState = await page.getByTestId('fee-empty-state').isVisible().catch(() => false);

    expect(hasFeeItems > 0 || hasEmptyState).toBe(true);
  });

  test('should display fee amounts in dollar format when fees exist', async ({ page }) => {
    const feeList = page.getByTestId('fee-list');
    const feeItemCount = await feeList.locator('[data-testid^="fee-item-"]').count();

    if (feeItemCount > 0) {
      // Each fee item should display a dollar amount
      const firstFeeItem = feeList.locator('[data-testid^="fee-item-"]').first();
      const text = await firstFeeItem.textContent();
      expect(text).toMatch(/\$/);
    }
  });

  test('should display help section with contact info', async ({ page }) => {
    await expect(page.getByTestId('help-section')).toBeVisible();
    await expect(page.getByText('amitch2am@gmail.com').first()).toBeVisible();
    await expect(page.getByText('(402) 510-4919').first()).toBeVisible();
  });
});

test.describe('Payments Page - Payment Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display payment form section', async ({ page }) => {
    await expect(page.getByTestId('payment-form')).toBeVisible();
  });

  test('should display Payment Options header', async ({ page }) => {
    await expect(page.getByText('Payment Options')).toBeVisible();
    await expect(page.getByText('Secure checkout via PayPal')).toBeVisible();
  });

  test('should display dynamic registration status', async ({ page }) => {
    // Season status is now dynamic — verify the indicator element exists with content
    await expect(page.getByTestId('season-status')).toBeVisible();
    const text = await page.getByTestId('season-status').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should display PayPal embed container', async ({ page }) => {
    await expect(page.getByTestId('paypal-embed-container')).toBeVisible();
    // Verify the container has the correct ID for PayPal integration
    await expect(page.locator('#paypal-embed-container')).toBeVisible();
  });

  test('should display PayPal placeholder text', async ({ page }) => {
    await expect(page.getByText('PayPal Payment Form')).toBeVisible();
    await expect(
      page.getByText('Your PayPal embed code will appear here')
    ).toBeVisible();
  });

  test('should display security badges', async ({ page }) => {
    // Use more specific selector within payment form to avoid duplicate match
    const paymentForm = page.getByTestId('payment-form');
    await expect(paymentForm.getByText('Secure Payment')).toBeVisible();
    await expect(paymentForm.getByText('SSL Encrypted')).toBeVisible();
    await expect(paymentForm.getByText('PayPal Protected')).toBeVisible();
  });

  test('should display payment confirmation info', async ({ page }) => {
    await expect(page.getByText('Payment Confirmation')).toBeVisible();
    await expect(
      page.getByText("You'll receive an email receipt from PayPal after payment")
    ).toBeVisible();
  });

  test('should display registration complete info', async ({ page }) => {
    await expect(page.getByText('Registration Complete')).toBeVisible();
    await expect(
      page.getByText('Team assignment details sent within 48 hours')
    ).toBeVisible();
  });
});

test.describe('Payments Page - FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.getByTestId('payment-faq')).toBeVisible();
  });

  test('should display FAQ heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Payment Questions' })).toBeVisible();
    await expect(
      page.getByText('Common questions about fees and payments')
    ).toBeVisible();
  });

  test('should display all FAQ items', async ({ page }) => {
    const faqList = page.getByTestId('faq-list');
    await expect(faqList).toBeVisible();

    // Check for specific FAQ questions
    await expect(
      page.getByText("What's included in the registration fee?")
    ).toBeVisible();
    await expect(page.getByText('Can I set up a payment plan?')).toBeVisible();
    await expect(
      page.getByText("What's the difference between Fall and Winter?")
    ).toBeVisible();
    await expect(page.getByText('What is Jr. 3SSB?')).toBeVisible();
    await expect(
      page.getByText('Is there financial assistance available?')
    ).toBeVisible();
  });

  test('should expand FAQ item when clicked', async ({ page }) => {
    // Click on first FAQ item
    const firstFaqItem = page.getByTestId('faq-item-0');
    await firstFaqItem.click();

    // Wait for expansion
    await page.waitForTimeout(300);

    // The details element should be open
    await expect(firstFaqItem).toHaveAttribute('open', '');
  });

  test('should have 5 FAQ items', async ({ page }) => {
    // Check all 5 FAQ items exist
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`faq-item-${i}`)).toBeVisible();
    }
  });
});

test.describe('Payments Page - Contact CTA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display contact CTA section', async ({ page }) => {
    await expect(page.getByText('Need help with payment?')).toBeVisible();
    await expect(
      page.getByText('Contact us for payment plans or questions about fees')
    ).toBeVisible();
  });

  test('should display phone link', async ({ page }) => {
    // Get the phone link in the contact CTA section (second instance, after fee schedule help section)
    const phoneLink = page.getByRole('link', { name: '(402) 510-4919' }).nth(1);
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:+14025104919');
  });

  test('should display email link', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: 'Email Us' });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:amitch2am@gmail.com');
  });
});

test.describe('Payments Page - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be usable on mobile', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    // Main content should be visible
    await expect(page.getByRole('heading', { name: /Payments/i })).toBeVisible();

    // Fee schedule should be visible
    await expect(page.getByTestId('fee-schedule')).toBeVisible();

    // Payment form should be visible
    await expect(page.getByTestId('payment-form')).toBeVisible();
  });

  test('should display stacked layout on mobile', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');

    // Both fee schedule and payment form should be visible
    await expect(page.getByTestId('fee-schedule')).toBeVisible();
    await expect(page.getByTestId('payment-form')).toBeVisible();

    // Contact CTA buttons should be stacked or visible (get first instance from help section)
    await expect(page.getByRole('link', { name: '(402) 510-4919' }).first()).toBeVisible();
  });
});

test.describe('Payments Page - Navigation', () => {
  test('should display navbar', async ({ page }) => {
    await page.goto('/payments');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/payments');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/payments');
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
