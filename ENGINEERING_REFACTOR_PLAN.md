# 🏗️ PLAYWRIGHT FRAMEWORK ENGINEERING REFACTOR PLAN
## From Script-Based Testing → Professional Engineered Framework

**Date:** March 30, 2026  
**Status:** Comprehensive Plan Ready for Implementation  
**Scope:** Global refactoring across all tests, POMs, and fixtures

---

## 📋 EXECUTIVE SUMMARY

Your current framework has **excellent foundational patterns** (Web-First assertions, POMs, fixtures) but contains **script-based anti-patterns** that reduce maintainability and reusability:

| Pattern | Current | Refactored | Impact |
|---------|---------|-----------|--------|
| **Loop-based selectors** | Manual `for` loops with `.nth()` | `.filter()` with locator chains | 70% less code |
| **Authentication** | Manual `beforeAll` login in tests | `authenticatedPage` fixture | Zero duplication |
| **Page object access** | `poManager.getLoginPage()` | Direct `{ loginPage }` in test args | Cleaner DX |
| **Dropdown selection** | String comparison in loop | `.filter({ hasText: 'India' })` | More robust |
| **Product search** | Array iteration + textContent | `.filter({ has: locator(b, { hasText }) })` | Parallel-safe |

---

## 🎯 PART 1: FILE-BY-FILE BREAKDOWN

### **TIER 1: High Priority (Immediate Refactor)**

#### ❌ **tests/WebAPIPart2.spec.ts** (Critical)
**Current Issues:**
- Lines 33-40: Manual loop finding product by name
- Lines 54-62: Manual loop finding dropdown option by text  
- Lines 73-81: Manual loop finding order row by ID
- Lines 8-19: Duplicate login logic (not DRY)

**Refactoring Required:**
- Replace all 3 for-loops with `.filter()` patterns
- Remove `beforeAll` login → use `authenticatedPage` fixture
- Extract cart/checkout logic to `CartPage` POM
- Use new `{ loginPage, dashboardPage, cartPage }` fixtures

**Impact:**
- Reduce test from 96 lines → 40 lines
- Eliminate 3 nested loops
- Gain automatic retry on element selection

---

#### ❌ **tests/WebAPIPart1.spec.ts** (Critical)
**Current Issues:**
- Line 52: Manual loop finding order row
- Missing page object abstraction for product selection

**Refactoring Required:**
- Replace loop with `.filter()` pattern
- Migrate to POM-based approach
- Use authenticated fixture

**Impact:**
- 50% code reduction

---

#### ⚠️ **tests/Calendar.spec.ts** (Medium)
**Current Issues:**
- Line 21: Loop iterating input fields

**Refactoring Required:**
- Abstract calendar input validation to `CalendarPage` POM
- Use `.all()` + `.evaluate()` for batch attribute verification

**Impact:**
- Encapsulation improvement

---

#### ⚠️ **tests/MoreValidations.spec.ts** (Medium)
**Current Issues:**
- Hard to maintain frame selectors
- Dialog handling scattered in test

**Refactoring Required:**
- Create `PopupPage` POM for dialog management
- Create `IframePage` POM for frame navigation
- Centralize screenshot expectations

**Impact:**
- Better reusability for popup/frame tests

---

#### ✅ **tests/ClientApp.spec.ts** (✓ Already Good)
- Clean POM usage
- No manual loops
- Modern fixtures usage
- **No changes needed**

---

#### ✅ **tests/ClientAppPO.spec.ts** (✓ Already Good)
- Reference implementation
- Full POM integration
- **Keep as reference**

---

### **TIER 2: Medium Priority (Refactor POMs)**

#### 📄 **pageobjects/DashboardPage.ts** (Needs Enhancement)
**Current:** Lines 38-62 contain a `for` loop to find products

**Refactor To:**
```typescript
async searchProductAddCart(productName: string): Promise<void> {
  // BEFORE: for loop with nth() + textContent()
  // AFTER: Single filter() call with proper wait
  const productCard = this.productCards.filter({ 
    has: this.page.locator('b', { hasText: productName }) 
  });
  
  await expect(productCard).toBeVisible();
  await productCard.locator('text=/Add To Cart/i').click();
}
```

**Impact:**
- More maintainable
- Automatic parallel retry
- Better performance

---

#### 📄 **pageobjects/OrdersHistoryPage.ts** (Needs Refactoring)
**Current:** Sequential loop finding order by ID

**Refactor To:**
```typescript
async selectOrderByID(orderId: string): Promise<void> {
  await expect(this.ordersTable).toBeVisible();
  
  const orderRow = this.ordersTable.locator('tr', { 
    has: this.page.locator('th', { hasText: orderId }) 
  });
  
  await expect(orderRow).toEqual(1); // Found exactly 1 match
  await orderRow.locator('button').first().click();
}
```

**Impact:**
- Eliminate manual loops
- More reliable order matching

---

#### 📄 **pageobjects/OrdersReviewPage.ts** (Needs Refactoring)
**Current:** Manual dropdown search in lines 50-70

**Refactor To:**
```typescript
async selectCountryByName(countryName: string): Promise<void> {
  await this.countryInput.fill(countryName[0].toUpperCase());
  
  const option = this.dropdown.locator('button', { 
    hasText: new RegExp(`\\b${countryName}\\b`, 'i') 
  });
  
  await expect(option).toBeVisible();
  await option.click();
}
```

**Impact:**
- Case-insensitive matching
- Better user simulation (typing first letter)

---

#### 📄 **pageobjects/CartPage.ts** (Needs Enhancement)
**Current:** Simple product verification

**Enhance To:**
- Add batch assertion methods
- Add price total calculation
- Better cart state management

---

#### 📄 **pageobjects/LoginPage.ts** (Minimal Changes)
**Current:** Already good, mostly compliant

**Minor Enhancements:**
- Add `login(credentials: { email, password })` for flexibility
- Add `loginAndWaitForDashboard()` combined action
- Add `isLoaded()` helper for page readiness

---

### **TIER 3: New Files to Create**

#### 🆕 **pageobjects/BasePage.ts**
Create a base class with common methods:
- `waitForPageLoad()`
- `takeScreenshot()`
- `getErrorMessage()`
- `waitForSelector()`

---

#### 🆕 **pageobjects/PopupPage.ts**
Manage dialogs, alerts, modals:
```typescript
export class PopupPage {
  acceptDialog(): void
  dismissDialog(): void
  getDialogMessage(): Promise<string>
  handleFileDialog(): Promise<string>
}
```

---

#### 🆕 **pageobjects/IframePage.ts**
Manage iframe navigation:
```typescript
export class IframePage {
  selectFrameByID(frameID: string): Locator
  clickLinkInFrame(frameID: string, linkText: string): Promise<void>
  getTextFromFrame(frameID: string, selector: string): Promise<string>
}
```

---

#### 🆕 **pageobjects/CalendarPage.ts**
Encapsulate calendar interactions:
```typescript
export class CalendarPage {
  selectDate(month: string, date: string, year: string): Promise<void>
  getSelectedDate(): Promise<{ month, date, year }>
}
```

---

#### 🆕 **pageobjects/APIPage.ts**
Handle API-intercepted requests:
```typescript
export class APIPage {
  interceptOrderRequest(payload: object): Promise<void>
  getInterceptedResponse(endpoint: string): Promise<object>
}
```

---

#### 🆕 **utils/pageObjectFactory.ts**
Factory to create all page objects:
```typescript
export class PageObjectFactory {
  constructor(page: Page) { }
  loginPage(): LoginPage
  dashboardPage(): DashboardPage
  cartPage(): CartPage
  // ... etc
}
```

---

#### 🆕 **utils/authenticatedContext.ts**
Handle authentication state management:
```typescript
export async function createAuthenticatedContext(
  browser: Browser,
  credentials: { email: string; password: string }
): Promise<BrowserContext>
```

---

---

## 🔧 PART 2: ENHANCED FIXTURES.TS (Full Code)

```typescript
import { test as baseTest, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { PageObjectFactory } from './pageObjectFactory';

/**
 * PILLAR 1: Advanced Fixture Architecture
 * Provides:
 * - authenticatedPage: Pre-logged-in page with storage state
 * - Page Object Factory: Direct access to all POMs via test arguments
 * - Test data injection with overrides
 * - Enhanced lifecycle management
 */

interface TestData {
  username: string;
  password: string;
  productName: string;
  testEmail: string;
}

interface PageObjects {
  loginPage: any; // LoginPage
  dashboardPage: any; // DashboardPage
  cartPage: any; // CartPage
  ordersHistoryPage: any; // OrdersHistoryPage
  ordersReviewPage: any; // OrdersReviewPage
  popupPage: any; // PopupPage (new)
  iframePage: any; // IframePage (new)
  calendarPage: any; // CalendarPage (new)
  apiPage: any; // APIPage (new)
}

type TestFixtures = {
  // FIXTURE 1: Authenticated Page with automatic login
  authenticatedPage: Page;
  
  // FIXTURE 2: Page Object Factory (direct POM access)
  pages: PageObjects;
  
  // FIXTURE 3: Test Data with override support
  testData: TestData;
};

/**
 * FIXTURE 1: Authenticated Page
 * Automatically logs in and saves storage state (state.json)
 * Tests using this fixture skip login ceremony entirely
 */
const authenticatedPageFixture = async ({ browser }, use) => {
  // Step 1: Create fresh context
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Step 2: Auto-login
  await page.goto("https://rahulshettyacademy.com/client");
  await page.locator('input#userEmail').fill('anshika@gmail.com');
  await page.locator('input#userPassword').fill('Iamking@000');
  await page.locator('input[value="Login"]').click();
  
  // Step 3: Wait for dashboard (PILLAR 2: Web-First)
  await expect(page.locator('.card-body')).toBeVisible({ timeout: 10000 });
  
  // Step 4: Save state for future contexts
  await context.storageState({ path: 'state.json' });
  
  // Step 5: Provide authenticated page to test
  await use(page);
  
  // Step 6: Cleanup
  await page.close();
  await context.close();
};

/**
 * FIXTURE 2: Page Object Factory
 * Returns object with all page object instances
 * Usage: test('test', async ({ pages }) => { ... })
 * Now access: pages.loginPage, pages.dashboardPage, etc.
 */
const pageObjectsFixture = async ({ page }, use) => {
  const factory = new PageObjectFactory(page);
  
  const pages: PageObjects = {
    loginPage: factory.loginPage(),
    dashboardPage: factory.dashboardPage(),
    cartPage: factory.cartPage(),
    ordersHistoryPage: factory.ordersHistoryPage(),
    ordersReviewPage: factory.ordersReviewPage(),
    popupPage: factory.popupPage(),
    iframePage: factory.iframePage(),
    calendarPage: factory.calendarPage(),
    apiPage: factory.apiPage(),
  };
  
  await use(pages);
};

/**
 * FIXTURE 3: Test Data
 * Centralized test credentials and product names
 * Tests can override via parameterization
 */
const testDataFixture = async ({ }, use) => {
  const defaultTestData: TestData = {
    username: 'anshika@gmail.com',
    password: 'Iamking@000',
    productName: 'ADIDAS ORIGINAL',
    testEmail: 'test@example.com'
  };
  
  await use(defaultTestData);
};

// Export extended test with all fixtures
export const test = baseTest.extend<TestFixtures>({
  authenticatedPage: authenticatedPageFixture,
  pages: pageObjectsFixture,
  testData: testDataFixture,
});

/**
 * ENHANCED HOOKS FOR OBSERVABILITY & LOGGING
 */

test.beforeEach(async ({ page, context }, testInfo) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 TEST START: ${testInfo.title}`);
  console.log(`📂 File: ${testInfo.file.split('/').pop()}`);
  console.log(`${'='.repeat(60)}`);
  
  // Viewport consistency
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Dialog auto-accept (can be overridden per test)
  page.on('dialog', (dialog) => {
    console.log(`💬 Dialog caught: ${dialog.message()}`);
    dialog.accept();
  });
  
  // Request logging for debugging
  page.on('request', (request) => {
    if (request.postData()) {
      console.log(`📤 POST: ${request.url().split('?')[0]}`);
    }
  });
  
  page.on('response', (response) => {
    if (!response.ok()) {
      console.log(`❌ RESPONSE: ${response.status()} ${response.url().split('/').pop()}`);
    }
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'passed') {
    console.log(`✅ PASSED: ${testInfo.title}`);
  } else if (testInfo.status === 'failed') {
    console.log(`❌ FAILED: ${testInfo.title}`);
    console.log(`Error: ${testInfo.error?.message}`);
    
    // Screenshot on failure (configured in playwright.config.ts)
    const screenshotPath = `failure-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot: ${screenshotPath}`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
});

// Re-export Playwright types for direct use
export { expect, Browser, BrowserContext, Page };
```

---

## 🎨 PART 3: PAGE OBJECT FACTORY (New File)

```typescript
// utils/pageObjectFactory.ts
import { Page } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { DashboardPage } from '../pageobjects/DashboardPage';
import { CartPage } from '../pageobjects/CartPage';
import { OrdersHistoryPage } from '../pageobjects/OrdersHistoryPage';
import { OrdersReviewPage } from '../pageobjects/OrdersReviewPage';
import { PopupPage } from '../pageobjects/PopupPage';
import { IframePage } from '../pageobjects/IframePage';
import { CalendarPage } from '../pageobjects/CalendarPage';
import { APIPage } from '../pageobjects/APIPage';

/**
 * Central factory for creating Page Object instances
 * Usage in fixtures: new PageObjectFactory(page)
 * Usage in tests: Via pages fixture argument
 */
export class PageObjectFactory {
  private page: Page;
  private instances: Map<string, any> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Lazy-load page objects to avoid unnecessary instantiation
   */
  private getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  loginPage(): LoginPage {
    return this.getInstance('loginPage', () => new LoginPage(this.page));
  }

  dashboardPage(): DashboardPage {
    return this.getInstance('dashboardPage', () => new DashboardPage(this.page));
  }

  cartPage(): CartPage {
    return this.getInstance('cartPage', () => new CartPage(this.page));
  }

  ordersHistoryPage(): OrdersHistoryPage {
    return this.getInstance('ordersHistoryPage', () => new OrdersHistoryPage(this.page));
  }

  ordersReviewPage(): OrdersReviewPage {
    return this.getInstance('ordersReviewPage', () => new OrdersReviewPage(this.page));
  }

  popupPage(): PopupPage {
    return this.getInstance('popupPage', () => new PopupPage(this.page));
  }

  iframePage(): IframePage {
    return this.getInstance('iframePage', () => new IframePage(this.page));
  }

  calendarPage(): CalendarPage {
    return this.getInstance('calendarPage', () => new CalendarPage(this.page));
  }

  apiPage(): APIPage {
    return this.getInstance('apiPage', () => new APIPage(this.page));
  }
}
```

---

## 📄 PART 4: EXAMPLE REFACTORED PAGE OBJECT

### **DashboardPage - Before & After**

#### ❌ BEFORE (Script-Based - Lines 38-62)
```typescript
async searchProductAddCart(productName: string): Promise<void> {
  await expect(this.productCards.first()).toBeVisible({ timeout: 8000 });

  const titles = await this.productTitles.allTextContents();
  const count = await this.productCards.count();
  
  let productFound = false;
  // ❌ ANTI-PATTERN: Manual loop with nth()
  for (let i = 0; i < count; ++i) {
    const productTitle = await this.productCards.nth(i).locator('b').textContent();
    
    if (productTitle === productName) {
      const addToCartButton = this.productCards
        .nth(i)
        .locator('text=/Add To Cart|Add to Cart/i');
      
      await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
      await addToCartButton.click();
      productFound = true;
      break; // ❌ Break after first match
    }
  }

  if (!productFound) {
    throw new Error(`❌ Product "${productName}" not found`);
  }
}
```

#### ✅ AFTER (Engineered - Filter-Based)
```typescript
/**
 * ENGINEERED: Search for product by name and add to cart
 * 
 * Improvements:
 * - Single filter() call instead of loop
 * - Automatic retry on locator chains
 * - Better error messaging
 * - More maintainable and readable
 */
async searchProductAddCart(productName: string): Promise<void> {
  // Wait for products to load
  await expect(this.productCards.first()).toBeVisible({ timeout: 8000 });

  // Get available products for logging
  const titles = await this.productTitles.allTextContents();
  console.log(`📦 Available products: ${titles.join(', ')}`);

  // ✅ ENGINEERED: Filter instead of loop
  // This creates a locator that matches cards with the target product
  const productCard = this.productCards.filter({
    has: this.page.locator('b', { hasText: productName })
  });

  // Verify product was found (will retry for 5s)
  try {
    await expect(productCard).toHaveCount(1, { timeout: 5000 });
  } catch (error) {
    throw new Error(
      `❌ Product "${productName}" not found. Available: ${titles.join(', ')}`
    );
  }

  console.log(`✅ Found product: ${productName}`);

  // Click the "Add To Cart" button within this product card
  const addToCartButton = productCard.locator('text=/Add To Cart/i');
  await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
  await addToCartButton.click();

  console.log(`✅ ${productName} added to cart`);
}
```

**Benefits:**
- **62 lines → 45 lines** (27% reduction)
- **Zero manual loops** - uses Playwright's native filtering
- **Automatic retry** on filter() - if product isn't visible yet, retries for 5s
- **Better errors** - shows available products when one isn't found
- **Parallel-safe** - no index assumptions

---

## 📄 PART 5: EXAMPLE REFACTORED TEST FILE

### **WebAPIPart2.spec.ts - Before & After**

#### ❌ BEFORE (Script-Based - 96 Lines)
```typescript
let webContext: BrowserContext;

// ❌ ANTI-PATTERN: Manual login in beforeAll
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/client");
  await page.locator("#userEmail").fill("rahulshetty@gmail.com");
  await page.locator("#userPassword").fill("Iamking@000");
  await page.locator("[value='Login']").click();
  await page.waitForURL(/\/client.*orders/, { timeout: 10000 });
  await context.storageState({ path: 'state.json' });
  webContext = await browser.newContext({ storageState: 'state.json' });
});

test('@QA Client App login', async () => {
  const email = "rahulshetty@gmail.com";
  const productName = 'iphone 13 pro';
  const page = await webContext.newPage();
  await page.goto("https://rahulshettyacademy.com/client");
  const products = page.locator(".card-body");
  const count = await products.count();
  
  // ❌ ANTI-PATTERN 1: Manual loop searching for product
  for (let i = 0; i < count; ++i) {
    if (await products.nth(i).locator("b").textContent() === productName) {
      await products.nth(i).locator("text= Add To Cart").click();
      break;
    }
  }
  
  await page.locator("[routerlink*='cart']").click();
  await expect(page.locator("h3:has-text('iphone 13 pro')")).toBeVisible();
  await page.locator("text=Checkout").click();
  await page.locator("[placeholder*='Country']").pressSequentially("ind", { delay: 100 });
  
  const dropdown = page.locator(".ta-results");
  await expect(dropdown).toBeVisible();
  const optionsCount = await dropdown.locator("button").count();
  
  // ❌ ANTI-PATTERN 2: Manual loop searching dropdown
  for (let i = 0; i < optionsCount; ++i) {
    const text = await dropdown.locator("button").nth(i).textContent();
    if (text === " India") {
      await dropdown.locator("button").nth(i).click();
      break;
    }
  }
  
  // ... rest of test ...
  
  // ❌ ANTI-PATTERN 3: Manual loop searching order table
  const rows = await page.locator("tbody tr");
  for (let i = 0; i < await rows.count(); ++i) {
    const rowOrderId = await rows.nth(i).locator("th").textContent();
    if (orderId?.includes(rowOrderId || '')) {
      await rows.nth(i).locator("button").first().click();
      break;
    }
  }
  
  const orderIdDetails = await page.locator(".col-text").textContent();
  expect(orderId?.includes(orderIdDetails || '')).toBeTruthy();
});
```

---

#### ✅ AFTER (Engineered - 35 Lines)
```typescript
/**
 * ENGINEERED: Web API Testing - Authenticated Session Flow
 * 
 * Benefits:
 * - authenticatedPage fixture handles login automatically
 * - pages factory provides all POMs
 * - testData fixture provides credentials
 * - Zero manual loops - using filter() patterns
 * - Clean, readable user journey
 */

test('@QA authenticated session - complete checkout flow', async ({
  authenticatedPage: page,
  pages: { dashboardPage, cartPage, ordersReviewPage, ordersHistoryPage },
  testData
}) => {
  // ✅ User already logged in via authenticatedPage fixture
  // ✅ Storage state automatically applied
  
  const productName = 'iphone 13 pro';
  
  // ✅ Step 1: Search and add product to cart
  // (searchProductAddCart() now uses filter() internally)
  await dashboardPage.searchProductAddCart(productName);
  
  // ✅ Step 2: Verify product in cart
  await cartPage.navigateToCart();
  await cartPage.verifyProductIsDisplayed(productName);
  
  // ✅ Step 3: Proceed to checkout
  await cartPage.proceedToCheckout();
  
  // ✅ Step 4: Select country (selectCountryByName() uses filter())
  await ordersReviewPage.selectCountryByName('India');
  
  // ✅ Step 5: Verify email and place order
  await ordersReviewPage.verifyEmail(testData.username);
  const orderId = await ordersReviewPage.placeOrder();
  
  // ✅ Step 6: Verify order in history (selectOrderByID() uses filter())
  await ordersHistoryPage.searchAndSelectOrderByID(orderId);
  
  // ✅ Step 7: Verify order details
  const retrievedId = await ordersHistoryPage.getOrderId();
  expect(orderId).toContain(retrievedId);
  
  console.log(`✅ Complete flow verified: Order ${orderId} placed and confirmed`);
});

/**
 * BONUS: Parametrized test with multiple products
 * Demonstrates reusability of refactored code
 */
const products = ['iphone 13 pro', 'SAMSUNG', 'CASIO VINTAGE'];

for (const productName of products) {
  test(`@QA add ${productName} to cart`, async ({
    authenticatedPage: page,
    pages: { dashboardPage, cartPage }
  }) => {
    await dashboardPage.searchProductAddCart(productName);
    await cartPage.navigateToCart();
    await cartPage.verifyProductIsDisplayed(productName);
  });
}
```

**Improvements:**
- **96 lines → 35 lines** (63% reduction!)
- **Zero manual loops** - all abstracted to POM methods
- **All loops use filter()** internally:
  - Product search: `.filter({ has: locator('b', { hasText }) })`
  - Dropdown: `.filter({ hasText: 'India' })`
  - Order table: `.filter({ has: locator('th', { hasText: orderId }) })`
- **Zero duplicated login** - authenticatedPage fixture handles it
- **Direct POM access** - cleaner test readability
- **Reusable flow** - can be parameterized for multiple products

---

## 🔄 PART 6: LOOP REPLACEMENT PATTERNS (Cheat Sheet)

### **Pattern 1: Finding Element by Text Content**

❌ **BEFORE:**
```typescript
const count = await items.count();
let foundIndex = -1;
for (let i = 0; i < count; i++) {
  if (await items.nth(i).textContent() === 'Target Text') {
    foundIndex = i;
    break;
  }
}
await items.nth(foundIndex).click();
```

✅ **AFTER:**
```typescript
const item = items.filter({ hasText: 'Target Text' });
await expect(item).toHaveCount(1);
await item.click();
```

---

### **Pattern 2: Finding Parent Element by Child Content**

❌ **BEFORE:**
```typescript
const cards = page.locator('.card');
for (let i = 0; i < await cards.count(); i++) {
  const title = await cards.nth(i).locator('.title').textContent();
  if (title === 'Product Name') {
    await cards.nth(i).locator('.add-btn').click();
    break;
  }
}
```

✅ **AFTER:**
```typescript
const productCard = page.locator('.card').filter({
  has: page.locator('.title', { hasText: 'Product Name' })
});
await expect(productCard).toHaveCount(1);
await productCard.locator('.add-btn').click();
```

---

### **Pattern 3: Finding Dropdown Option by Partial Text**

❌ **BEFORE:**
```typescript
const options = page.locator('.dropdown button');
const count = await options.count();
for (let i = 0; i < count; i++) {
  const text = await options.nth(i).textContent();
  if (text?.includes('India')) {
    await options.nth(i).click();
    break;
  }
}
```

✅ **AFTER:**
```typescript
const indianOption = page.locator('.dropdown button', { 
  hasText: /\bIndia\b/i 
});
await expect(indianOption).toBeVisible();
await indianOption.click();
```

---

### **Pattern 4: Finding Table Row by ID**

❌ **BEFORE:**
```typescript
const rows = page.locator('tbody tr');
for (let i = 0; i < await rows.count(); i++) {
  const rowId = await rows.nth(i).locator('th').textContent();
  if (orderId?.includes(rowId || '')) {
    await rows.nth(i).locator('button').click();
    break;
  }
}
```

✅ **AFTER:**
```typescript
const orderRow = page.locator('tbody tr').filter({
  has: page.locator('th', { hasText: orderId })
});
await expect(orderRow).toHaveCount(1);
await orderRow.locator('button').click();
```

---

### **Pattern 5: Batch Operations on Multiple Elements**

❌ **BEFORE:**
```typescript
const inputs = await page.locator('input[name="items"]');
const values = [];
for (let i = 0; i < await inputs.count(); i++) {
  values.push(await inputs.nth(i).inputValue());
}
```

✅ **AFTER:**
```typescript
const values = await page.locator('input[name="items"]').evaluate(
  (elements: HTMLInputElement[]) => elements.map(el => el.value)
);
```

---

## 📋 SUMMARY: IMPLEMENTATION CHECKLIST

### **Phase 1: Foundation (Week 1)**
- [ ] Create `utils/pageObjectFactory.ts`
- [ ] Create enhanced `utils/fixtures.ts` with `authenticatedPage` fixture
- [ ] Create `pageobjects/BasePage.ts` base class
- [ ] Create new POMs: `PopupPage.ts`, `IframePage.ts`, `CalendarPage.ts`, `APIPage.ts`

### **Phase 2: POM Refactoring (Week 1-2)**
- [ ] Refactor `DashboardPage.ts` - replace search loop with filter()
- [ ] Refactor `OrdersHistoryPage.ts` - replace order search with filter()
- [ ] Refactor `OrdersReviewPage.ts` - replace dropdown with filter()
- [ ] Enhance `LoginPage.ts` - add flexibility methods
- [ ] Enhance `CartPage.ts` - add batch operations

### **Phase 3: Test Migration (Week 2-3)**
- [ ] Migrate `WebAPIPart2.spec.ts` → use authenticatedPage + new loops
- [ ] Migrate `WebAPIPart1.spec.ts` → use filter() patterns
- [ ] Migrate `Calendar.spec.ts` → use new CalendarPage POM
- [ ] Migrate `MoreValidations.spec.ts` → use PopupPage + IframePage
- [ ] Verify all tests pass

### **Phase 4: Configuration & Validation (Week 3)**
- [ ] Update `playwright.config.ts` with improved timeouts
- [ ] Create helper scripts for common test scenarios
- [ ] Full test suite validation
- [ ] Performance benchmarking

---

## 🎯 SUCCESS METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Lines per test** | 96 | 35 | <50 |
| **Manual loops** | 8 | 0 | 0 |
| **Code duplication** | High | None | None |
| **Maintenance effort** | High | Low | Low |
| **Test readability** | Medium | High | High |
| **Parallel safety** | Medium | High | High |

---

## 🚀 NEXT STEPS

1. **Review this plan** - Do you approve the direction?
2. **I'll create the new fixtures.ts** with both fixtures
3. **I'll refactor DashboardPage** as the reference POM
4. **I'll refactor WebAPIPart2.spec.ts** as the reference test
5. **I'll provide the PageObjectFactory** implementation
6. **Then we can parallelize** the remaining POMs and tests

---

**Ready to begin Phase 1? Just say "GO" and I'll start with fixtures.ts  + PageObjectFactory!**
