import { test, expect } from '@playwright/test';

test.describe('Responsive Zero-Overflow & Dock Layout Audits', () => {
  const routes = ['/', '/tutor', '/notes', '/study-plan', '/connect', '/settings'];

  for (const route of routes) {
    test(`Zero horizontal overflow on route: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Assert no horizontal scrollbar (scrollWidth <= clientWidth)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('Mobile Bottom Dock is visible and contains 6 navigation items on mobile viewport', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/');
    const bottomNav = page.locator('nav.md\\:hidden');
    await expect(bottomNav).toBeVisible();

    const navLinks = bottomNav.locator('a');
    await expect(navLinks).toHaveCount(6);
  });
});
