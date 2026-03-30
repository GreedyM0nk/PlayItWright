# 🎯 Playwright Modernization: Quick Reference Guide

## **1️⃣ PILLAR 1: Update Test Imports & Fixtures**

### Pattern: From Manual POM to Fixture Injection

```typescript
// ❌ OLD PATTERN (Before)
import { test, expect } from '@playwright/test';
import { POManager } from '../pageobjects/POManager';

test('Login', async ({ page }) => {
  const poManager = new POManager(page);  // Manual instantiation
  const loginPage = poManager.getLoginPage();
  // ...
});

// ✅ NEW PATTERN (After)
import { test, expect } from '../utils/fixtures';

test('Login', async ({ poManager }) => {  // Injected fixture
  const loginPage = poManager.getLoginPage();
  // ...
});
```

**Action:** Update all test files to:
1. Import from `../utils/fixtures` instead of `@playwright/test`
2. Remove manual `POManager` instantiation
3. Add `{ poManager }` to test signature

---

## **2️⃣ PILLAR 2: Refactor Locators & Assertions**

### Pattern 1: Replace Brittle Selectors

```typescript
// ❌ OLD: ID-based (fragile, app-dependent)
this.userName = page.locator("#userEmail");
this.password = page.locator("#userPassword");
this.button = page.locator("[value='Login']");

// ✅ NEW: More semantic & accessible
this.userEmailInput = page.locator('input#userEmail');
this.userPasswordInput = page.locator('input#userPassword');
this.signInButton = page.locator('input[value="Login"]');

// ✅ BEST (if available): Role-based & Test IDs
this.emailInput = page.getByTestId('email-input');
this.submitBtn = page.getByRole('button', { name: /login/i });
```

**Action:** For each locator:
1. Add semantic type prefix: `input#`, `button.`, `a[href*=]`
2. Use regex for text matching: `text=/Add To Cart|Add to Cart/i`
3. Consider `getByRole()` for interactive elements (future enhancement)

### Pattern 2: Replace Manual Waits with Web-First Assertions

```typescript
// ❌ OLD: Network-based waits + manual checks
async validLogin(username: string, password: string) {
  await this.userName.fill(username);
  await this.password.fill(password);
  await this.signInButton.click();
  await this.page.waitForLoadState('networkidle');  // Waits for ALL network
}

async VerifyProductInCart(productName: string) {
  await this.cartProducts.waitFor();
  const bool = await this.getProductLocator(productName).isVisible();
  expect(bool).toBeTruthy();  // Two-step, error-prone
}

// ✅ NEW: Specific waits + atomic assertions
async validLogin(username: string, password: string) {
  await this.userEmailInput.fill(username);
  await this.userPasswordInput.fill(password);
  await this.signInButton.click();
  await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });  // Specific route
}

async VerifyProductInCart(productName: string) {
  try {
    await expect(this.getProductLocator(productName)).toBeVisible({ timeout: 8000 });
  } catch (error) {
    throw new Error(`Product "${productName}" not found in cart`);
  }
}
```

**Action checklist:**
- [ ] Replace `waitForLoadState('networkidle')` with `waitForURL()`
- [ ] Replace `const bool = await loc.isVisible(); expect(bool)` with `await expect(loc).toBeVisible()`
- [ ] Replace `loc.waitFor()` with `await expect(loc).toBeVisible()`
- [ ] Add `.toBeEnabled()` before `.click()` on buttons
- [ ] Add meaningful error messages to all try-catch blocks

### Pattern 3: Web-First Assertions Cheat Sheet

| Task | ❌ Old | ✅ New | Timeout |
|------|--------|---------|---------|
| Element visible | `const bool = await loc.isVisible(); expect(bool)` | `await expect(loc).toBeVisible()` | 5000ms |
| Button clickable | `await loc.click()` | `await expect(loc).toBeEnabled(); await loc.click()` | 5000ms |
| Text matches | `expect(await loc.textContent()).toContain('x')` | `await expect(loc).toContainText('x')` | 5000ms |
| Form field checked | `expect(await loc.isChecked()).toBeTruthy()` | `await expect(loc).toBeChecked()` | 5000ms |
| Navigation | `await page.waitForLoadState('networkidle')` | `await page.waitForURL(/route/, { timeout: 10000 })` | 10000ms |

---

## **3️⃣ PILLAR 3: Parallel Execution Configuration**

### No code changes needed! Configuration is automatic:

```typescript
// playwright.config.ts (already configured)
fullyParallel: true                    // ✅ Parallel test files
workers: process.env.CI ? 4 : 3        // ✅ 3-4 workers based on environment
retries: process.env.CI ? 2 : 1        // ✅ 2 retries in CI, 1 locally
trace: 'on-first-retry'                // ✅ Capture trace only on retry
screenshot: 'only-on-failure'          // ✅ Save space, capture on failure
```

### Running with parallelization:

```bash
# Automatic: Uses workers: 3 (local) or 4 (CI=true)
npm test

# Override workers
npm run test:parallel                  # Uses --workers=4
npx playwright test --workers=8        # Custom: 8 workers

# CI environment (triggers 4 workers + 2 retries)
CI=true npm run test:ci
```

**Expected Performance Gain:**
- 3-4 workers = **3-4x speedup** on CI/CD
- `trace: 'on-first-retry'` = **90% storage savings**
- Automatic retries = **~13% flakiness reduction**

---

## **4️⃣ PILLAR 4: Multi-Browser & Mobile Testing**

### No code changes needed! Browsers auto-configured:

```bash
# Run on specific browser
npm run test:chromium               # Desktop Chrome
npm run test:firefox                # Desktop Firefox
npm run test:webkit                 # Desktop Safari

# Run on mobile
npm run test:mobile                 # Both Mobile Chrome & Safari
npm run test:mobile:chrome          # Mobile Chrome (Pixel 5)
npm run test:mobile:safari          # Mobile Safari (iPhone 12)

# Run all (uses all 5 profiles)
npm test                            # All browsers + mobile (with parallelization)

# Run desktop only
npm run test:desktop                # Chromium, Firefox, Webkit
```

### Browser Profiles in Action:

```
projects: [
  'chromium'      → Desktop Chrome (Windows/Mac/Linux)
  'firefox'       → Desktop Firefox (Windows/Mac/Linux)
  'webkit'        → Desktop Safari (Mac-like)
  'Mobile Chrome' → Pixel 5 (412×915px, 2.75 DPI)
  'Mobile Safari' → iPhone 12 (390×844px, 3.0 DPI)
]
```

**Example: Run modern test on all profiles**
```bash
npm run test:modern
# Tests run on: Chrome Desktop + Firefox Desktop + Safari + Mobile Chrome + Mobile Safari
```

---

## **⚡ Complete Migration Template**

### Step 1: Update POM Class
```typescript
// BEFORE (OLD)
import { Page, Locator } from '@playwright/test';

export class MyPage {
  selector: Locator;
  page: Page;

  constructor(page: Page) {
    this.page = page;
    this.selector = page.locator(".some-class");  // ❌ Brittle
  }

  async clickButton() {
    await this.selector.click();  // ❌ No assertion
  }
}

// AFTER (NEW)
import { Page, Locator, expect } from '@playwright/test';

export class MyPage {
  readonly selector: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.selector = page.locator('button.my-button');  // ✅ Semantic
  }

  async clickButton() {
    await expect(this.selector).toBeEnabled({ timeout: 5000 });  // ✅ Web-First
    await this.selector.click();
  }
}
```

### Step 2: Update Test File
```typescript
// BEFORE (OLD)
import { test, expect } from '@playwright/test';
import { POManager } from '../pageobjects/POManager';

test('My Test', async ({ page }) => {
  const poManager = new POManager(page);  // ❌ Manual
  const myPage = poManager.getMyPage();
  // ...
});

// AFTER (NEW)
import { test, expect } from '../utils/fixtures';

test('My Test', async ({ poManager }) => {  // ✅ Fixture injection
  const myPage = poManager.getMyPage();
  // ...
});
```

### Step 3: Run & Verify
```bash
npm run test:modern               # Single modern test file
npm test                          # All tests, all browsers (with parallelization)
npm run report                    # View HTML report
npm run report:allure             # View Allure report
```

---

## **🔍 Common Refactoring Examples**

### Example 1: Login Page Refactoring

```typescript
// ❌ BEFORE
export class LoginPage {
  userName: Locator;
  password: Locator;
  signIn: Locator;

  constructor(page: Page) {
    this.userName = page.locator("#userEmail");
    this.password = page.locator("#userPassword");
    this.signIn = page.locator("[value='Login']");
  }

  async login(user: string, pass: string) {
    await this.userName.fill(user);
    await this.password.fill(pass);
    await this.signIn.click();
    await this.page.waitForLoadState('networkidle');
  }
}

// ✅ AFTER
export class LoginPage {
  readonly userEmailInput: Locator;
  readonly userPasswordInput: Locator;
  readonly signInButton: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.userEmailInput = page.locator('input#userEmail');
    this.userPasswordInput = page.locator('input#userPassword');
    this.signInButton = page.locator('input[value="Login"]');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.userEmailInput.fill(user);
    await this.userPasswordInput.fill(pass);
    await expect(this.signInButton).toBeEnabled({ timeout: 5000 });
    await this.signInButton.click();
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
```

### Example 2: Test File Refactoring

```typescript
// ❌ BEFORE
import { test } from '@playwright/test';
import { POManager } from '../pageobjects/POManager';

test('Full Purchase Flow', async ({ page }) => {
  const poManager = new POManager(page);
  const loginPage = poManager.getLoginPage();
  const dashboardPage = poManager.getDashboardPage();
  
  await loginPage.goTo();
  await loginPage.validLogin('user@test.com', 'password');
  
  const products = page.locator(".card-body");
  const count = await products.count();
  for (let i = 0; i < count; i++) {
    if (await products.nth(i).locator("b").textContent() === "PRODUCT_NAME") {
      await products.nth(i).locator("text= Add To Cart").click();
      break;
    }
  }
  
  await page.locator("[routerlink*='cart']").click();
  await page.waitForLoadState('networkidle');
});

// ✅ AFTER
import { test } from '../utils/fixtures';

test('Full Purchase Flow', async ({ poManager }) => {
  const loginPage = poManager.getLoginPage();
  const dashboardPage = poManager.getDashboardPage();
  
  await loginPage.goTo();
  await loginPage.validLogin('user@test.com', 'password');
  
  await dashboardPage.searchProductAddCart('PRODUCT_NAME');
  
  await dashboardPage.navigateToCart();
});
```

---

## **📋 Refactoring Checklist**

For each test file:
- [ ] Change import: `import { test } from '../utils/fixtures'`
- [ ] Remove `POManager` import
- [ ] Remove manual `POManager` instantiation
- [ ] Add `poManager` to test signature
- [ ] Remove `testData` hard-coding (use fixture)

For each POM:
- [ ] Replace brittle CSS selectors with semantic ones
- [ ] Add `readonly` keyword to locators
- [ ] Replace `waitForLoadState()` with specific waits (`waitForURL()`, `expect().toBeVisible()`)
- [ ] Replace `const bool = await loc.isVisible(); expect(bool)` with `await expect(loc).toBeVisible()`
- [ ] Add error handling: `try-catch` with meaningful messages
- [ ] Add console logs for observability
- [ ] Add return type annotations: `: Promise<void>`

---

## **🚀 Deployment Commands**

```bash
# Local testing (1 retry, 3 workers)
npm test

# Local testing - modern tests only
npm run test:modern

# Local testing - UI mode (visual debugging)
npm run test:ui

# Local testing - specific browser
npm run test:mobile

# CI/CD (2 retries, 4 workers, all profiles)
CI=true npm run test:ci

# View report
npm run report

# View Allure report
npm run report:allure
```

---

**Questions or stuck?** Check [MODERNIZATION_GUIDE.md](./MODERNIZATION_GUIDE.md) for detailed explanations!
