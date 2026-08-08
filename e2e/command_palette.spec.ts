import { test, expect } from '@playwright/test';

test.describe('Global Command Palette (Cmd+K) Spec', () => {
  test('Cmd+K opens command palette modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger Cmd+K
    await page.keyboard.press('Control+k');

    // Verify Command Palette modal opens
    const searchInput = page.locator('input[placeholder*="Search notes"]');
    await expect(searchInput).toBeVisible();

    // Verify Escape closes modal
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });
});
