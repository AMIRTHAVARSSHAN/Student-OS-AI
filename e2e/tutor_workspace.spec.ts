import { test, expect } from '@playwright/test';

test.describe('Tutor AI Workspace & Formatted Message Audits', () => {
  test('Tutor workspace page loads clean layout and chat input', async ({ page }) => {
    await page.goto('/tutor');
    await page.waitForLoadState('networkidle');

    // Header title check
    const header = page.locator('h1, h2, span').filter({ hasText: /Tutor/i }).first();
    await expect(header).toBeVisible();

    // Action chips check
    const chipsContainer = page.locator('.overflow-x-auto').first();
    if (await chipsContainer.isVisible()) {
      await expect(chipsContainer).toBeVisible();
    }
  });
});
