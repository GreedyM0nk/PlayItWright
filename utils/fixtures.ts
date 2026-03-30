import { test as baseTest, expect, Page, Browser, BrowserContext, APIRequestContext, request } from '@playwright/test';
import { PageObjectFactory } from './pageObjectFactory';
import { POManager } from '../pageobjects/POManager';

/**
 * ENGINEERED FIXTURES ARCHITECTURE
 * ================================
 * 
 * This is the heart of the refactored framework. Three powerful fixtures work together:
 * 
 * 1. AUTHENTICATED PAGE FIXTURE
 *    - Automatically logs in users before test starts
 *    - Saves browser storage state to 'state.json'
 *    - Tests skip login ceremony entirely
 *    - Usage: test('name', async ({ authenticatedPage: page }) => { ... })
 * 
 * 2. PAGE OBJECTS FIXTURE
 *    - Factory that creates all Page Objects on-demand
 *    - Lazy-loading: only creates what's used
 *    - Caching: reuses instances across test
 *    - Usage: test('name', async ({ pages: { loginPage, dashboardPage } }) => { ... })
 * 
 * 3. TEST DATA FIXTURE
 *    - Centralized credentials and test data
 *    - Single source of truth
 *    - Easy to switch between test environments
 *    - Usage: test('name', async ({ testData }) => { const { username, password } = testData })
 * 
 * BENEFITS:
 * ✅ No manual login in tests
 * ✅ Clean, readable test syntax
 * ✅ Automatic lifecycle management
 * ✅ Enhanced logging and debugging
 * ✅ DRY principle (Don't Repeat Yourself)
 */

interface TestData {
  // Primary test account
  username: string;
  password: string;
  
  // Test products
  productName: string;
  orderedProductId: string;
  
  // Expected emails
  testEmail: string;
  adminEmail: string;
}

interface PageObjects {
  loginPage: any;
  dashboardPage: any;
  cartPage: any;
  ordersHistoryPage: any;
  ordersReviewPage: any;
  basePage: any;
  popupPage: any;
  iframePage: any;
  calendarPage: any;
  apiPage: any;
}

type TestFixtures = {
  authenticatedPage: Page;
  pages: PageObjects;
  testData: TestData;
  poManager: POManager;  // Backward compatibility for existing tests
};

/**
 * ===================================================
 * FIXTURE 1: AUTHENTICATED PAGE
 * ===================================================
 * 
 * This fixture handles the complete authentication flow:
 * 1. Creates fresh browser context
 * 2. Navigates to login page
 * 3. Fills email and password
 * 4. Clicks login button
 * 5. Waits for dashboard to load
 * 6. Saves storage state for future sessions
 * 7. Returns authenticated page to test
 * 
 * Result: Tests start already logged in!
 * 
 * Why is this better than manual login in beforeAll?
 * - Each test gets a fresh authenticated context
 * - Automatic cleanup after test
 * - Consistent login flow across all tests
 * - Easy to test different user scenarios
 * - No hardcoded login logic in tests
 */
const authenticatedPageFixture = async ({ browser }: any, use: any) => {
  console.log('\n[AUTH FIXTURE] Creating authenticated context...');
  
  // Step 1: Create fresh context (prevents test pollution)
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('[AUTH FIXTURE] Navigating to login page');
  // Step 2: Navigate to login
  await page.goto('https://rahulshettyacademy.com/client');
  
  console.log('[AUTH FIXTURE] Entering credentials');
  // Step 3: Enter credentials
  // Note: Using more specific selectors (input#userEmail instead of #userEmail)
  // This is PILLAR 2: Accessibility-first, semantic locators
  await page.locator('input#userEmail').fill('anshika@gmail.com');
  await page.locator('input#userPassword').fill('Iamking@000');
  
  console.log('[AUTH FIXTURE] Clicking login button');
  // Step 4: Click login
  await page.locator('input[value="Login"]').click();
  
  console.log('[AUTH FIXTURE] Waiting for dashboard to load');
  // Step 5: Wait for dashboard
  // PILLAR 2: Web-First assertion (auto-retry for 10 seconds)
  // Better than waitForLoadState('networkidle') - specific URL wait
  await expect(page.locator('.card-body')).toBeVisible({ timeout: 10000 });
  await page.waitForURL(/.*client.*/, { timeout: 10000 });
  
  console.log('[AUTH FIXTURE] Login successful, saving storage state');
  // Step 6: Save storage state for future sessions
  // This allows other tests to load faster using { storageState: 'state.json' }
  await context.storageState({ path: 'state.json' });
  
  console.log('[AUTH FIXTURE] Providing authenticated page to test');
  // Step 7: Provide to test
  await use(page);
  
  console.log('[AUTH FIXTURE] Cleaning up after test');
  // Cleanup
  await page.close();
  await context.close();
};

/**
 * ===================================================
 * FIXTURE 2: PAGE OBJECTS (Factory Pattern)
 * ===================================================
 * 
 * This fixture provides direct access to all Page Objects.
 * Instead of: poManager.getLoginPage()
 * Use: pages.loginPage
 * 
 * The factory uses lazy-loading: only creates POMs when accessed.
 * This is more efficient than instantiating all POMs upfront.
 * 
 * Usage in test:
 * test('test title', async ({ pages: { dashboardPage, cartPage } }) => {
 *   await dashboardPage.searchProductAddCart('ADIDAS');
 *   await cartPage.navigateToCart();
 * });
 */
const pageObjectsFixture = async ({ page }: any, use: any) => {
  console.log('[PAGES FIXTURE] Creating PageObjectFactory');
  const factory = new PageObjectFactory(page);
  
  // Export all page objects
  const pages = factory.getAllPages();
  
  console.log('[PAGES FIXTURE] Page objects ready for use');
  await use(pages);
};

/**
 * ===================================================
 * FIXTURE 3: TEST DATA
 * ===================================================
 * 
 * Centralized test data management.
 * Single source of truth for credentials, product names, emails, etc.
 * 
 * Benefits:
 * - Change credentials in one place
 * - Easy to switch between test environments
 * - Supports parameterized tests
 * - Clear what data is used where
 * 
 * Usage in test:
 * test('test title', async ({ testData }) => {
 *   const { username, password, productName } = testData;
 * });
 */
const testDataFixture = async ({}: any, use: any) => {
  const defaultTestData: TestData = {
    // PRODUCTION ACCOUNT
    username: 'anshika@gmail.com',
    password: 'Iamking@000',
    
    // ALTERNATE ACCOUNT (if needed)
    // username: 'rahulshetty@gmail.com',
    // password: 'Iamking@000',
    
    // TEST PRODUCTS (update based on current catalog)
    productName: 'ADIDAS ORIGINAL',
    orderedProductId: '6262e95ae26b7e1a10e89bf0',
    
    // TEST EMAILS
    testEmail: 'test@example.com',
    adminEmail: 'admin@example.com'
  };

  // Tests can optionally override testData:
  // test('test', async ({ testData: { username, ...rest } }) => {
  //   testData = { username: 'different@email.com', ...rest };
  // });
  
  await use(defaultTestData);
};

/**
 * ===================================================
 * FIXTURE 4: PAGE OBJECT MANAGER (Backward Compatibility)
 * ===================================================
 * 
 * Maintains backward compatibility with existing tests
 * that use the POManager pattern.
 * 
 * New tests should use the 'pages' fixture instead:
 * ✅ const { dashboardPage } = pages;
 * ❌ const { dashboardPage } = poManager.getDashboardPage();
 */
const poManagerFixture = async ({ page }: any, use: any) => {
  const poManager = new POManager(page);
  console.log(`[FIXTURE] Initializing POManager for test (backward compatibility)`);
  await use(poManager);
  console.log(`[FIXTURE] POManager test completed`);
};

/**
 * ===================================================
 * EXPORT EXTENDED TEST WITH ALL FIXTURES
 * ===================================================
 */
export const test = baseTest.extend<TestFixtures>({
  authenticatedPage: authenticatedPageFixture,
  pages: pageObjectsFixture,
  testData: testDataFixture,
  poManager: poManagerFixture,
});

/**
 * ===================================================
 * ENHANCED TEST HOOKS: beforeEach & afterEach
 * ===================================================
 * 
 * These hooks provide:
 * - Enhanced logging for debugging
 * - Automatic dialog handling (optional)
 * - Request/response logging for network issues
 * - Consistent viewport size
 * - Screenshot on failure
 */

test.beforeEach(async ({ page, context }, testInfo) => {
  // ===== LOGGING HEADER =====
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 TEST START`);
  console.log(`📝 Title: ${testInfo.title}`);
  console.log(`📂 File: ${testInfo.file.split('/').pop()}`);
  console.log(`🏃 Status: Running`);
  console.log(`${'='.repeat(70)}`);

  // ===== VIEWPORT CONSISTENCY =====
  // All tests run with same viewport for consistency
  // Helps catch responsive design issues
  await page.setViewportSize({ width: 1280, height: 720 });
  console.log(`📐 Viewport: 1280x720`);

  // ===== DIALOG HANDLING =====
  // Auto-accept dialogs (can override in specific tests if needed)
  // Logs dialog messages for debugging
  page.on('dialog', (dialog) => {
    console.log(`💬 Dialog detected: "${dialog.message()}"`);
    console.log(`📋 Type: ${dialog.type()}`);
    dialog.accept();
  });

  // ===== REQUEST LOGGING (Optional - for debugging) =====
  // Uncomment if debugging API issues
  // page.on('request', (request) => {
  //   if (request.method() === 'POST' || request.method() === 'PUT') {
  //     const url = request.url().split('?')[0];
  //     console.log(`📤 ${request.method()} ${url.split('/').pop()}`);
  //   }
  // });

  // ===== RESPONSE LOGGING =====
  // Only log errors to avoid cluttering output
  page.on('response', (response) => {
    if (!response.ok() && response.status() !== 304) {
      const url = response.url().split('/').pop();
      console.log(`⚠️  ${response.status()} ${url}`);
    }
  });

  console.log(`\n[TEST BODY RUNNING...]`);
});

/**
 * AFTER EACH HOOK
 * Runs after every test, regardless of pass/fail
 */
test.afterEach(async ({ page }, testInfo) => {
  console.log(`\n[TEST BODY COMPLETED]`);

  if (testInfo.status === 'passed') {
    // ===== PASSED TEST =====
    console.log(`${'='.repeat(70)}`);
    console.log(`✅ PASSED`);
    console.log(`⏱️  Duration: ${testInfo.duration}ms`);
    console.log(`${'='.repeat(70)}\n`);
  } else if (testInfo.status === 'failed') {
    // ===== FAILED TEST =====
    console.log(`${'='.repeat(70)}`);
    console.log(`❌ FAILED`);
    console.log(`📋 Error: ${testInfo.error?.message}`);
    console.log(`⏱️  Duration: ${testInfo.duration}ms`);

    // Take screenshot on failure (default behavior in playwright.config.ts)
    // But we can take additional screenshots if needed
    const failureScreenshot = `./test-results/failure-${Date.now()}.png`;
    await page.screenshot({ path: failureScreenshot, fullPage: true });
    console.log(`📸 Screenshot: ${failureScreenshot}`);

    console.log(`${'='.repeat(70)}\n`);
  } else if (testInfo.status === 'skipped') {
    // ===== SKIPPED TEST =====
    console.log(`${'='.repeat(70)}`);
    console.log(`⏭️  SKIPPED`);
    console.log(`${'='.repeat(70)}\n`);
  } else if (testInfo.status === 'timedOut') {
    // ===== TIMEOUT TEST =====
    console.log(`${'='.repeat(70)}`);
    console.log(`⏰ TIMEOUT`);
    console.log(`⏱️  Max duration: ${testInfo.timeout}ms`);
    console.log(`${'='.repeat(70)}\n`);
  }
});

// ===================================================
// RE-EXPORT PLAYWRIGHT TYPES
// ===================================================
// These are commonly used in tests, so we export them here
// So tests don't need: import { Page, expect } from '@playwright/test'
// Instead: import { Page, expect } from '../utils/fixtures'

export { expect, Browser, BrowserContext, Page, request, APIRequestContext };
