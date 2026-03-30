import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED: ClientApp Test Suite
 * Pattern: Uses POManager via fixtures + Web-First assertions
 * Previously used inline locators - now refactored to use Page Objects
 * 
 * MIGRATION: Replaced inline page.locator() with POM methods
 * MIGRATION: Replaced await page.waitForLoadState() with Web-First assertions
 */

test('@Webst Client App login', async ({ poManager }) => {
  const loginPage = poManager.getLoginPage();
  const dashboardPage = poManager.getDashboardPage();
  const cartPage = poManager.getCartPage();
  const ordersReviewPage = poManager.getOrdersReviewPage();
  const ordersHistoryPage = poManager.getOrdersHistoryPage();

  const email = "anshika@gmail.com";
  const productName = 'ZARA COAT 3';

  // ==== LOGIN ====
  await loginPage.goTo();
  await loginPage.validLogin(email, "Iamking@000");
  console.log(`✅ Logged in as ${email}`);

  // ==== SEARCH & ADD PRODUCT ====
  await dashboardPage.waitForDashboardLoad();
  await dashboardPage.searchProductAddCart(productName);
  console.log(`✅ Added ${productName} to cart`);

  // ==== VIEW CART ====
  await dashboardPage.navigateToCart();
  await cartPage.VerifyProductIsDisplayed(productName);
  console.log(`✅ Product verified in cart`);

  // ==== CHECKOUT ====
  await cartPage.Checkout();
  console.log(`✅ Proceeding to checkout`);

  // ==== REVIEW ORDER ====
  await ordersReviewPage.waitForReviewPageLoad();
  await ordersReviewPage.searchCountryAndSelect("ind", "India");
  await ordersReviewPage.VerifyEmailId(email);
  console.log(`✅ Order review validated`);

  // ==== PLACE ORDER ====
  const orderId = await ordersReviewPage.SubmitAndGetOrderId();
  expect(orderId).toBeTruthy();
  console.log(`✅ Order placed: ${orderId}`);

  // ==== VERIFY IN HISTORY ====
  await dashboardPage.navigateToOrders();
  await ordersHistoryPage.waitForOrdersPageLoad();
  await ordersHistoryPage.searchOrderAndSelect(orderId!);
  const retrievedId = await ordersHistoryPage.getOrderId();
  expect(orderId?.includes(retrievedId!)).toBeTruthy();
  console.log(`✅ Full flow completed successfully!`);
});
