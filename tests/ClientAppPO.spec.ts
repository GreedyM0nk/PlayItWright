
import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED TEST SUITE
 * Pattern: Uses new fixtures for automatic POM setup and test data injection
 * All assertions are Web-First (auto-retry)
 * See docs/QUICK_REFERENCE.md for migration details
 */

// Load test data from JSON
const dataset = JSON.parse(JSON.stringify(require("../utils/placeorderTestData.json")));

/**
 * Test 1: Parameterized checkout flow with fixture-injected POManager
 * PILLAR 1: poManager fixture provides automatic setup/teardown
 */
for (const data of dataset) {
  test(`@Webs Client App login for ${data.productName}`, async ({ poManager }) => {
    const loginPage = poManager.getLoginPage();
    const dashboardPage = poManager.getDashboardPage();
    const cartPage = poManager.getCartPage();
    const ordersReviewPage = poManager.getOrdersReviewPage();
    const ordersHistoryPage = poManager.getOrdersHistoryPage();

    // ==== LOGIN ====
    await loginPage.goTo();
    await loginPage.validLogin(data.username, data.password);
    
    // ==== SEARCH & ADD PRODUCT ====
    await dashboardPage.waitForDashboardLoad();
    await dashboardPage.searchProductAddCart(data.productName);
    
    // ==== VIEW CART ====
    await dashboardPage.navigateToCart();
    await cartPage.VerifyProductIsDisplayed(data.productName);
    
    // ==== CHECKOUT ====
    await cartPage.Checkout();
    
    // ==== REVIEW ORDER ====
    await ordersReviewPage.waitForReviewPageLoad();
    await ordersReviewPage.searchCountryAndSelect("ind", "India");
    
    // ==== PLACE ORDER ====
    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
    expect(orderId).toBeTruthy();
    console.log(`✅ Order placed with ID: ${orderId}`);
    
    // ==== VERIFY ORDER IN HISTORY ====
    await dashboardPage.navigateToOrders();
    await ordersHistoryPage.waitForOrdersPageLoad();
    await ordersHistoryPage.searchOrderAndSelect(orderId!);
    
    const retrievedOrderId = await ordersHistoryPage.getOrderId();
    expect(orderId?.includes(retrievedOrderId!)).toBeTruthy();
    console.log(`✅ Order ${orderId} verified in history`);
  });
}

/**
 * Test 2: Using testData fixture for centralized test data
 * PILLAR 1: testData fixture provides default credentials
 */
test(`@Webs Client App login with fixture`, async ({ poManager, testData }) => {
  const loginPage = poManager.getLoginPage();
  const dashboardPage = poManager.getDashboardPage();
  const cartPage = poManager.getCartPage();

  // PILLAR 1: Use injected testData instead of hardcoding
  await loginPage.goTo();
  await loginPage.validLogin(testData.username, testData.password);

  // PILLAR 2: Modern assertions with auto-retry
  await expect(
    dashboardPage.productCards.first()
  ).toBeVisible({ timeout: 8000 });

  await dashboardPage.searchProductAddCart(testData.productName);
  await dashboardPage.navigateToCart();

  await cartPage.VerifyProductIsDisplayed(testData.productName);
  console.log(`✅ ${testData.productName} verified in cart`);
});

