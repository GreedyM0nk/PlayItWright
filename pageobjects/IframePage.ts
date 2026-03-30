import { Page, FrameLocator, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * IFRAME PAGE OBJECT
 * ==================
 * 
 * Manages iframe/frame interactions:
 * - Navigate between frames
 * - Click elements in frames
 * - Get text from frames
 * - Wait for frame content
 * - Handle nested iframes
 * 
 * Purpose: Centralize all iframe handling
 * Avoids scattered frame.locator() calls throughout tests
 */
export class IframePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get frame by ID attribute
   * Usage: const frame = await iframePage.getFrameById('myFrame')
   */
  getFrameById(frameId: string): FrameLocator {
    return this.page.frameLocator(`[id="${frameId}"]`);
  }

  /**
   * Get frame by name attribute
   * Usage: const frame = await iframePage.getFrameByName('content')
   */
  getFrameByName(frameName: string): FrameLocator {
    return this.page.frameLocator(`[name="${frameName}"]`);
  }

  /**
   * Get frame by selector
   * Usage: const frame = await iframePage.getFrameBySelector('iframe.embed')
   */
  getFrameBySelector(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  /**
   * Get all frames on page
   * Usage: const frames = await iframePage.getAllFrames()
   */
  getAllFrames(): FrameLocator[] {
    const frameLocators: FrameLocator[] = [];
    const iframes = this.page.locator('iframe');
    
    // Note: Playwright doesn't directly enumerate frames,
    // so you need to know the selectors in advance
    return frameLocators;
  }

  /**
   * Wait for frame to be loaded and accessible
   */
  async waitForFrameLoad(frameSelector: string, timeout: number = 10000): Promise<FrameLocator> {
    const frame = this.page.frameLocator(frameSelector);
    // Verify frame has content by checking for body
    await expect(frame.locator('body')).toBeVisible();
    console.log(`Frame loaded: ${frameSelector}`);
    return frame;
  }

  /**
   * Click element inside iframe
   * Usage: await iframePage.clickInFrame('iframe#editor', 'button.save')
   */
  async clickInFrame(frameSelector: string, elementSelector: string): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const element = frame.locator(elementSelector);
    await expect(element).toBeEnabled({ timeout: 5000 });
    await element.click();
    console.log(`✅ Clicked in frame: ${elementSelector}`);
  }

  /**
   * Fill input inside iframe
   * Usage: await iframePage.fillInFrame('iframe#edit', 'input.title', 'New Title')
   */
  async fillInFrame(frameSelector: string, inputSelector: string, value: string): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const input = frame.locator(inputSelector);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.clear();
    await input.fill(value);
    console.log(`✅ Filled in frame: ${value}`);
  }

  /**
   * Get text from element in iframe
   * Usage: const text = await iframePage.getTextInFrame('iframe#content', 'h1')
   */
  async getTextInFrame(frameSelector: string, elementSelector: string): Promise<string> {
    const frame = this.page.frameLocator(frameSelector);
    const element = frame.locator(elementSelector);
    await expect(element).toBeVisible({ timeout: 5000 });
    const text = await element.textContent();
    return text || '';
  }

  /**
   * Check if element exists in iframe
   * Usage: const exists = await iframePage.isElementInFrame('iframe#content', '.error')
   */
  async isElementInFrame(frameSelector: string, elementSelector: string): Promise<boolean> {
    try {
      const frame = this.page.frameLocator(frameSelector);
      const element = frame.locator(elementSelector);
      await expect(element).toBeVisible({ timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Select option in dropdown inside iframe
   * Usage: await iframePage.selectOptionInFrame('iframe#form', 'select.country', 'India')
   */
  async selectOptionInFrame(frameSelector: string, selectSelector: string, optionValue: string): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const select = frame.locator(selectSelector);
    await expect(select).toBeEnabled({ timeout: 5000 });
    await select.selectOption(optionValue);
    console.log(`✅ Selected option in frame: ${optionValue}`);
  }

  /**
   * Get all text from iframe
   * Useful for debugging what's inside iframe
   */
  async getAllTextInFrame(frameSelector: string): Promise<string> {
    const frame = this.page.frameLocator(frameSelector);
    const text = await frame.locator('body').textContent();
    return text || '';
  }

  /**
   * Wait for element to appear in iframe
   * Usage: await iframePage.waitForElementInFrame('iframe#edit', '.success', 5000)
   */
  async waitForElementInFrame(
    frameSelector: string,
    elementSelector: string,
    timeout: number = 5000
  ): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const element = frame.locator(elementSelector);
    await expect(element).toBeVisible({ timeout });
    console.log(`✅ Element appeared in frame: ${elementSelector}`);
  }

  /**
   * Wait for element to disappear in iframe
   */
  async waitForElementHiddenInFrame(
    frameSelector: string,
    elementSelector: string,
    timeout: number = 5000
  ): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const element = frame.locator(elementSelector);
    await expect(element).not.toBeVisible({ timeout });
    console.log(`✅ Element hidden in frame: ${elementSelector}`);
  }

  /**
   * Count elements in iframe
   * Usage: const count = await iframePage.countElementsInFrame('iframe#list', 'li')
   */
  async countElementsInFrame(frameSelector: string, elementSelector: string): Promise<number> {
    const frame = this.page.frameLocator(frameSelector);
    const elements = frame.locator(elementSelector);
    return await elements.count();
  }

  /**
   * Get specific element by index from iframe
   * Usage: const text = await iframePage.getElementTextInFrame('iframe#list', 'li', 0)
   */
  async getElementTextInFrame(
    frameSelector: string,
    elementSelector: string,
    index: number
  ): Promise<string> {
    const frame = this.page.frameLocator(frameSelector);
    const element = frame.locator(elementSelector).nth(index);
    const text = await element.textContent();
    return text || '';
  }

  /**
   * Execute JavaScript in iframe context
   */
  async evaluateInFrame(frameSelector: string, pageFunction: () => any): Promise<any> {
    const frame = this.page.frameLocator(frameSelector);
    const content = frame.locator('body');
    return await content.evaluate((el: any) => (window as any).myVar);
  }

  /**
   * Handle nested iframes (iframe within iframe)
   * Usage: const text = await iframePage.getTextInNestedFrame('iframe#outer', 'iframe#inner', 'h1')
   */
  async getTextInNestedFrame(
    outerFrameSelector: string,
    innerFrameSelector: string,
    elementSelector: string
  ): Promise<string> {
    const outerFrame = this.page.frameLocator(outerFrameSelector);
    const innerFrame = outerFrame.frameLocator(innerFrameSelector);
    const element = innerFrame.locator(elementSelector);
    const text = await element.textContent();
    return text || '';
  }

  /**
   * Take screenshot of iframe content
   */
  async screenshotFrame(frameSelector: string, name: string): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    const locator = frame.locator('body');
    await locator.screenshot({ path: `./screenshots/frame-${name}.png` });
    console.log(`📸 Frame screenshot: frame-${name}.png`);
  }
}
