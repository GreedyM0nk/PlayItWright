import { test, expect, request, Page } from '@playwright/test';
import { APIUtils } from '../utils/APiUtils';

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

// create order is success
test('@SP Place the order', async ({ page }: { page: Page }) => {
  page.addInitScript(value => {
    window.localStorage.setItem('token', value);
  }, response.token);
  
  await page.goto("https://rahulshettyacademy.com/client");

  await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
    async route => {
      const res = await page.request.fetch(route.request());
      let body = JSON.stringify(fakePayLoadOrders);
      route.fulfill({
        response: res,
        body
      });
      // intercepting response - APi response-> { playwright fakeresponse}->browser->render data on front end
    });

  await page.locator("button[routerlink*='myorders']").click();
  await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*");

  console.log(await page.locator(".mt-4").textContent());
});
