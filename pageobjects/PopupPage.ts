import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * POPUP PAGE OBJECT
 * =================
 * 
 * Manages all popup interactions:
 * - Alert dialogs (accept/dismiss)
 * - Confirm dialogs
 * - Prompt dialogs
 * - Modal windows
 * - Toast notifications
 * 
 * Purpose: Centralize all dialog/popup handling
 * Avoids scattered dialog.accept/dismiss in tests
 */
export class PopupPage extends BasePage {
  private dialogMessage: string | null = null;
  private dialogType: string | null = null;

  constructor(page: Page) {
    super(page);
    this.setupDialogListeners();
  }

  /**
   * Setup listeners for all dialog types
   * This auto-captures dialog info without blocking test
   */
  private setupDialogListeners(): void {
    this.page.on('dialog', (dialog) => {
      this.dialogMessage = dialog.message();
      this.dialogType = dialog.type();
      console.log(`💬 Dialog captured: [${dialog.type()}] "${dialog.message()}"`);
      
      // Auto-accept by default (can be overridden per test)
      dialog.accept();
    });
  }

  /**
   * Accept alert dialog
   * Usage: await popupPage.acceptAlert()
   */
  async acceptAlert(): Promise<void> {
    await this.page.on('dialog', (dialog) => {
      console.log(`✅ Accepting alert: "${dialog.message()}"`);
      dialog.accept();
    });
  }

  /**
   * Dismiss confirmation dialog
   * Usage: await popupPage.dismissConfirm()
   */
  async dismissConfirm(): Promise<void> {
    await this.page.on('dialog', (dialog) => {
      if (dialog.type() === 'confirm') {
        console.log(`❌ Dismissing confirm: "${dialog.message()}"`);
        dialog.dismiss();
      }
    });
  }

  /**
   * Get last dialog message
   * Usage: const msg = await popupPage.getLastDialogMessage()
   */
  getLastDialogMessage(): string | null {
    return this.dialogMessage;
  }

  /**
   * Get last dialog type (alert | confirm | prompt | beforeunload)
   */
  getLastDialogType(): string | null {
    return this.dialogType;
  }

  /**
   * Check if modal is visible with specific selector
   * Usage: await popupPage.isModalVisible('.modal')
   */
  async isModalVisible(selector: string): Promise<boolean> {
    return await this.isElementVisible(selector, 2000);
  }

  /**
   * Close modal by clicking close button or backdrop
   * Usage: await popupPage.closeModal('.modal-close, .modal-backdrop')
   */
  async closeModal(closeSelector: string): Promise<void> {
    await this.clickElement(closeSelector);
    console.log(`✅ Modal closed`);
  }

  /**
   * Handle file picker dialog
   * Note: Playwright can't directly interact with native file picker,
   * but can set file via setInputFiles()
   * Usage: await popupPage.selectFile('input[type="file"]', 'path/to/file.txt')
   */
  async selectFile(inputSelector: string, filePath: string): Promise<void> {
    await this.page.locator(inputSelector).setInputFiles(filePath);
    console.log(`📁 File selected: ${filePath}`);
  }

  /**
   * Handle toast notification
   * Wait for toast to appear and disappear
   * Usage: await popupPage.waitForToast('.toast-notification', 'Item added')
   */
  async waitForToast(selector: string, expectedText?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator(selector);
    
    // Wait for toast to appear
    await expect(toast).toBeVisible({ timeout });
    console.log(`✅ Toast appeared`);

    // Verify text if provided
    if (expectedText) {
      await expect(toast).toContainText(expectedText, { timeout });
    }

    // Wait for toast to disappear (usually auto-dismisses)
    await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {
      console.warn(`⚠️ Toast did not auto-dismiss within 10s`);
    });
  }

  /**
   * Get toast message text
   * Usage: const msg = await popupPage.getToastMessage('.toast')
   */
  async getToastMessage(selector: string): Promise<string> {
    return await this.getTextContent(selector, 3000);
  }

  /**
   * Wait for multiple toasts
   * Usage: await popupPage.waitForToasts('.toast', 2)
   */
  async waitForToastCount(selector: string, count: number, timeout: number = 5000): Promise<void> {
    const toasts = this.page.locator(selector);
    await expect(toasts).toHaveCount(count, { timeout });
    console.log(`✅ Found ${count} toasts`);
  }

  /**
   * Handle confirmation with custom handler
   * Usage: await popupPage.handleConfirm((dialog) => dialog.accept())
   */
  async handleConfirm(handler: (dialog: any) => Promise<void>): Promise<void> {
    const dialogHandler = async (dialog: any) => {
      await handler(dialog);
    };
    
    this.page.once('dialog', dialogHandler);
  }

  /**
   * Get popup/modal by test ID (accessibility)
   * Usage: const modal = await popupPage.getPopupByTestId('my-modal')
   */
  async getPopupByTestId(testId: string): Promise<any> {
    const selector = `[data-testid="${testId}"]`;
    return this.page.locator(selector);
  }

  /**
   * Verify modal has expected content
   * Usage: await popupPage.verifyModalContent('.modal', 'Confirm deletion?')
   */
  async verifyModalContent(modalSelector: string, expectedText: string): Promise<void> {
    const modal = this.page.locator(modalSelector);
    await expect(modal).toContainText(expectedText);
    console.log(`✅ Modal content verified: "${expectedText}"`);
  }

  /**
   * Click button in modal/popup
   * Usage: await popupPage.clickModalButton('.modal', 'Confirm')
   */
  async clickModalButton(modalSelector: string, buttonText: string): Promise<void> {
    const modal = this.page.locator(modalSelector);
    const button = modal.locator(`button:has-text("${buttonText}")`);
    await expect(button).toBeEnabled({ timeout: 5000 });
    await button.click();
    console.log(`✅ Clicked button in modal: "${buttonText}"`);
  }

  /**
   * Wait for modal to close
   * Usage: await popupPage.waitForModalClose('.modal')
   */
  async waitForModalClose(selector: string, timeout: number = 10000): Promise<void> {
    const modal = this.page.locator(selector);
    await expect(modal).not.toBeVisible({ timeout });
    console.log(`✅ Modal closed`);
  }
}
