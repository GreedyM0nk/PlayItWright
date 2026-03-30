import { test as baseTest, expect, Page, Browser, BrowserContext, APIRequestContext, request } from '@playwright/test';
import { POManager } from '../pageobjects/POManager';

/**
 * PILLAR 1: Robust Core Architecture
 * Custom fixtures that encapsulate:
 * - Page Object Manager (automatic POM instantiation)
 * - Test Data injection
 * - Browser/Page lifecycle management
 * - Enhanced logging and error handling
 */

interface TestData {
  username: string;
  password: string;
  productName: string;
}

type TestFixtures = {
  poManager: POManager;
  testData: TestData;
  apiContext: any; // For future API testing
};

export const test = baseTest.extend<TestFixtures>({
  
  // FIXTURE 1: Page Object Manager
  // Automatically instantiates all page objects and closes them after test
  poManager: async ({ page }, use) => {
    const poManager = new POManager(page);
    
    // SETUP: Initialize page object manager
    console.log(`[FIXTURE] Initializing POManager for test`);
    
    // USE: Provide manager to test
    await use(poManager);
    
    // TEARDOWN: Clean up (optional logging, screenshots on failure, etc.)
    console.log(`[FIXTURE] POManager test completed`);
  },

  // FIXTURE 2: Test Data (with option to override)
  testData: async ({ }, use) => {
    const defaultTestData: TestData = {
      username: 'anshika@gmail.com',
      password: 'Iamking@000',
      productName: 'ADIDAS ORIGINAL'
    };

    // Allow tests to override data via fixture parameter
    await use(defaultTestData);
  },

  // FIXTURE 3: API Context (for API testing in future enhancementws)
  apiContext: async ({ playwright }: any, use: any) => {
    // Placeholder for future API testing integration
    const apiContext = {
      baseURL: 'https://rahulshettyacademy.com/api'
    };
    await use(apiContext);
  },
});

/**
 * ENHANCED TEST HOOKS FOR OBSERVABILITY
 */

test.beforeEach(async ({ page, context }, testInfo) => {
  console.log(`\n========== TEST START: ${testInfo.title} ==========`);
  console.log(`Test file: ${testInfo.file}`);
  const browserName = (context.browser as any)?.browserType?.() || 'unknown';
  
  // Optional: Set default viewport for accessibility testing
  await page.setViewportSize({ width: 1280, height: 720 });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    console.log(`\n⚠️  TEST FAILED: ${testInfo.title}`);
    console.log(`Error: ${testInfo.error?.message}`);
    // Allure/Screenshot are handled by playwright.config.ts
  } else {
    console.log(`✅ TEST PASSED: ${testInfo.title}`);
  }
  console.log(`========== TEST END ==========\n`);
});

// Export expect and other Playwright types for direct use in tests
export { expect, request, APIRequestContext, Browser, BrowserContext, Page };

