import { Page, Locator, expect } from '@playwright/test';

/**
 * PILLAR 1 & 2: Orders History Page with Modern Reliability
 * 
 * Improvements:
 * - Web-First assertions with auto-retrying
 * - Semantic locators
 * - Error handling and logging
 * - Return type annotations
 */
export class OrdersHistoryPage {
  readonly ordersTable: Locator;
  readonly rows: Locator;
  readonly orderIdDetails: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.ordersTable = page.locator('tbody');
    this.rows = page.locator('tbody tr');
    this.orderIdDetails = page.locator('.col-text');
  }

  /**
   * Search for order by ID and select it
   * ENGINEERED: Using filter() pattern instead of manual loop
   */
  async searchOrderAndSelect(orderId: string): Promise<void> {
    // Wait for table to be visible with auto-retry
    await expect(this.ordersTable).toBeVisible({ timeout: 8000 });

    const rowCount = await this.rows.count();
    if (rowCount === 0) {
      throw new Error(`❌ No orders found in history table`);
    }

    // ENGINEERED: Filter pattern instead of loop
    // Replaces: for (let i = 0; i < rowCount; ++i) { ... }
    const orderRow = this.rows.filter({
      has: this.page.locator('th', { hasText: orderId })
    });

    // Verify exactly one order found
    try {
      await expect(orderRow).toHaveCount(1, { timeout: 5000 });
      console.log(`✅ Found order ${orderId}`);
    } catch (error) {
      throw new Error(`❌ Order "${orderId}" not found in order history`);
    }
    
    // Click the view button for the order
    const viewButton = orderRow.locator('button').first();
    await expect(viewButton).toBeEnabled({ timeout: 5000 });
    await viewButton.click();
  }

  /**
   * Retrieve order ID from confirmation page
   * PILLAR 2: With error handling
   */
  async getOrderId(): Promise<string | null> {
    try {
      // PILLAR 2: Wait for details to be visible
      await expect(this.orderIdDetails).toBeVisible({ timeout: 5000 });
      const id = await this.orderIdDetails.textContent();
      console.log(`✅ Retrieved order ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`❌ Failed to retrieve order ID`);
      throw error;
    }
  }

  /**
   * Wait for orders page to fully load
   * PILLAR 2: Helper for robust test setup
   */
  async waitForOrdersPageLoad(): Promise<void> {
    await expect(this.ordersTable).toBeVisible({ timeout: 10000 });
    await expect(this.rows.first()).toBeVisible({ timeout: 5000 });
    console.log(`✅ Orders page fully loaded`);
  }
}
