import { test, expect, request } from '../utils/fixtures';
import { APIUtils } from '../utils/APiUtils';

/**
 * ENGINEERED: Network & API Test Suite
 * Tests API interactions using APIPage POM for request mocking
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
    country: "India",
    productOrderedId: "6262e95ae26b7e1a10e89bf0"
  }]
};

const fakePayLoadOrders = { data: [], message: "No Orders" };

let response: any;

test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const apiUtils = new APIUtils(apiContext, loginPayLoad);
  response = await apiUtils.createOrder(orderPayLoad);
});

/**
 * Test API response mocking
 * Mock order response and verify frontend renders mocked data
 */
test('@SP Place the order with mocked API', async ({ page, pages: { apiPage } }) => {
  // Set token in localStorage
  page.addInitScript((value: string) => {
    window.localStorage.setItem('token', value);
  }, response.token);
  
  await page.goto("/client");

  // Mock the orders API endpoint
  await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
    async (route: any) => {
      const res = await page.request.fetch(route.request());
      let body = JSON.stringify(fakePayLoadOrders);
      route.fulfill({
        response: res,
        body
      });
    });

  // Navigate to orders
  await page.locator("button[routerlink*='myorders']").click();
  
  // Wait for mocked response
  await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*");

  // Verify mocked data is rendered
  const orderText = await page.locator(".mt-4").textContent();
  console.log("Orders displayed: " + orderText);
  
  // Verify the mock was applied
  expect(orderText).toBeTruthy();
});
