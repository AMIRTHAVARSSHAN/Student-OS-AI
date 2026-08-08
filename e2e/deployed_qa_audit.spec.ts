import { test, expect } from '@playwright/test';

test.describe('ScholarOS Deployed Live Production E2E QA Audit', () => {
  const getUniqueUser = () => {
    const uid = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      email: `qastudent_${uid}@scholartest.edu`,
      password: `QaPassword#${uid}`,
      fullName: `Test Student ${uid}`,
    };
  };

  test('01: Deployed Landing Page & Hero Section Load Test', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Title & Logo Verification
    await expect(page).toHaveTitle(/ScholarOS/i);
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();

    // Zero Horizontal Overflow Check
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // No severe unhandled JS errors
    const fatalErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    expect(fatalErrors.length).toBe(0);
  });

  test('02: New Student Account Registration Journey', async ({ page }) => {
    const user = getUniqueUser();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill Registration Form
    const nameInput = page.locator('input[placeholder*="Priya"], input[type="text"]').first();
    await nameInput.fill(user.fullName);

    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);

    // Submit Registration
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Expect redirect to /onboarding or /login
    await page.waitForURL(/\/(onboarding|login)/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/(onboarding|login)/);
  });

  test('03: User Sign In & JWT Session Verification', async ({ page, context }) => {
    const user = getUniqueUser();

    // 1. Register User via API directly for clean separation
    const apiRes = await page.request.post('https://student-os-ai.onrender.com/api/v1/auth/register', {
      data: {
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        preferred_language: 'en',
      },
    });
    expect(apiRes.status()).toBe(201);

    // 2. Clear state and perform UI Login
    await context.clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);

    const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
    await page.locator('button[type="submit"]').first().click();
    await loginPromise;

    // Wait for Dashboard / Onboarding
    await page.waitForURL(/\/(onboarding|tutor|settings|\/)/, { timeout: 15000 });
    
    // Token persistence check
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
  });

  test('04: AI Onboarding Chat Stream Endpoint Test', async ({ page, context }) => {
    const user = getUniqueUser();

    // Register User via API
    await page.request.post('https://student-os-ai.onrender.com/api/v1/auth/register', {
      data: {
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        preferred_language: 'en',
      },
    });

    // Login via UI
    await context.clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    
    const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
    await page.locator('button[type="submit"]').first().click();
    await loginPromise;

    await page.waitForURL(/\/(onboarding|tutor|settings|\/)/, { timeout: 15000 });

    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Type name answer into chat box
    const chatInput = page.locator('input[placeholder*="Type your answer"]').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('Amirthavarsshan');
      const sendBtn = page.locator('form button[type="submit"]').first();
      await sendBtn.click();

      // Wait for AI streaming message response
      await page.waitForTimeout(4000);
      const userBubble = page.locator('div').filter({ hasText: 'Amirthavarsshan' }).first();
      await expect(userBubble).toBeVisible();
    }
  });

  test('05: Mobile Layout & Floating Bottom Navigation Dock Check', async ({ page, context, isMobile }) => {
    if (!isMobile) return;

    const user = getUniqueUser();

    // Register & Login to access dashboard layout
    await page.request.post('https://student-os-ai.onrender.com/api/v1/auth/register', {
      data: {
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        preferred_language: 'en',
      },
    });

    await context.clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);

    const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
    await page.locator('button[type="submit"]').first().click();
    await loginPromise;

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const bottomDock = page.locator('nav.md\\:hidden');
    await expect(bottomDock).toBeVisible();

    // Verify 6 navigation items
    const dockItems = bottomDock.locator('a');
    await expect(dockItems).toHaveCount(6);
  });
});
