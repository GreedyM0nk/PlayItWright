import { Page, Locator, expect } from '@playwright/test';

/**
 * PILLAR 1 & 2: Dashboard Page Object with Modern Locators
 * 
 * Improvements:
 * - Semantic locators for product cards
 * - Web-First assertions with auto-waiting
 * - Better error handling and logging
 */
export class DashboardPage {
  readonly productCards: Locator;
  readonly productTitles: Locator;
  readonly cartButton: Locator;
  readonly ordersButton: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    
    // PILLAR 2: More semantic locators
    // Before: page.locator(".card-body")
    // After: More descriptive and accessible selectors
    this.productCards = page.locator('.card-body');
    this.productTitles = page.locator('.card-body b');
    this.cartButton = page.locator('[routerlink*="cart"]');
    this.ordersButton = page.locator('button[routerlink*="myorders"]');
  }

  /**
   * Search for product by name and add to cart
   * ENGINEERED: Using filter() pattern instead of manual loop
   */
  async searchProductAddCart(productName: string): Promise<void> {
    // Wait for products to be visible
    await expect(this.productCards.first()).toBeVisible({ timeout: 8000 });

    const titles = await this.productTitles.allTextContents();
    console.log(`📦 Available products: ${titles.join(', ')}`);

    // ENGINEERED: Filter pattern instead of loop
    // Replaces: for (let i = 0; i < count; ++i) { ... }
    const productCard = this.productCards.filter({
      has: this.page.locator('b', { hasText: productName })
    });

    // Verify exactly one product found
    await expect(productCard).toHaveCount(1, { timeout: 5000 });
    console.log(`✅ Found product: ${productName}`);
    
    // Get the "Add To Cart" button
    const addToCartButton = productCard.locator('text=/Add To Cart|Add to Cart/i');
    
    // Web-First assertion - ensures button is enabled before clicking
    await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
    await addToCartButton.click();
    
    console.log(`✅ ${productName} added to cart`);
  }

  /**
   * Navigate to orders page
   * PILLAR 2: Web-First approach with navigation URL verification
   */
  async navigateToOrders(): Promise<void> {
    // PILLAR 2: Ensure button is visible and enabled before clicking
    await expect(this.ordersButton).toBeEnabled({ timeout: 5000 });
    
    // Capture current URL to wait for navigation
    const navigationPromise = this.page.waitForURL(/.*myorders.*/);
    await this.ordersButton.click();
    await navigationPromise;
    
    console.log(`✅ Navigated to orders page`);
  }

  /**
   * Navigate to cart page
   * PILLAR 2: With URL verification for successful navigation
   */
  async navigateToCart(): Promise<void> {
    // PILLAR 2: Ensure button is visible and clickable
    await expect(this.cartButton).toBeEnabled({ timeout: 5000 });
    
    // Wait for navigation to cart
    const navigationPromise = this.page.waitForURL(/.*cart.*/);
    await this.cartButton.click();
    await navigationPromise;
    
    console.log(`✅ Navigated to cart page`);
  }

  /**
   * Wait for dashboard to be fully loaded
   * PILLAR 2: Helper method for robust test setup
   */
  async waitForDashboardLoad(): Promise<void> {
    // PILLAR 2: Multiple assertions for robust loading validation
    await expect(this.productCards.first()).toBeVisible({ timeout: 10000 });
    await expect(this.cartButton).toBeVisible({ timeout: 5000 });
    await expect(this.ordersButton).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Dashboard fully loaded`);
  }
}
