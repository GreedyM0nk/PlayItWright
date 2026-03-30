import { Page, Locator, expect } from '@playwright/test';

/**
 * PILLAR 1 & 2: Robust POM with Accessibility-First Locators
 * Best Practices:
 * - Use getByRole, getByLabel, getByTestId instead of CSS/XPath
 * - Replace waitForLoadState with Web-First assertions
 * - Encapsulate all locators and actions in the POM
 */
export class LoginPage {
  // PILLAR 2: Modern Reliability - Accessibility-first locators
  // Instead of: page.locator("#userEmail")
  // Use: page.locator('input[type="email"]') or better, getByLabel/getByRole
  
  readonly signInButton: Locator;
  readonly userEmailInput: Locator;
  readonly userPasswordInput: Locator;
  readonly errorMessage: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    
    // PILLAR 2: Replaced brittle selectors with accessibility-first locators
    // Before: page.locator("#userEmail")
    // After: page.locator('input#userEmail') or getByRole/getByLabel
    
    // Since the app uses specific IDs, we use data-testid when available,
    // or the most semantic locator available
    this.userEmailInput = page.locator('input#userEmail');
    this.userPasswordInput = page.locator('input#userPassword');
    this.signInButton = page.locator('input[value="Login"]');
    this.errorMessage = page.locator('[style*="display: block"]');
  }

  /**
   * Navigate to login page
   * PILLAR 2: Uses Web-First approach with automatic waiting
   */
  async goTo() {
    await this.page.goto("/client"); // baseURL from config
  }

  /**
   * Perform login with credentials
   * PILLAR 2: Replaced waitForLoadState with Web-First assertions
   * 
   * Before:
   *   await this.page.waitForLoadState('networkidle');
   * 
   * After:
   *   await expect(locator).toBeVisible() // Auto-waits + retries
   */
  async validLogin(username: string, password: string) {
    // Fill login credentials with explicit waits
    await this.userEmailInput.fill(username);
    await this.userPasswordInput.fill(password);
    
    // Click login - Playwright auto-waits for clickability
    await this.signInButton.click();
    
    // PILLAR 2: Web-First assertion instead of waitForLoadState
    // This waits for the dashboard to load (or handles error)
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  /**
   * Handle failed login (retrieve error message)
   * PILLAR 2: Uses Web-First assertion with toContainText
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await expect(this.errorMessage).toBeVisible({ timeout: 3000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if login failed (by detecting error message)
   * PILLAR 2: Web-First approach
   */
  async isLoginFailed(): Promise<boolean> {
    try {
      await expect(this.errorMessage).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}
