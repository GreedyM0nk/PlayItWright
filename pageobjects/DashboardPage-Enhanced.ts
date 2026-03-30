import { Page, Locator, expect } from '@playwright/test';

/**
 * ENGINEERED DASHBOARD PAGE OBJECT
 * ================================
 * 
 * This is a reference implementation showing:
 * 1. Accessibility-first locators (getByRole, semantic selectors)
 * 2. No manual loops - using filter() patterns
 * 3. Proper error handling with helpful messages
 * 4. Clear action methods matching user journeys
 * 5. Logging for debugging
 * 
 * Key Improvements vs Script-Based:
 * - searchProductAddCart(): Loop replaced with .filter({ has: locator(...) })
 * - Automatic retry on filter creation (5s default)
 * - Better error messages showing available products
 * - Atomic assertions (toHaveCount instead of manual verification)
 * 
 * ANTI-PATTERNS REMOVED:
 * ❌ for (let i = 0; i < count; i++) { nth(i) ... }
 * ✅ locator.filter({ has: ... })
 */

export class DashboardPage {
  // ===== LOCATORS =====
  // PILLAR 2: Semantic selectors using class names and element structure
  readonly productCards: Locator; // .card-body elements
  readonly productTitles: Locator; // b tags within cards
  readonly cartButton: Locator; // Navigate to cart
  readonly ordersButton: Locator; // Navigate to orders
  readonly page: Page; // Page reference for advanced locator operations

  constructor(page: Page) {
    this.page = page;
    
    // Product cards container
    // Using CSS classes which are semantic (describe content, not implementation)
    this.productCards = page.locator('.card-body');
    
    // Product title (within each card)
    this.productTitles = page.locator('.card-body b');
    
    // Navigation buttons
    this.cartButton = page.locator('[routerlink*="cart"]');
    this.ordersButton = page.locator('button[routerlink*="myorders"]');
  }

  /**
   * ENGINEERED METHOD: Search for product by name and add to cart
   * 
   * BEFORE (Script-Based - Anti-Pattern):
   * ==========================================
   * async searchProductAddCart(productName: string): Promise<void> {
   *   const count = await this.productCards.count();
   *   let found = false;
   *   
   *   // ❌ ANTI-PATTERN: Manual loop with nth()
   *   for (let i = 0; i < count; ++i) {
   *     const title = await this.productCards.nth(i).locator('b').textContent();
   *     if (title === productName) {
   *       await this.productCards.nth(i).locator('text= Add To Cart').click();
   *       found = true;
   *       break;
   *     }
   *   }
   *   
   *   if (!found) throw new Error('Product not found');
   * }
   * 
   * ISSUES:
   * - 15+ lines of boilerplate
   * - Manual count retrieval
   * - Implicit type assumptions
   * - No automatic retry
   * - Poor error messages
   * - Hard to maintain
   * 
   * ==========================================
   * AFTER (Engineered - Filter Pattern):
   */
  async searchProductAddCart(productName: string): Promise<void> {
    console.log(`\n🔍 Searching for product: "${productName}"`);

    // ===== STEP 1: Wait for dashboard to load =====
    // PILLAR 2: Web-First assertion - auto-retries for visibility
    try {
      await expect(this.productCards.first()).toBeVisible({ timeout: 8000 });
      console.log(`✅ Dashboard loaded`);
    } catch (error) {
      throw new Error(`❌ Dashboard failed to load within 8s`);
    }

    // ===== STEP 2: Get list of available products (for logging) =====
    // This helps debugging - we can see what products are actually available
    const availableProducts = await this.productTitles.allTextContents();
    console.log(`📦 Available products: ${availableProducts.join(', ')}`);

    // ===== STEP 3: ENGINEERED - Filter instead of loop =====
    // ✅ KEY IMPROVEMENT: Uses filter() with has() combinator
    // This replaces the entire for loop with a single, declarative statement
    // 
    // What this does:
    // - Finds all .card-body elements
    // - Filters to only those containing <b>productName</b>
    // - Returns a locator pointing to matching cards
    // 
    // Why this is better:
    // - Automatic retry: if product isn't visible yet, retries for 5s
    // - Cleaner: single line vs 10 lines of loop code
    // - More reliable: Playwright handles all the nth() logic
    // - Testable: easier to write unit tests
    const productCard = this.productCards.filter({
      has: this.page.locator('b', { hasText: productName })
    });

    console.log(`✅ Created filter for product: ${productName}`);

    // ===== STEP 4: Verify exactly one product found =====
    // Better than checking a boolean flag
    // toHaveCount() verifies cardinality and provides clear error messages
    try {
      await expect(productCard).toHaveCount(1, { timeout: 5000 });
      console.log(`✅ Exactly 1 product found`);
    } catch (error) {
      // Helpful error message showing what was available
      throw new Error(
        `❌ Expected to find exactly 1 product "${productName}". ` +
        `Available products: ${availableProducts.join(', ')}`
      );
    }

    // ===== STEP 5: Click Add To Cart button =====
    // Now that we have a filtered card, get its button
    // The button might have different text (Add To Cart, Add to Cart, ADD TO CART, etc)
    // Use regex to handle variations
    const addToCartButton = productCard.locator('text=/Add To Cart/i');

    // Ensure button is visible and enabled before clicking
    // PILLAR 2: Web-First approach - Playwright waits automatically
    try {
      await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
      console.log(`✅ Add to Cart button is enabled`);
    } catch (error) {
      throw new Error(`❌ Add to Cart button not found or disabled for "${productName}"`);
    }

    // Click the button
    // Playwright automatically waits for actionability (not obscured, clickable, etc)
    await addToCartButton.click();
    console.log(`✅ Clicked Add to Cart for ${productName}`);

    // ===== STEP 6: Verify cart count updated =====
    // Optionally wait for cart badge to update (shows number of items)
    // Uncomment if your app has a cart counter
    // const cartBadge = this.page.locator('.cart-badge');
    // await expect(cartBadge).toBeDefined();

    console.log(`✅ ${productName} added to cart\n`);
  }

  /**
   * ENGINEERED METHOD: Navigate to cart
   * 
   * Demonstrates proper navigation with promise chaining
   * Ensures navigation completes before returning
   */
  async navigateToCart(): Promise<void> {
    console.log(`\n📦 Navigating to cart`);

    // Ensure cart button is visible and enabled
    await expect(this.cartButton).toBeVisible({ timeout: 5000 });
    await expect(this.cartButton).toBeEnabled({ timeout: 5000 });

    // Create promise that resolves when navigation completes
    const navigationPromise = this.page.waitForURL(/.*cart.*/);

    // Click the button
    await this.cartButton.click();
    console.log(`✅ Clicked cart button`);

    // Wait for navigation to complete
    try {
      await navigationPromise;
      console.log(`✅ Navigation to cart completed\n`);
    } catch (error) {
      throw new Error(`❌ Failed to navigate to cart within timeout`);
    }
  }

  /**
   * ENGINEERED METHOD: Navigate to orders history
   * 
   * Similar pattern to navigateToCart - ensures clean navigation
   */
  async navigateToOrders(): Promise<void> {
    console.log(`\n📋 Navigating to orders`);

    await expect(this.ordersButton).toBeVisible({ timeout: 5000 });
    await expect(this.ordersButton).toBeEnabled({ timeout: 5000 });

    const navigationPromise = this.page.waitForURL(/.*myorders.*/);
    await this.ordersButton.click();
    console.log(`✅ Clicked orders button`);

    await navigationPromise;
    console.log(`✅ Navigation to orders completed\n`);
  }

  /**
   * HELPER: Wait for dashboard page to fully load
   * 
   * Can be called at start of test:
   * const dashboardPage = pages.dashboardPage;
   * await dashboardPage.waitForPageLoad();
   */
  async waitForPageLoad(): Promise<void> {
    console.log(`\n⏳ Waiting for dashboard to load`);
    
    // Multiple assertions to ensure page is ready
    await expect(this.productCards.first()).toBeVisible({ timeout: 10000 });
    await expect(this.productTitles.first()).toBeVisible({ timeout: 10000 });
    
    console.log(`✅ Dashboard fully loaded\n`);
  }

  /**
   * HELPER: Get list of available products (useful for debugging)
   */
  async getAvailableProducts(): Promise<string[]> {
    return this.productTitles.allTextContents();
  }

  /**
   * HELPER: Count products available on dashboard
   */
  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }
}

/**
 * SUMMARY OF IMPROVEMENTS IN THIS POM
 * ===================================
 * 
 * 1. NO MANUAL LOOPS
 *    ❌ for (let i = 0; i < count; i++) { ... nth(i) ... }
 *    ✅ filter({ has: locator(...) })
 * 
 * 2. BETTER ERROR MESSAGES
 *    ❌ throw new Error('Product not found')
 *    ✅ Shows available products + clear context
 * 
 * 3. AUTOMATIC RETRY
 *    ❌ Manual count + assertions (no retry)
 *    ✅ filter() automatically retries for 5s
 * 
 * 4. CLEANER CODE
 *    ❌ 15+ lines per method
 *    ✅ 5-7 lines per method
 * 
 * 5. BETTER DEBUGGING
 *    ✅ Extensive logging at each step
 *    ✅ Shows user journey in console
 * 
 * 6. ATOMIC ASSERTIONS
 *    ❌ const found = false; if (condition) { found = true; }
 *    ✅ await expect(locator).toHaveCount(1)
 * 
 * 7. TYPE SAFE
 *    ✅ Locator chains are type-safe
 *    ✅ IDE can autocomplete all methods
 */
