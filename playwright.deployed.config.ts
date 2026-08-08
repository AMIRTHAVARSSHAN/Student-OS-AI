import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://student-os-ai-yd3a-teal.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on-first-retry',
  },

  projects: [
    /* Desktop Viewports */
    {
      name: 'desktop-1366',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-1920',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },

    /* Mobile Viewports */
    {
      name: 'mobile-320',
      use: { ...devices['iPhone SE'], viewport: { width: 320, height: 667 } },
    },
    {
      name: 'mobile-360',
      use: { ...devices['Android'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'mobile-375',
      use: { ...devices['iPhone 11 Pro'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'mobile-390',
      use: { ...devices['iPhone 12'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'mobile-412',
      use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } },
    },
    {
      name: 'mobile-430',
      use: { ...devices['iPhone 14 Pro Max'], viewport: { width: 430, height: 932 } },
    },
  ],
});
