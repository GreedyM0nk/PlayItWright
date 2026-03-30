import { Page, Route, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * API PAGE OBJECT
 * ===============
 * 
 * Manages API request interception and mocking:
 * - Intercept API requests
 * - Mock API responses
 * - Verify API calls
 * - Handle network errors
 * - Log all API traffic
 * 
 * Purpose: Centralize API mocking and verification
 */
export class APIPage extends BasePage {
  private interceptedRequests: Map<string, any> = new Map();
  private interceptedResponses: Map<string, any> = new Map();
  private requestCount: Map<string, number> = new Map();

  constructor(page: Page) {
    super(page);
    this.setupRequestLogging();
  }

  /**
   * Setup automatic request/response logging
   * Logs all API calls for debugging
   */
  private setupRequestLogging(): void {
    this.page.on('request', (request) => {
      const url = request.url();
      const method = request.method();

      if (url.includes('/api') || url.includes('/orders')) {
        console.log(`📤 [${method}] ${url.split('/').pop()}`);

        // Store request count
        const count = (this.requestCount.get(url) || 0) + 1;
        this.requestCount.set(url, count);

        // Store request details
        this.interceptedRequests.set(url, {
          method,
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('response', (response) => {
      const url = response.url();

      if (url.includes('/api') || url.includes('/orders')) {
        const status = response.status();
        const statusOk = status >= 200 && status < 300;
        const indicator = statusOk ? '✅' : '❌';

        console.log(`📥 ${indicator} [${status}] ${url.split('/').pop()}`);

        // Store response details
        this.interceptedResponses.set(url, {
          status,
          headers: response.headers(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Route (intercept and mock) specific API request
   * Usage: await apiPage.mockRoute('/api/orders', 200, { orderId: '123' })
   */
  async mockRoute(urlPattern: string, statusCode: number, responseBody: any): Promise<void> {
    await this.page.route(`**${urlPattern}**`, async (route: Route) => {
      console.log(`🔀 Mocking ${urlPattern} with status ${statusCode}`);

      await route.abort('blockedbyclient');

      // In real implementation, would respond with mocked data
      // For now, just log that it was intercepted
    });
  }

  /**
   * Abort specific API requests
   * Usage: await apiPage.blockRoute('/api/analytics')
   */
  async blockRoute(urlPattern: string): Promise<void> {
    await this.page.route(`**${urlPattern}**`, (route: Route) => {
      console.log(`🚫 Blocking requests to ${urlPattern}`);
      route.abort('blockedbyclient');
    });
  }

  /**
   * Continue route with modified response
   * Usage: await apiPage.modifyRoute('/api/products', (response) => { ... })
   */
  async modifyRoute(urlPattern: string, modifier: (data: any) => any): Promise<void> {
    await this.page.route(`**${urlPattern}**`, async (route: Route) => {
      const response = await route.fetch();
      const json = await response.json();
      const modified = modifier(json);

      await route.fulfill({
        response,
        body: JSON.stringify(modified)
      });

      console.log(`✏️ Modified response for ${urlPattern}`);
    });
  }

  /**
   * Get intercepted request by URL pattern
   * Usage: const req = await apiPage.getInterceptedRequest('/orders')
   */
  getInterceptedRequest(urlPattern: string): any {
    const entries = Array.from(this.interceptedRequests.entries());
    for (const [url, request] of entries) {
      if (url.includes(urlPattern)) {
        return request;
      }
    }
    return null;
  }

  /**
   * Get intercepted response by URL pattern
   */
  getInterceptedResponse(urlPattern: string): any {
    const entries = Array.from(this.interceptedResponses.entries());
    for (const [url, response] of entries) {
      if (url.includes(urlPattern)) {
        return response;
      }
    }
    return null;
  }

  /**
   * Get count of requests to specific endpoint
   * Usage: const count = await apiPage.getRequestCount('/api/orders')
   */
  getRequestCount(urlPattern: string): number {
    const entries = Array.from(this.requestCount.entries());
    for (const [url, count] of entries) {
      if (url.includes(urlPattern)) {
        return count;
      }
    }
    return 0;
  }

  /**
   * Verify API request was made
   * Usage: await apiPage.verifyRequestMade('/api/login')
   */
  async verifyRequestMade(urlPattern: string): Promise<void> {
    const request = this.getInterceptedRequest(urlPattern);
    expect(request).toBeTruthy();
    console.log(`✅ Request verified: ${urlPattern}`);
  }

  /**
   * Verify API response status
   * Usage: await apiPage.verifyResponseStatus('/api/orders', 200)
   */
  async verifyResponseStatus(urlPattern: string, expectedStatus: number): Promise<void> {
    const response = this.getInterceptedResponse(urlPattern);
    expect(response?.status).toBe(expectedStatus);
    console.log(`✅ Response status verified: ${urlPattern} = ${expectedStatus}`);
  }

  /**
   * Verify no requests to specific endpoint
   * Usage: await apiPage.verifyNoRequest('/api/analytics')
   */
  async verifyNoRequest(urlPattern: string): Promise<void> {
    const request = this.getInterceptedRequest(urlPattern);
    expect(request).toBeFalsy();
    console.log(`✅ Verified no request to: ${urlPattern}`);
  }

  /**
   * Wait for specific API request
   * Usage: await apiPage.waitForRequest('/api/orders', 5000)
   */
  async waitForRequest(urlPattern: string, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const request = this.getInterceptedRequest(urlPattern);
      if (request) {
        console.log(`✅ Request detected: ${urlPattern}`);
        return;
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Request to ${urlPattern} not detected within ${timeout}ms`);
  }

  /**
   * Get request headers
   */
  getRequestHeaders(urlPattern: string): Record<string, string> {
    const request = this.getInterceptedRequest(urlPattern);
    return request?.headers || {};
  }

  /**
   * Get request body (POST/PUT)
   * Usage: const body = await apiPage.getRequestBody('/api/orders')
   */
  getRequestBody(urlPattern: string): string | undefined {
    const request = this.getInterceptedRequest(urlPattern);
    return request?.postData;
  }

  /**
   * Verify request contains specific header
   * Usage: await apiPage.verifyRequestHeader('/api/login', 'Authorization')
   */
  async verifyRequestHeader(urlPattern: string, headerName: string): Promise<void> {
    const headers = this.getRequestHeaders(urlPattern);
    expect(headers[headerName.toLowerCase()]).toBeTruthy();
    console.log(`✅ Header verified: ${headerName}`);
  }

  /**
   * Clear all intercepted data (reset for fresh tracking)
   * Usage: await apiPage.resetInterceptions()
   */
  resetInterceptions(): void {
    this.interceptedRequests.clear();
    this.interceptedResponses.clear();
    this.requestCount.clear();
    console.log(`✅ All API interceptions cleared`);
  }

  /**
   * Get all intercepted requests
   * Useful for debugging
   */
  getAllRequests(): Map<string, any> {
    return this.interceptedRequests;
  }

  /**
   * Get all intercepted responses
   */
  getAllResponses(): Map<string, any> {
    return this.interceptedResponses;
  }

  /**
   * Log all API activity (debugging)
   */
  debugAPIActivity(): void {
    console.log('API ACTIVITY SUMMARY');
    console.log('=======================');

    console.log('REQUESTS:');
    Array.from(this.interceptedRequests.entries()).forEach(([url, request]) => {
      console.log(`  ${request.method} ${url}`);
    });

    console.log('RESPONSES:');
    Array.from(this.interceptedResponses.entries()).forEach(([url, response]) => {
      console.log(`  ${response.status} ${url}`);
    });

    console.log('COUNTS:');
    Array.from(this.requestCount.entries()).forEach(([url, count]) => {
      console.log(`  ${url}: ${count} request(s)`);
    });

    console.log('=======================');
  }

  /**
   * Simulate network error for specific endpoint
   * Usage: await apiPage.simulateNetworkError('/api/orders')
   */
  async simulateNetworkError(urlPattern: string): Promise<void> {
    await this.page.route(`**${urlPattern}**`, async (route: Route) => {
      await route.abort('failed');
      console.log(`⚡ Simulated network error for ${urlPattern}`);
    });
  }

  /**
   * Simulate slow network response
   * Usage: await apiPage.simulateSlowResponse('/api/orders', 3000)
   */
  async simulateSlowResponse(urlPattern: string, delayMs: number): Promise<void> {
    await this.page.route(`**${urlPattern}**`, async (route: Route) => {
      await this.page.waitForTimeout(delayMs);
      await route.continue();
      console.log(`🐌 Simulated ${delayMs}ms delay for ${urlPattern}`);
    });
  }
}
