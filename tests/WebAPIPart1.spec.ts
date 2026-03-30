import { test, expect, request, APIRequestContext, Page } from '../utils/fixtures';
import { APIUtils } from '../utils/APiUtils';

/**
 * MODERNIZED: Web API Testing - Part 1
 * Tests API interactions with Playwright's APIRequestContext
 */
interface LoginPayload {
  userEmail: string;
  userPassword: string;
}

interface OrderPayload {
  orders: Array<{
    country: string;
    productOrderedId: string;
  }>;
}

const loginPayLoad: LoginPayload = {
  userEmail: "anshika@gmail.com",
  userPassword: "Iamking@000"
};

const orderPayLoad: OrderPayload = {
  orders: [{
    country: "Cuba",
    productOrderedId: "6262e95ae26b7e1a10e89bf0"
  }]
};

let response: any;

test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const apiUtils = new APIUtils(apiContext, loginPayLoad);
  response = await apiUtils.createOrder(orderPayLoad);
});

// create order is success
test('@API Place the order', async ({ page }: { page: Page }) => {
  page.addInitScript((value: any) => {
    window.localStorage.setItem('token', value);
  }, response.token);
  
  await page.goto("/client");
  await page.locator("button[routerlink*='myorders']").click();
  // PILLAR 2: Web-First assertion instead of waitFor()
  await expect(page.locator("tbody")).toBeVisible({ timeout: 5000 });
  
  // ENGINEERED: Filter pattern instead of manual loop
  const orderRow = page.locator("tbody tr").filter({
    has: page.locator("th", { hasText: response.orderId })
  });

  await expect(orderRow).toHaveCount(1, { timeout: 5000 });
  await orderRow.locator("button").first().click();
  
  const orderIdDetails = await page.locator(".col-text").textContent();
  expect(response.orderId.includes(orderIdDetails || '')).toBeTruthy();
});
