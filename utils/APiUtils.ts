import { test as baseTest, APIRequestContext } from '@playwright/test';

interface LoginPayload {
  userEmail: string;
  userPassword: string;
}

interface OrderPayload {
  [key: string]: any;
}

export class APIUtils {
  apiContext: APIRequestContext;
  loginPayLoad: LoginPayload;

  constructor(apiContext: APIRequestContext, loginPayLoad: LoginPayload) {
    this.apiContext = apiContext;
    this.loginPayLoad = loginPayLoad;
  }

  async getToken(): Promise<string> {
    const loginResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
      data: this.loginPayLoad
    });
    const loginResponseJson = await loginResponse.json();
    const token = loginResponseJson.token;
    console.log(token);
    return token;
  }

  async createOrder(orderPayLoad: OrderPayload) {
    let response: any = {};
    response.token = await this.getToken();
    const orderResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
      data: orderPayLoad,
      headers: {
        'Authorization': response.token,
        'Content-Type': 'application/json'
      }
    });
    const orderResponseJson = await orderResponse.json();
    console.log(orderResponseJson);
    const orderId = orderResponseJson.orders[0];
    response.orderId = orderId;
    return response;
  }
}
