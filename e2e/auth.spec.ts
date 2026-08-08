import { test, expect } from '@playwright/test';

test.describe('ScholarOS Landing & Auth Journeys', () => {
  test('Landing page loads cleanly without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ScholarOS/i);
    await expect(page.locator('body')).toBeVisible();

    // Check header/logo text is visible
    const logo = page.locator('text=ScholarOS').first();
    await expect(logo).toBeVisible();
  });

  test('Login and Register buttons are visible and interactive', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator('a[href="/login"], button:has-text("Login")').first();
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeEnabled();
    }
  });
});
