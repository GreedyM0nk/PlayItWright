import { Page, Locator, expect } from '@playwright/test';

/**
 * PILLAR 1 & 2: Orders Review Page with Modern Reliability
 * 
 * Improvements:
 * - Web-First assertions with auto-retrying
 * - Semantic locators and buttons
 * - Better error handling and validation
 * - Return type annotations
 * - Reduced code duplication
 */
export class OrdersReviewPage {
  readonly countryInput: Locator;
  readonly countryDropdown: Locator;
  readonly emailId: Locator;
  readonly submitButton: Locator;
  readonly orderConfirmationText: Locator;
  readonly orderId: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.countryInput = page.locator('[placeholder*="Country"]');
    this.countryDropdown = page.locator('.ta-results');
    this.emailId = page.locator('.user__name [type="text"]').first();
    this.submitButton = page.locator('.action__submit');
    this.orderConfirmationText = page.locator('.hero-primary');
    this.orderId = page.locator('.em-spacer-1 .ng-star-inserted');
  }

  /**
   * Search for country and select from dropdown
   * ENGINEERED: Using filter() pattern instead of manual loop
   */
  async searchCountryAndSelect(countryCode: string, countryName: string): Promise<void> {
    // Ensure input is visible and enabled
    await expect(this.countryInput).toBeVisible({ timeout: 5000 });
    await expect(this.countryInput).toBeEnabled({ timeout: 5000 });
    
    // Type country code to filter dropdown
    await this.countryInput.pressSequentially(countryCode, { delay: 50 });
    console.log(`🔍 Searching for country: ${countryName}`);
    
    // Wait for dropdown with auto-retry
    await expect(this.countryDropdown).toBeVisible({ timeout: 8000 });
    
    // ENGINEERED: Filter pattern instead of loop
    // Replaces: for (let i = 0; i < optionCount; ++i) { ... }
    const countryOption = this.countryDropdown.locator('button').filter({
      hasText: new RegExp(`^\\s*${countryName}\\s*$`)
    });

    // Verify exactly one country option found
    try {
      await expect(countryOption).toHaveCount(1, { timeout: 5000 });
      console.log(`✅ Found country: ${countryName}`);
    } catch (error) {
      throw new Error(`❌ Country "${countryName}" not found in dropdown`);
    }
    
    // Click the country option
    await expect(countryOption).toBeEnabled({ timeout: 5000 });
    await countryOption.click();
  }

  /**
   * Verify email ID matches expected value
   * PILLAR 2: With proper assertion
   */
  async VerifyEmailId(username: string): Promise<void> {
    // PILLAR 2: Web-First assertion with auto-retry
    await expect(this.emailId).toHaveText(username, { timeout: 5000 });
    console.log(`✅ Email verified: ${username}`);
  }

  /**
   * Submit order and return order ID
   * PILLAR 2: Better validation and error handling
   */
  async SubmitAndGetOrderId(): Promise<string | null> {
    // PILLAR 2: Ensure submit button is enabled
    await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
    
    // Wait for navigation before clicking
    const navigationPromise = this.page.waitForURL(/.*orders.*/);
    await this.submitButton.click();
    await navigationPromise;
    
    console.log(`🔄 Order submitted, waiting for confirmation...`);
    
    // PILLAR 2: Wait for confirmation message
    await expect(this.orderConfirmationText).toContainText('Thankyou for the order', 
      { timeout: 8000 });
    console.log(`✅ Order confirmed`);
    
    // Retrieve and return order ID
    const orderIdText = await this.orderId.textContent();
    console.log(`✅ Order ID: ${orderIdText}`);
    
    return orderIdText;
  }

  /**
   * Wait for review page to fully load
   * PILLAR 2: Helper for robust test setup
   */
  async waitForReviewPageLoad(): Promise<void> {
    await expect(this.countryInput).toBeVisible({ timeout: 10000 });
    await expect(this.emailId).toBeVisible({ timeout: 5000 });
    await expect(this.submitButton).toBeVisible({ timeout: 5000 });
    console.log(`✅ Review page fully loaded`);
  }
}
