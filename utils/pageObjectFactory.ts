import { Page } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { DashboardPage } from '../pageobjects/DashboardPage';
import { CartPage } from '../pageobjects/CartPage';
import { OrdersHistoryPage } from '../pageobjects/OrdersHistoryPage';
import { OrdersReviewPage } from '../pageobjects/OrdersReviewPage';
import { BasePage } from '../pageobjects/BasePage';
import { PopupPage } from '../pageobjects/PopupPage';
import { IframePage } from '../pageobjects/IframePage';
import { CalendarPage } from '../pageobjects/CalendarPage';
import { APIPage } from '../pageobjects/APIPage';

/**
 * PAGE OBJECT FACTORY
 * 
 * Central factory for creating and managing Page Object instances.
 * Implements lazy-loading to avoid unnecessary instantiation.
 * 
 * Usage:
 * - In fixtures: new PageObjectFactory(page)
 * - In tests: await use({ pages: factory.getAllPages() })
 * 
 * Benefits:
 * - Single source of truth for POM instantiation
 * - Lazy-loading: only creates POMs when accessed
 * - Caching: reuses POM instances across test
 * - Extensible: easy to add new POMs
 * 
 * Architecture:
 * ┌─ Page
 * ├─ Factory (creates POMs on demand)
 * ├─ LoginPage
 * ├─ DashboardPage
 * ├─ CartPage
 * ├─ OrdersHistoryPage
 * └─ OrdersReviewPage
 */
export class PageObjectFactory {
  private page: Page;
  private instances: Map<string, any> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Lazy-load pattern for page objects
   * Only instantiates a POM when it's first accessed
   * Subsequent accesses return the cached instance
   */
  private getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
      console.log(`[FACTORY] Created instance: ${key}`);
    }
    return this.instances.get(key) as T;
  }

  /**
   * Get LoginPage instance
   * Handles authentication flow, credentials validation, error handling
   */
  loginPage(): LoginPage {
    return this.getInstance('loginPage', () => new LoginPage(this.page));
  }

  /**
   * Get DashboardPage instance
   * Handles product search, cart navigation, order access
   */
  dashboardPage(): DashboardPage {
    return this.getInstance('dashboardPage', () => new DashboardPage(this.page));
  }

  /**
   * Get CartPage instance
   * Handles cart verification, checkout flow
   */
  cartPage(): CartPage {
    return this.getInstance('cartPage', () => new CartPage(this.page));
  }

  /**
   * Get OrdersHistoryPage instance
   * Handles order search, order detail verification
   */
  ordersHistoryPage(): OrdersHistoryPage {
    return this.getInstance('ordersHistoryPage', () => new OrdersHistoryPage(this.page));
  }

  /**
   * Get OrdersReviewPage instance
   * Handles country selection, email verification, order placement
   */
  ordersReviewPage(): OrdersReviewPage {
    return this.getInstance('ordersReviewPage', () => new OrdersReviewPage(this.page));
  }

  /**
   * Get BasePage instance
   * Provides shared utilities for all tests
   */
  basePage(): BasePage {
    return this.getInstance('basePage', () => new BasePage(this.page));
  }

  /**
   * Get PopupPage instance
   * Handles dialogs, modals, and toast notifications
   */
  popupPage(): PopupPage {
    return this.getInstance('popupPage', () => new PopupPage(this.page));
  }

  /**
   * Get IframePage instance
   * Handles iframe and frame navigation
   */
  iframePage(): IframePage {
    return this.getInstance('iframePage', () => new IframePage(this.page));
  }

  /**
   * Get CalendarPage instance
   * Handles calendar widget interactions and date selection
   */
  calendarPage(): CalendarPage {
    return this.getInstance('calendarPage', () => new CalendarPage(this.page));
  }

  /**
   * Get APIPage instance
   * Handles API request interception and mocking
   */
  apiPage(): APIPage {
    return this.getInstance('apiPage', () => new APIPage(this.page));
  }

  /**
   * Get all page objects as a single object
   * Useful for destructuring in tests:
   * const { loginPage, dashboardPage, cartPage, popupPage } = factory.getAllPages();
   */
  getAllPages() {
    return {
      loginPage: this.loginPage(),
      dashboardPage: this.dashboardPage(),
      cartPage: this.cartPage(),
      ordersHistoryPage: this.ordersHistoryPage(),
      ordersReviewPage: this.ordersReviewPage(),
      basePage: this.basePage(),
      popupPage: this.popupPage(),
      iframePage: this.iframePage(),
      calendarPage: this.calendarPage(),
      apiPage: this.apiPage(),
    };
  }

  /**
   * Clear all cached instances (useful for context switches)
   */
  clearCache(): void {
    this.instances.clear();
    console.log('[FACTORY] Cache cleared');
  }
}
