import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED: Security Test - Request Interception
 * Updated to use modern fixtures and Web-First assertions
 * Uses PageObjectFactory (POManager) for loginPage and dashboardPage
 */
test('@QW Security test request intercept', async ({ page, pages: { loginPage, dashboardPage } }) => {
  // Use LoginPage from the factory — goTo() uses relative path from baseURL
  await loginPage.goTo();
  await loginPage.validLogin("anshika@gmail.com", "Iamking@000");

  // Use DashboardPage from the factory to navigate to orders
  await dashboardPage.navigateToOrders();

  await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
    route => route.continue({ url: 'https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6' }));
  await page.locator("button:has-text('View')").first().click();
  await expect(page.locator("p").last()).toHaveText("You are not authorize to view this order");
});
