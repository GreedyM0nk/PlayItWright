import { Page, Locator, expect } from '@playwright/test';

/**
 * BASE PAGE OBJECT
 * Provides common utilities for all page objects
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(timeout: number = 10000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      console.log('Page loaded');
    } catch (error) {
      console.warn(`Network idle timeout after ${timeout}ms, continuing anyway`);
    }
  }

  /**
   * Wait for specific element visibility
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    return element;
  }

  /**
   * Check if selector is visible without throwing error
   */
  async isElementVisible(selector: string, timeout: number = 1000): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await expect(element).toBeVisible({ timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get error message if displayed
   */
  async getErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '[style*="display: block"]',
      '.error-message',
      '.alert-danger',
      '[role="alert"]'
    ];

    for (const selector of errorSelectors) {
      const isVisible = await this.isElementVisible(selector);
      if (isVisible) {
        return await this.page.locator(selector).textContent();
      }
    }

    return null;
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = `./screenshots/${name}-${timestamp}.png`;
    
    try {
      await this.page.screenshot({ path: filepath, fullPage: true });
      console.log(`Screenshot saved: ${filepath}`);
    } catch (error) {
      console.warn(`Failed to save screenshot: ${error}`);
    }
  }

  /**
   * Universal click with retry
   */
  async clickElement(selector: string, timeout: number = 5000): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toBeEnabled({ timeout });
    await element.click();
  }

  /**
   * Fill input with retry logic
   */
  async fillInput(selector: string, value: string, timeout: number = 5000): Promise<void> {
    const input = this.page.locator(selector);
    await expect(input).toBeVisible({ timeout });
    await input.clear();
    await input.fill(value);
    console.log(`Filled "${value}" into ${selector}`);
  }

  /**
   * Get text content with retry
   */
  async getTextContent(selector: string, timeout: number = 5000): Promise<string> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    const text = await element.textContent();
    return text || '';
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for navigation to specific URL pattern
   */
  async waitForNavigation(urlPattern: RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Handle all unhandled exceptions
   */
  handleErrors(callback: (error: Error) => void): void {
    this.page.on('pageerror', callback);
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get all text from page
   */
  async getAllPageText(): Promise<string> {
    return await this.page.locator('body').textContent() || '';
  }

  /**
   * Debug log with page state
   */
  debugPageState(): void {
    console.log('PAGE DEBUG INFO');
    console.log('URL: ' + this.page.url());
    console.log('Title: ' + this.page.title());
  }
}
