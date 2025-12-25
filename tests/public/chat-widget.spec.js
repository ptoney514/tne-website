// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display chat toggle button on public pages', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should have correct aria label when closed', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toHaveAttribute('aria-label', 'Open chat');
  });

  test('should open chat panel when button is clicked', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();
  });

  test('should display welcome message when opened', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    await expect(
      page.getByText(/I'm the TNE United Express assistant/)
    ).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    await expect(page.getByTestId('quick-action-schedule')).toBeVisible();
    await expect(page.getByTestId('quick-action-tryouts')).toBeVisible();
    await expect(page.getByTestId('quick-action-fees')).toBeVisible();
    await expect(page.getByTestId('quick-action-contact')).toBeVisible();
  });

  test('should close panel when close button is clicked', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();

    const closeButton = page.getByTestId('chat-close-button');
    await closeButton.click();

    await expect(chatPanel).not.toBeVisible();
  });

  test('should close panel when toggle button is clicked again', async ({
    page,
  }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();

    await chatButton.click();

    await expect(chatPanel).not.toBeVisible();
  });

  test('should have input field for typing messages', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toHaveAttribute(
      'placeholder',
      'Ask about teams, schedules, fees...'
    );
  });

  test('should have send button', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const sendButton = page.getByTestId('chat-send-button');
    await expect(sendButton).toBeVisible();
  });

  test('should have reset button', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const resetButton = page.getByTestId('chat-reset-button');
    await expect(resetButton).toBeVisible();
  });

  test('should have accessible dialog role', async ({ page }) => {
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toHaveAttribute('role', 'dialog');
    await expect(chatPanel).toHaveAttribute(
      'aria-label',
      'Chat with TNE Assistant'
    );
  });
});

test.describe('Chat Widget - Different Pages', () => {
  test('should be visible on teams page', async ({ page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on schedule page', async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on contact page', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on payments page', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should NOT be visible on login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).not.toBeVisible();
  });
});

test.describe('Chat Widget - Contact Page Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display AI assistant CTA card', async ({ page }) => {
    const ctaCard = page.getByTestId('ai-assistant-cta');
    await expect(ctaCard).toBeVisible();
  });

  test('should open chat when CTA button is clicked', async ({ page }) => {
    const ctaButton = page.getByTestId('open-chat-button');
    await ctaButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();
  });
});

test.describe('Chat Widget - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await expect(chatButton).toBeVisible();
  });

  test('should open panel on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();
  });

  test('should have responsive panel width on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    const box = await chatPanel.boundingBox();

    // Panel should not exceed viewport width minus padding
    expect(box.width).toBeLessThanOrEqual(375 - 48);
  });
});

test.describe('Chat Widget - Tooltip', () => {
  test('should show tooltip after delay on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.removeItem('tne-chat-tooltip-seen')
    );
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for tooltip to appear (3 seconds + buffer)
    const tooltip = page.getByTestId('chat-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 5000 });
  });

  test('tooltip should dismiss when chat is opened', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.removeItem('tne-chat-tooltip-seen')
    );
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for tooltip
    const tooltip = page.getByTestId('chat-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 5000 });

    // Click chat button
    const chatButton = page.getByTestId('chat-toggle-button');
    await chatButton.click();

    // Tooltip should be hidden
    await expect(tooltip).not.toBeVisible();
  });

  test('should not show tooltip on subsequent visits', async ({ page }) => {
    // Set localStorage to simulate returning visitor
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.setItem('tne-chat-tooltip-seen', 'true')
    );
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait past the tooltip delay
    await page.waitForTimeout(4000);

    // Tooltip should not appear
    const tooltip = page.getByTestId('chat-tooltip');
    await expect(tooltip).not.toBeVisible();
  });
});
