import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED: Security Test - Request Interception
 * Updated to use modern fixtures and Web-First assertions
 */
test('@QW Security test request intercept', async ({ page }) => {
  // login and reach orders page
  await page.goto("https://rahulshettyacademy.com/client");
  await page.locator("#userEmail").fill("anshika@gmail.com");
  await page.locator("#userPassword").fill("Iamking@000");
  await page.locator("[value='Login']").click();
  // PILLAR 2: Specific URL wait instead of networkidle
  await page.waitForURL(/\/client.*/, { timeout: 10000 });
  // PILLAR 2: Web-First assertion instead of waitFor()
  await expect(page.locator(".card-body b").first()).toBeVisible({ timeout: 5000 });

  await page.locator("button[routerlink*='myorders']").click();
  await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
    route => route.continue({ url: 'https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6' }));
  await page.locator("button:has-text('View')").first().click();
  await expect(page.locator("p").last()).toHaveText("You are not authorize to view this order");
});
