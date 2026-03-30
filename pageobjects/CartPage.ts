import { Page, Locator, expect } from '@playwright/test';

/**
 * PILLAR 1 & 2: Cart Page Object with Modern Web-First Assertions
 * 
 * Improvements:
 * - Replaced waitFor() with expect().toBeVisible()
 * - Better semantic locators
 * - Enhanced error messages
 */
export class CartPage {
  readonly cartProducts: Locator;
  readonly checkout: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    
    // PILLAR 2: More semantic locators
    this.cartProducts = page.locator('div li').first();
    this.checkout = page.locator('text=/Checkout/i');
  }

  /**
   * Verify product is displayed in cart
   * PILLAR 2: Using Web-First assertion instead of waitFor()
   * 
   * Before:
   *   await this.cartProducts.waitFor();
   *   const bool = await this.getProductLocator(productName).isVisible();
   *   expect(bool).toBeTruthy();
   * 
   * After:
   *   await expect(locator).toBeVisible();
   */
  async VerifyProductIsDisplayed(productName: string): Promise<void> {
    const productLocator = this.getProductLocator(productName);
    
    // PILLAR 2: Web-First assertion with auto-retry and clear error message
    try {
      await expect(productLocator).toBeVisible({ timeout: 8000 });
      console.log(`✅ Product "${productName}" verified in cart`);
    } catch (error) {
      throw new Error(`❌ Product "${productName}" not found in cart`);
    }
  }

  /**
   * Proceed to checkout
   * PILLAR 2: Ensures checkout button is interactive before clicking
   */
  async Checkout(): Promise<void> {
    // PILLAR 2: Ensure button is enabled and clickable
    await expect(this.checkout).toBeEnabled({ timeout: 5000 });
    
    // Wait for navigation to checkout
    const navigationPromise = this.page.waitForURL(/.*orders.*/);
    await this.checkout.click();
    await navigationPromise;
    
    console.log(`✅ Proceeding to checkout`);
  }

  /**
   * Get product locator by name
   * PILLAR 2: More robust selector using regex for case-insensitivity
   */
  private getProductLocator(productName: string): Locator {
    // PILLAR 2: Case-insensitive locator
    return this.page.locator(`h3:has-text("${productName}")`);
  }
}
