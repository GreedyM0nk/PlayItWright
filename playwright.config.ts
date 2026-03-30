import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // PILLAR 3: Advanced Observability & Resilience
  fullyParallel: true, // Enable maximum parallelization
  retries: process.env.CI ? 2 : 1, // 2 retries in CI, 1 locally
  workers: process.env.CI ? 4 : 3, // 3-4 parallel workers
  
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  /* Reporters: line for CLI output, html for detailed report, allure for Allure integration */
  reporter: [
    ['line'],
    ['html'],
    ['allure-playwright']
  ],
  
  /* Allure results directory */
  outputDir: 'allure-results',
  
  /* Shared settings for all the projects below */
  use: {
    headless: true,
    screenshot: 'only-on-failure', // Optimize storage by capturing only on failures
    trace: 'on-first-retry', // PILLAR 3: Capture DOM snapshots & network logs only on retries
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* PILLAR 4: Multi-Experience Simulation - Define projects for major browsers & devices */
  projects: [
    // Desktop Browsers
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

    // Mobile Emulation - PILLAR 4
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
  ],
});
