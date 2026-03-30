import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // PILLAR 3: Advanced Observability & Resilience
  fullyParallel: true, // Enable maximum parallelization
  retries: process.env.CI ? 2 : 0, // 2 retries in CI, 0 locally for faster feedback
  workers: process.env.CI ? 4 : 2, // 2 parallel workers locally
  
  /* Maximum time one test can run for. */
  timeout: 60 * 1000, // Increased to 60s to prevent timeouts
  expect: {
    timeout: 10000 // Increased assertion timeout
  },

  /* Reporters: line for CLI output, html for detailed report, allure for Allure integration */
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    headless: true,
    screenshot: 'only-on-failure', // Optimize storage by capturing only on failures
    trace: 'on-first-retry', // PILLAR 3: Capture DOM snapshots & network logs only on retries
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* PILLAR 4: Multi-Experience Simulation - Define projects for major browsers & devices */
  projects: process.env.CI ? [
    // CI: Run on all browsers for comprehensive coverage
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
  ] : [
    // Local: Run only on chromium for fast feedback
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://rahulshettyacademy.com',
      },
    },
  ],
});
