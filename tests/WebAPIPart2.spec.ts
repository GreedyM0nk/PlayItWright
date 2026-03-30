import { test, expect } from '../utils/fixtures';

/**
 * ENGINEERED: Web API Testing - Part 2
 * Tests authenticated session flows with modern patterns
 * 
 * What's new:
 * ✅ No manual login - authenticatedPage fixture handles it
 * ✅ No manual loops - filter() patterns used instead
 * ✅ Direct POM access via pages fixture
 * ✅ 96 lines → 35 lines (63% reduction)
 */

/**
 * Complete checkout flow test
 * Demonstrates the engineered approach using:
 * - authenticatedPage: Already logged in
 * - pages: Direct access to POMs
 * - Filter patterns: No manual loops
 */
test('@QA authenticated session - complete checkout flow', async ({
  authenticatedPage: page,
  pages: { dashboardPage, cartPage, ordersReviewPage, ordersHistoryPage },
  testData
}) => {
  // ===== STEP 1: Search and add product to cart =====
  // POMs encapsulate the product search logic
  const productName = 'iphone 13 pro';
  await dashboardPage.searchProductAddCart(productName);

  // ===== STEP 2: Navigate to cart and verify product =====
  await page.locator('[routerlink*="cart"]').click();
  await expect(page.locator('div li').first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator(`h3:has-text('${productName}')`)).toBeVisible({ timeout: 5000 });

  // ===== STEP 3: Checkout and select country =====
  await page.locator('text=Checkout').click();
  await ordersReviewPage.searchCountryAndSelect('ind', 'India');

  // ===== STEP 4: Verify email and submit =====
  await ordersReviewPage.VerifyEmailId(testData.username);
  const orderId = await ordersReviewPage.SubmitAndGetOrderId();

  // ===== STEP 5: Verify order in history =====
  await ordersHistoryPage.searchOrderAndSelect(orderId || '');
  const orderIdDetails = await ordersHistoryPage.getOrderId();
  expect(orderId?.includes(orderIdDetails || '')).toBeTruthy();
});

/**
 * Login verification test
 * Demonstrates simple authenticated flow
 */
test('@API authenticated session - login verification', async ({
  authenticatedPage: page,
  testData
}) => {
  // Already authenticated by fixture
  // Products should be visible immediately
  const products = page.locator('.card-body');
  const titles = await page.locator('.card-body b').allTextContents();
  
  console.log(`📦 Available products: ${titles.join(', ')}`);
  expect(titles.length).toBeGreaterThan(0);
});
