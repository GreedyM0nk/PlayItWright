// @ts-check
const { devices } = require('@playwright/test');

const config = {
  testDir: './tests',
  testMatch: '**/*.spec.ts', // Only run TypeScript test files
  retries: 0,
  
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
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'on',
    trace: 'on' // off,on
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
};

module.exports = config;
